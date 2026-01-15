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

### TitleSection.astro
Simple page title component for consistent header styling.

**Props:**
- `title: string` - The title text to display

**Styling notes:**
- Font: sans-serif (Poppins via Tailwind config)
- Size: text-4xl, font-bold
- Margin: mb-4, lg:mb-2
- Line height: leading-snug

**Usage:**
```astro
---
import TitleSection from '@/components/TitleSection.astro';
---

<TitleSection title="Vare medlemmer" />
```

### PageSwitch.astro
Navigation toggle between Members and Teams pages. Displays two tab-like links with active state highlighting based on current URL.

**Props:** None (uses `Astro.url.pathname` internally)

**Styling notes:**
- Active tab: bg-gray-800, text-white
- Inactive tab: bg-gray-200, text-gray-700, hover:bg-gray-300
- Both: font-light, text-sm, rounded, py-1, px-2
- Container: mb-6, flex, gap-2
- Includes `aria-current="page"` for accessibility

**Usage:**
```astro
---
import PageSwitch from '@/components/PageSwitch.astro';
---

<!-- On members page (/), "Medlemmer" is highlighted -->
<!-- On teams page (/teams), "Virksomheter" is highlighted -->
<PageSwitch />
```

## Migration Notes
- Legacy `.vue` components remain until migration is complete
- New Astro components should follow the same naming convention
- Use scoped `<style>` blocks for component-specific styles
- Use Tailwind utility classes where possible
