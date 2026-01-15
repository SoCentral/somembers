# Data Directory Guidelines

This directory contains static data files used throughout the application.

## Files

### sdg-goals.ts
UN Sustainable Development Goals data with Norwegian names.

**Exports:**
- `SDGGoal` - Interface for a single SDG goal (id, name, color)
- `sdgGoals` - Readonly array of all 17 SDG goals
- `getSDGById(id)` - Get goal by number (1-17)
- `getSDGByName(name)` - Get goal by Norwegian name
- `getSDGsByNames(names)` - Get multiple goals by names array

**Usage:**
```typescript
import { sdgGoals, getSDGsByNames, type SDGGoal } from '@/data/sdg-goals';

// Iterate all goals
for (const goal of sdgGoals) {
  console.log(`${goal.id}: ${goal.name} (${goal.color})`);
}

// Get goals from member's SDG array
const memberSDGs = getSDGsByNames(member.sdg);
```

## Conventions

1. **TypeScript first** - All data files should be `.ts` with proper type definitions
2. **Readonly arrays** - Use `as const` for static data to ensure immutability
3. **Export interfaces** - Export types alongside data for consuming components
4. **Helper functions** - Provide lookup functions for common access patterns
5. **Norwegian content** - User-facing strings should be in Norwegian to match the site
