# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to ./dist/
npm run preview   # Preview production build locally
```

No test or lint scripts are configured.

## Architecture

This is an **Astro static site** that serves as a member and company directory, pulling data from the **OfficeRnD** coworking management platform at build time.

### Data Layer (`src/content.config.ts`)

This is the core of the application. It defines two Astro content collections — `members` and `teams` (companies) — backed by custom loaders that:

1. Authenticate against OfficeRnD's OAuth2 endpoint using `CLIENT_ID` / `CLIENT_SECRET` from `.env`
2. Paginate through the OfficeRnD REST API via cursor-based pagination (50 records/page)
3. Filter out hidden profiles (portal privacy settings)
4. Transform data: slugify names for URL-safe routes, proxy images through ImageKit
5. Sort results: profiles with images first, then by newest creation date

All data fetching happens at build time — there is no client-side API access.

### Pages & Routing

- `src/pages/index.astro` — Members grid (home page)
- `src/pages/companies.astro` — Companies grid
- `src/pages/members/[slug].astro` — Dynamic member detail pages (uses `getStaticPaths`)
- `src/pages/companies/[slug].astro` — Dynamic company detail pages (logo, name, website, member list with links)

Pages retrieve data via `getCollection('members')` and `getCollection('teams')`.

### Image Handling

Production images are proxied through ImageKit by transforming AWS CloudFront URLs. Members/companies without images fall back to `placeholder.com`.

### Environment Variables

Required in `.env`:
```
CLIENT_ID=...
CLIENT_SECRET=...
```
Used exclusively by `src/content.config.ts` at build time to authenticate with OfficeRnD.
