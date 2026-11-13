import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Port dédié (différent du 5173 par défaut, déjà pris par un autre
    // projet sur cette machine) + strictPort : un décalage silencieux
    // (5174, 5175...) désynchronise sinon CLIENT_URL (CORS) côté serveur,
    // sans message d'erreur clair côté navigateur (juste un échec réseau).
    port: 5183,
    strictPort: true,
  },
})
