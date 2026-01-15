# PRD: Astro Migration & OfficeRnD Flex 2 API Update

## Introduction

Migrate the SoMembers website from Gridsome/Vue to Astro/TypeScript and update the OfficeRnD integration from the deprecated API to the new Flex 2 API. The current API endpoints are being deprecated, making this migration necessary for continued operation. The site displays member and team (company) profiles for SoCentral coworking community at medlemmer.socentral.no.

## Goals

- Replace Gridsome 0.7.x and Vue 2 with Astro and TypeScript
- Migrate from deprecated OfficeRnD API to Flex 2 API (`/api/v2/organizations/{orgSlug}/members` and `/companies`)
- Maintain 1:1 feature parity with current site (members list, teams list, detail pages)
- Enable the SDG (Sustainable Development Goals) filtering feature that exists but is currently disabled
- Keep static site generation approach (data fetched at build time)
- Maintain current deployment on Netlify

## User Stories

### US-001: Set up Astro project structure
**Description:** As a developer, I need a properly configured Astro project so that I can build the site with TypeScript support.

**Acceptance Criteria:**
- [ ] Initialize new Astro project with TypeScript strict mode
- [ ] Configure Tailwind CSS integration
- [ ] Set up environment variable handling for API credentials
- [ ] Configure Netlify adapter for static output
- [ ] Update package.json scripts (dev, build, preview)
- [ ] npm run build completes without errors

---

### US-002: Create TypeScript interfaces for data models
**Description:** As a developer, I need TypeScript interfaces defining Member and Team/Company data structures so that I have type safety throughout the codebase.

**Acceptance Criteria:**
- [ ] Create `Member` interface matching Flex 2 API response fields
- [ ] Create `Company` interface matching Flex 2 API response fields (replaces "Team")
- [ ] Create `TransformedMember` interface for processed member data
- [ ] Create `TransformedCompany` interface for processed company data
- [ ] Create `PrivacyOptions` interface for portal privacy settings
- [ ] All interfaces use strict typing (no `any`)
- [ ] npm run typecheck passes

---

### US-003: Implement OfficeRnD Flex 2 API client
**Description:** As a developer, I need an API client that authenticates and fetches data from OfficeRnD Flex 2 API so that member and company data can be retrieved at build time.

**Acceptance Criteria:**
- [ ] Implement OAuth 2.0 client credentials flow to `https://identity.officernd.com/oauth/token`
- [ ] Use scope `flex.community.members.read` and `flex.community.companies.read`
- [ ] Implement `fetchMembers()` calling `GET /api/v2/organizations/{orgSlug}/members`
- [ ] Implement `fetchCompanies()` calling `GET /api/v2/organizations/{orgSlug}/companies`
- [ ] Handle pagination using `$cursorNext` if response exceeds limit
- [ ] Handle API errors gracefully with meaningful error messages
- [ ] npm run typecheck passes

---

### US-004: Create data transformation layer
**Description:** As a developer, I need functions to transform raw API data into the format needed for rendering so that privacy rules, image URLs, and slugs are correctly processed.

**Acceptance Criteria:**
- [ ] Implement `transformMember()` function that:
  - Converts CloudFront image URLs to ImageKit CDN format
  - Generates URL slug from member name using same rules as current site
  - Extracts SDG tags from `properties.sdg` (verify structure in API response)
  - Calculates display priority (profiles with images shown first)
  - Applies privacy filtering (skip if `portalPrivacy.hide` is true)
  - Maps `hideContactDetails` and `hidePublicProfiles` flags
  - Extracts social links from `socialProfiles` object
- [ ] Implement `transformCompany()` function with same transformations
- [ ] Implement `getTeamMembers()` to associate members with their company
- [ ] Maintain backward compatibility with current URL slugs
- [ ] npm run typecheck passes

---

### US-005: Create shared Astro components
**Description:** As a developer, I need reusable Astro components so that I can build consistent UI across pages.

**Acceptance Criteria:**
- [ ] Create `BaseLayout.astro` with:
  - HTML head with meta tags, favicon, Google Fonts preconnect
  - Responsive viewport settings
  - Slot for page content
- [ ] Create `ProfileCard.astro` component displaying:
  - Profile image (lazy loaded)
  - Name
  - Team/company name (for members)
  - Link to detail page
- [ ] Create `TitleSection.astro` for page headers
- [ ] Create `PageSwitch.astro` for members/teams navigation toggle
- [ ] All components use TypeScript for props
- [ ] npm run typecheck passes

---

### US-006: Build members listing page
**Description:** As a user, I want to see a grid of all community members so that I can browse and find people.

