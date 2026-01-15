# src Directory - Agent Guidelines

## Environment Variables
- All environment variables must be typed in `env.d.ts`
- Use `import.meta.env.VARIABLE_NAME` to access in Astro components
- Server-side only variables should NOT be prefixed with `PUBLIC_`

## TypeScript
- Strict mode is enforced via `astro/tsconfigs/strict`
- Prefer interfaces over types
- Never use `any` - use `unknown` instead
- Path alias `@/*` maps to `src/*`

## File Structure
- Pages go in `pages/` as `.astro` files
- Components go in `components/` (can be `.astro` or `.ts`)
- Layouts go in `layouts/` as `.astro` files

## Legacy Files
- `.vue` files are from the old Gridsome setup
- These will be migrated to Astro in subsequent tasks
- They cause warnings but don't break the build
