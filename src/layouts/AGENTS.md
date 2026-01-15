# src/layouts Directory - Agent Guidelines

## Layout Components

### BaseLayout.astro
- Main layout for all pages
- Provides HTML document structure, meta tags, and global styles
- Accepts `title` prop (required)
- Uses Norwegian language (`lang="nb"`)

## Usage Pattern
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---

<BaseLayout title="Page Title">
  <!-- Page content goes here -->
</BaseLayout>
```

## Styling Notes
- Global CSS imported via `@/styles/global.css`
- Tailwind classes available in all child components
- Background color: `rgb(225, 225, 219)`
- Default font family: `font-sans` (Poppins)

## Google Fonts
- **Poppins**: 300, 400, 700 weights (sans-serif, body text)
- **Crimson Pro**: 300, 400, 700 weights (serif, decorative)
- Fonts preconnected for performance

## Legacy Files
- `Default.vue` is the old Gridsome layout - do not use
- Will be removed once migration is complete
