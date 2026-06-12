import { execSync } from 'node:child_process'

// Build the package once before the web servers start so both Astro example
// builds (integration + component) can resolve the aliased dist/ output.
export default function globalSetup(): void {
  execSync('pnpm build', { stdio: 'inherit' })
}