**Acceptance Criteria:**
- [ ] Create `src/pages/index.astro` as members listing
- [ ] Fetch and transform member data at build time using `getStaticPaths` or content collection
- [ ] Display members in responsive grid (auto-fill, min 320px)
- [ ] Sort by priority (images first), then by creation date
- [ ] Implement client-side search filter matching name and team
- [ ] Implement SDG filter with toggleable tags (17 UN goals)
- [ ] Show loading state for images
- [ ] npm run typecheck passes
- [ ] Verify in browser: grid displays correctly, search works, SDG filter works

---

### US-007: Build teams listing page
**Description:** As a user, I want to see a grid of all teams/companies so that I can browse organizations in the community.

**Acceptance Criteria:**
- [ ] Create `src/pages/teams.astro` as teams listing
- [ ] Fetch and transform company data at build time
- [ ] Display teams in responsive grid matching members page layout
- [ ] Sort by priority (images first), then by creation date
- [ ] Implement client-side search filter matching team name
- [ ] Implement SDG filter with toggleable tags
- [ ] npm run typecheck passes
- [ ] Verify in browser: grid displays correctly, search works, SDG filter works

---

### US-008: Build member detail pages
**Description:** As a user, I want to view a member's full profile so that I can see their bio, contact info, and team.

**Acceptance Criteria:**
- [ ] Create `src/pages/[slug].astro` for dynamic member routes
- [ ] Generate static paths for all members using `getStaticPaths()`
- [ ] Display profile image, name, and bio/description
- [ ] Show phone and email (unless `hideContactDetails` is true)
- [ ] Show social profile links from `socialProfiles` object (unless `hidePublicProfiles` is true)
- [ ] Display tags array
- [ ] Display SDG badges
- [ ] Link to member's team page
- [ ] npm run typecheck passes
- [ ] Verify in browser: profile displays correctly with all fields

---

### US-009: Build team detail pages
**Description:** As a user, I want to view a team's full profile so that I can see their description, website, and members.

**Acceptance Criteria:**
- [ ] Create `src/pages/teams/[slug].astro` for dynamic team routes
- [ ] Generate static paths for all teams using `getStaticPaths()`
- [ ] Display team image, name, and bio/description
- [ ] Show website URL link
- [ ] Show social profile links from `socialProfiles` object (unless `hidePublicProfiles` is true)
- [ ] Display SDG badges
- [ ] List all team members with links to their profiles
- [ ] npm run typecheck passes
- [ ] Verify in browser: team profile displays correctly with member list

---

### US-010: Implement SDG filtering component
**Description:** As a user, I want to filter members and teams by Sustainable Development Goals so that I can find people working on specific global challenges.

**Acceptance Criteria:**
- [ ] Create `SDGFilter.astro` component with 17 UN goal toggles
- [ ] Style filter as clickable chips/badges
- [ ] Implement client-side JavaScript to filter displayed cards
- [ ] Support multiple SDG selection (AND logic: show items matching any selected)
- [ ] Clear filter option to reset selection
- [ ] Filter state persists during session (not in URL)
- [ ] npm run typecheck passes
- [ ] Verify in browser: selecting SDGs filters the grid correctly

---

### US-011: Style with Tailwind CSS
**Description:** As a user, I want the site to look consistent with the current design so that the migration is seamless.

**Acceptance Criteria:**
- [ ] Configure Tailwind with custom fonts: Poppins (sans), Crimson Pro (serif)
- [ ] Match current color palette (gray background, blue-700 primary)
- [ ] Implement responsive grid layout for cards
- [ ] Style profile cards with 320px images, text truncation
- [ ] Style detail pages with consistent typography
- [ ] Ensure mobile responsiveness
- [ ] npm run typecheck passes
- [ ] Verify in browser: visual design matches current site

---

### US-012: Configure build and deployment
**Description:** As a developer, I need the site to build and deploy correctly on Netlify so that the migration can go live.

**Acceptance Criteria:**
- [ ] Configure Netlify adapter in `astro.config.mjs`
- [ ] Set up environment variables in Netlify (API_TOKEN_URL, CLIENT_ID, CLIENT_SECRET, ORG_SLUG)
- [ ] Verify build completes successfully with `npm run build`
- [ ] Generated static files work correctly
- [ ] Site accessible at current URL after deployment
- [ ] npm run typecheck passes

---

### US-013: Remove Gridsome and Vue dependencies
**Description:** As a developer, I need to clean up old framework files so that the codebase only contains Astro code.

**Acceptance Criteria:**
- [ ] Remove `gridsome.config.js`
- [ ] Remove `gridsome.server.js`
- [ ] Remove all `.vue` files from src/
- [ ] Remove Gridsome, Vue, and related packages from package.json
- [ ] Remove `vue-lazyload` dependency
- [ ] Update `.gitignore` for Astro output directories
- [ ] npm run build completes without errors

