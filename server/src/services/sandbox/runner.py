# Lanceur Python pour le moteur "local" (développement uniquement).
# Applique des limites de ressources puis exécute le code de l'élève.
import resource, sys, runpy

resource.setrlimit(resource.RLIMIT_CPU, (4, 4))
resource.setrlimit(resource.RLIMIT_FSIZE, (1_000_000, 1_000_000))
try:
    resource.setrlimit(resource.RLIMIT_AS, (512 * 1024 * 1024, 512 * 1024 * 1024))
except (ValueError, OSError):
    pass  # non supporté sur certains OS (macOS)
try:
    resource.setrlimit(resource.RLIMIT_NPROC, (0, 0))
except (ValueError, OSError):
    pass

sys.argv = ["main.py"]
runpy.run_path("main.py", run_name="__main__")
