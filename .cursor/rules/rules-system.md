# Rules System

Commit matching and announcement configuration system.

## Rule Structure

Rules stored in `../.rules.json`:

```typescript
{
  match: {
    author?: string,      // email match
    type?: CommitType,    // feat/fix/ref/chore/test/revert
    scope?: string        // sanitized scope (non-word chars removed)
  },
  play: {
    nickname?: string,
    voice?: Voice,
    sound?: Sound,
    light?: boolean
  }
}
```

## Matching Behavior

- Multiple matching rules cascade (configs merge)
- Empty match = wildcard (matches everything)
- Default config applied first, then rule overrides
- Scope matching is sanitized (removes non-word chars)

## Default Config

- `nickname` = author.name
- `voice` = en_us_001 (female US English)
- `sound` = mapped by commit type (feat→SHIP, fix→SIGH, ref→NOICE, etc.)
- `light` = true

## Adding/Modifying Rules

- Use `state.rules.save()` - never modify JSON directly
- Consider adding CLI command for rule management
- Test with dev mode: `NODE_ENV=dev`

## Quirks

- **Dev mode**: Every commit announced as "Pikachu"
- **Scope matching**: From GitHub PR labels with `scope:` prefix
- **Release filter**: Only prod deploys of frontend/backend
- **Duplicate detection**: By commit ID
- **PR fallback**: Returns frontend+backend on error