## Functional Requirements

- FR-1: The system must authenticate with OfficeRnD using OAuth 2.0 client credentials flow
- FR-2: The system must fetch member data from `GET /api/v2/organizations/{orgSlug}/members`
- FR-3: The system must fetch company data from `GET /api/v2/organizations/{orgSlug}/companies`
- FR-4: The system must filter out members/companies where `portalPrivacy.hide` is true
- FR-5: The system must transform CloudFront image URLs to ImageKit CDN format
- FR-6: The system must generate URL-safe slugs from names using identical rules to current site
- FR-7: The system must display members grid sorted by image priority (ascending) then creation date (descending)
- FR-8: The system must provide client-side search filtering by name
- FR-9: The system must provide SDG tag filtering with multi-select capability
- FR-10: The system must respect `hideContactDetails` flag when displaying phone/email
- FR-11: The system must respect `hidePublicProfiles` flag when displaying social links
- FR-12: The system must generate static HTML pages at build time (no runtime API calls)
- FR-13: The system must maintain backward-compatible URL structure (`/[member-slug]` and `/teams/[team-slug]`)

## Non-Goals (Out of Scope)

- No server-side rendering or incremental static regeneration
- No real-time data updates (site must be rebuilt to reflect changes)
- No user authentication or login functionality
- No ability to edit profiles from the website
- No search engine submission or SEO optimization beyond current meta tags
- No analytics implementation changes
- No new pages beyond current functionality (members list, teams list, detail pages)
- No multi-language support
- No dark mode or theme switching

## Technical Considerations

### API Changes (Old vs New)

| Aspect | Old API | New Flex 2 API |
|--------|---------|----------------|
| Members endpoint | `process.env.API_MEMBERS_URL` | `/api/v2/organizations/socentral/members` |
| Teams endpoint | `process.env.API_TEAMS_URL` | `/api/v2/organizations/socentral/companies` |
| Auth scope | `officernd.api.read` | `flex.community.members.read`, `flex.community.companies.read` |
| Response format | Direct array | Paginated: `{ results: [], cursorNext, ... }` |
| Team reference | `member.team._id` | `member.company` (ID reference) |
| Social profiles | `twitterHandle`, `linkedin` | `socialProfiles` object |

### Environment Variables Required
- `OFFICERND_TOKEN_URL` - OAuth token endpoint (`https://identity.officernd.com/oauth/token`)
- `OFFICERND_CLIENT_ID` - OAuth client ID
- `OFFICERND_CLIENT_SECRET` - OAuth client secret
- `OFFICERND_ORG_SLUG` - Organization identifier for API paths (value: `socentral`)

### Dependencies to Add
- `astro` - Core framework
- `@astrojs/tailwind` - Tailwind integration
- `@astrojs/netlify` - Netlify adapter (static mode)
- `slugify` - Keep for URL generation

### Dependencies to Remove
- `gridsome`, `axios-oauth-client`, `axios-token-interceptor`, `vue-lazyload`
- All `gridsome-plugin-*` packages

### File Structure (New)
```
src/
├── components/
│   ├── BaseLayout.astro
│   ├── ProfileCard.astro
│   ├── TitleSection.astro
│   ├── PageSwitch.astro
│   └── SDGFilter.astro
├── lib/
│   ├── api.ts           (OfficeRnD API client)
│   ├── transform.ts     (Data transformation)
│   └── types.ts         (TypeScript interfaces)
├── pages/
│   ├── index.astro      (Members listing)
│   ├── teams.astro      (Teams listing)
│   ├── [slug].astro     (Member detail)
│   └── teams/
│       └── [slug].astro (Team detail)
├── data/
│   └── sdg-goals.ts     (SDG filter options)
└── styles/
    └── global.css       (Tailwind imports)
```

## Success Metrics

- Site builds successfully with `npm run build`
- All TypeScript type checks pass with `npm run typecheck`
- Generated pages match current URL structure (no broken links)
- Member and team counts match current site
- Search filtering works identically to current implementation
- SDG filtering is functional and usable
- Page load performance equal to or better than current site
- Successful deployment to Netlify

## Open Questions

1. ~~What is the exact `orgSlug` value for the Flex 2 API endpoints?~~ **Resolved:** `socentral`
2. Are there any rate limits on the Flex 2 API beyond the token endpoint (5 req/min)?
3. Has the `properties.sdg` custom field structure changed in the new API? **To verify during implementation**
4. ~~Should the `socialProfiles` field from new API be used instead of `twitterHandle`/`linkedin`?~~ **Resolved:** Use `socialProfiles`
5. ~~Is there a staging/test environment to validate the migration before going live?~~ **Resolved:** Deploy directly to production
