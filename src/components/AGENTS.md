# Components Directory

## Component Patterns

### ProfileCard.astro
Reusable card component for member/team profile display on listing pages.

**Props:**
- `slug: string` - URL slug for the detail page
- `name: string` - Display name
- `image: string` - Image URL
- `teamName?: string` - Team name (only for members)
- `basePath?: string` - URL prefix (default: '', use '/teams' for teams)

**Styling notes:**
- Card width: 320px
- Image: 320px square
- Members (have teamName) use `object-cover` for images
- Teams (no teamName) use `object-contain` for images
- Text truncation via `.cut-text` class (scoped)

**Usage:**
```astro
---
import ProfileCard from '@/components/ProfileCard.astro';
---

<!-- Member card (links to /robin-sandborg) -->
<ProfileCard
  slug="robin-sandborg"
  name="Robin Sandborg"
  image="https://example.com/image.jpg"
  teamName="SoCentral"
/>

<!-- Team card (links to /teams/socentral) -->
<ProfileCard
  slug="socentral"
  name="SoCentral"
  image="https://example.com/logo.jpg"
  basePath="/teams"
/>
```

## Migration Notes
- Legacy `.vue` components remain until migration is complete
- New Astro components should follow the same naming convention
- Use scoped `<style>` blocks for component-specific styles
- Use Tailwind utility classes where possible
