# Observability & Monitoring

## Sentry Integration

All major functions must be wrapped in spans for observability.

### Basic Pattern

```typescript
export async function myFunction() {
  return Sentry.startSpan(
    { name: "myFunction", op: "function" },
    async (span) => {
      // Your logic here
      span.setAttributes({ key: value });
      return result;
    }
  );
}
```

### Metrics to Track

Use `span.setAttributes()` for:

- Commit counts
- Matching rules count
- Scope checks
- API response sizes
- Processing times

Example:

```typescript
span.setAttributes({
  newCommits: commits.length,
  uniqueCommits: uniqueCommits.size,
  sentryRepoCommits: sentryRepoCommits.length,
});
```

### Configuration

- Sample rate: 100% (low traffic volume)
- Release version: git hash (first 8 chars)
- Environment: from `NODE_ENV`

## Logging Best Practices

- Log every check cycle with ISO timestamp
- Log ignores with reason: "no config", "scope mismatch", "already announced"
- Log announcements with full config
- Log errors but continue processing (don't crash)

Example:

```typescript
console.log(`Checking for new commits (${new Date().toISOString()})`);
console.log("Ignoring - scope mismatch", commit.message);
```
