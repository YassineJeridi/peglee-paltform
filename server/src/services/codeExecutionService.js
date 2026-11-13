const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const env = require('../config/env');

const MAX_OUTPUT_BYTES = 64 * 1024;
const MAX_CODE_LENGTH = 20000;
const MAX_INPUT_LENGTH = 5000;
const RUNNER = path.join(__dirname, 'sandbox', 'runner.py');

const normalize = (s) => String(s ?? '').replace(/\r\n/g, '\n').replace(/\s+$/, '');

async function runWithPiston(code, input) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.codeExecution.timeoutMs + 5000);
  try {
    const res = await fetch(`${env.codeExecution.pistonUrl}/api/v2/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: 'python',
        version: '*',
        files: [{ name: 'main.py', content: code }],
        stdin: input,
        run_timeout: env.codeExecution.timeoutMs,
        run_memory_limit: 256 * 1024 * 1024,
      }),
    });
    if (!res.ok) throw new Error(`Piston a répondu ${res.status}`);
    const data = await res.json();
    const run = data.run || {};
    return {
      stdout: (run.stdout || '').slice(0, MAX_OUTPUT_BYTES),
      stderr: (run.stderr || '').slice(0, MAX_OUTPUT_BYTES),
      timedOut: run.signal === 'SIGKILL' && !run.stdout && /time/i.test(run.message || run.stderr || ''),
      exitCode: run.code,
    };
  } finally {
    clearTimeout(timer);
  }
}

// Moteur local : sous-processus Python isolé (répertoire temporaire, environnement
// vide, limites CPU/fichiers/mémoire, délai strict). NE FOURNIT PAS d'isolation
// réseau/système de fichiers : réservé au développement (cf. config/env.js).
async function runLocal(code, input) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pyrun-'));
  try {
    await fs.writeFile(path.join(dir, 'main.py'), code, { mode: 0o600 });
    return await new Promise((resolve) => {
      const child = spawn('python3', ['-I', RUNNER], {
        cwd: dir,
        env: { PATH: '/usr/bin:/usr/local/bin:/opt/homebrew/bin', PYTHONIOENCODING: 'utf-8' },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;
      const append = (buf, chunk) =>
        buf.length >= MAX_OUTPUT_BYTES ? buf : (buf + chunk.toString('utf8')).slice(0, MAX_OUTPUT_BYTES);

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, env.codeExecution.timeoutMs);

      child.stdout.on('data', (c) => (stdout = append(stdout, c)));
      child.stderr.on('data', (c) => (stderr = append(stderr, c)));
      child.stdin.on('error', () => {});
      child.stdin.end(input);
      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({ stdout: '', stderr: `Exécution impossible : ${err.message}`, timedOut: false, exitCode: -1 });
      });
      child.on('close', (exitCode) => {
        clearTimeout(timer);
        resolve({ stdout, stderr, timedOut, exitCode });
      });
    });
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function runPython(code, input = '') {
  if (typeof code !== 'string' || code.length > MAX_CODE_LENGTH) {
    return { stdout: '', stderr: 'Code trop long.', timedOut: false, exitCode: -1 };
  }
  const stdin = String(input).slice(0, MAX_INPUT_LENGTH);
  switch (env.codeExecution.engine) {
    case 'piston':
      return runWithPiston(code, stdin);
    case 'local':
      return runLocal(code, stdin);
    default: {
      const err = new Error("L'exécution de code est désactivée.");
      err.code = 'ENGINE_DISABLED';
      throw err;
    }
  }
}

/** Exécute `code` contre chaque cas de test. Ne renvoie jamais la solution de référence. */
async function runTests(code, tests) {
  const results = [];
  for (const t of tests) {
    const out = await runPython(code, t.input);
    const actual = normalize(out.stdout);
    results.push({
      input: t.input,
      expected: normalize(t.expectedOutput),
      actual,
      passed: !out.timedOut && out.exitCode === 0 && actual === normalize(t.expectedOutput),
      timedOut: out.timedOut,
      error: out.exitCode !== 0 ? out.stderr.trim().split('\n').slice(-3).join('\n') : '',
    });
  }
  return results;
}

module.exports = { runPython, runTests, normalize };
