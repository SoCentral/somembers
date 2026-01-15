# lib Directory - Agent Guidelines

## Purpose
This directory contains shared utilities, types, and helper functions used across the codebase.

## Type System

### API vs Transformed Interfaces
- `Api*` interfaces (e.g., `ApiMember`, `ApiCompany`) represent raw data from the OfficeRnD Flex 2 API
- `Transformed*` interfaces (e.g., `TransformedMember`, `TransformedCompany`) represent processed data for templates

### Privacy Field Naming
The Flex 2 API uses DIFFERENT field names with INVERTED logic from the legacy API:
- API `isVisible` -> Template `hide` (inverted)
- API `showContactDetails` -> Template `hideContactDetails` (inverted)
- API `showSocialProfiles` -> Template `hidePublicProfiles` (inverted)

When transforming data, always invert these boolean values.

### Social Profiles
The `socialProfiles` object replaces legacy fields:
- `twitterHandle` -> `socialProfiles.twitter`
- `linkedin` -> `socialProfiles.linkedin`

Legacy fields may still exist in some API responses - code should check both.

### Custom Properties
The `properties` object can contain SDG (Sustainable Development Goals) data:
```typescript
interface ApiProperties {
  sdg?: string[];
  [key: string]: unknown;  // Other custom fields
}
```

## API Client (`api.ts`)

### Usage Pattern
```typescript
import { getConfigFromEnv, fetchMembers, fetchCompanies } from "@/lib/api";

const config = getConfigFromEnv();
const members = await fetchMembers(config);
const companies = await fetchCompanies(config);
```

### Key Points
- `getAccessToken()` handles OAuth 2.0 client credentials flow with automatic caching
- Token endpoint has 5 req/min rate limit - caching is essential
- `fetchMembers()` and `fetchCompanies()` handle pagination automatically via `$cursorNext`
- All errors throw `ApiError` with meaningful messages, status code, and endpoint
- Uses native `fetch` - no axios dependency

### Endpoints
- Token: `https://identity.officernd.com/oauth/token`
- Members: `https://app.officernd.com/api/v2/organizations/{orgSlug}/members`
- Companies: `https://app.officernd.com/api/v2/organizations/{orgSlug}/companies`

### TypeScript Gotchas
- When using generic types with `do-while` loops, TypeScript may fail to infer types
- Use explicit type annotations inside loops to avoid "implicitly has type 'any'" errors

## API Documentation
- Members: https://developer.officernd.com/reference/memberscontroller_getitems
- Companies: https://developer.officernd.com/reference/companiescontroller_getitems
