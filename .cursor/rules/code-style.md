# Code Style

## TypeScript

- Always use explicit types
- Export shared types from `types.ts`
- Prefer interfaces over types for objects
- Use enums for fixed sets: `Sound`, `Voice`, `CommitType`
- Core types: `Commit`, `Rule`, `ParsedCommit`, `AnnouncementConfig`

## Modules

- ES modules only - use `.js` extensions in imports even for `.ts` files
- Named exports only, no defaults
- Single responsibility per module

## Naming Conventions

- Functions: camelCase, descriptive (`getAnnouncementConfig`, `checkIfAlreadyAnnounced`)
- Boolean functions: prefix with `is`/`has` (`isLocked`, `hasMatchingScope`)
- Constants: SCREAMING_SNAKE_CASE (`BASE_URL`, `LIGHT_PIN`)
- Types/Interfaces/Enums: PascalCase

## Async Patterns

- Always use async/await, never raw promises
- Wrap main logic in `Sentry.startSpan()` for observability
- Catch errors gracefully - log but don't crash
- Hardware operations (light, audio) must have try/catch
