# Development Workflows

## Running The Box

**Development (with auto-reload)**

```bash
npm run dev          # Monitor + web interface with auto-reload
```

**Production**

```bash
npm start            # Monitor + web interface (direct execution)
npm run start:prod   # Build first, then run (for deployment)
```

Web interface always available at http://localhost:3000

Uses `tsx` for instant TypeScript execution - no build step needed!

## Adding New Sounds

1. Add MP3 file to `assets/`
2. Add enum variant to `Sound` in `audio.ts`
3. Add mapping to `SoundFileMap`
4. Optionally map to commit type in `getCommitSound()`

Example:

```typescript
export enum Sound {
  WOOF = "WOOF",
  VACUUM = "VACUUM",
  SHIP = "SHIP",
  // Add new sound here
}

export const SoundFileMap: Record<Sound, string> = {
  WOOF: "woof.mp3",
  // Add mapping here
};
```

## Adding New Voices

1. Add enum variant to `Voice` in `audio.ts`
2. Test with TikTok TTS API
3. Consider special categories (singing, characters)

Available voice categories:

- English US/UK/AU
- Singing voices
- Character voices

## Testing

- Node.js native test runner: `--test` flag
- Tests in `src/tests/*.spec.ts`
- Mock external APIs (Sentry, GitHub, TikTok)
- Dev mode: set `NODE_ENV=dev` to announce all commits with test data

Run tests:

```bash
npm test
```

## Environment Variables

```bash
SENTRY_DSN=<monitoring>
SENTRY_TOKEN=<api_auth>
NODE_ENV=dev  # skips state, announces everything
PORT=3000     # web server port (default: 3000)
```

## CLI Commands

- `box play [message]` - Test announcement with options
- `box sound [sound]` - Test sound playback
- `box wednesday` - Easter egg (Wednesday meme)
- `box lunch` - Random restaurant picker

## Development Stack

- **Runtime**: tsx for instant TypeScript execution
- **No build step**: Direct `.ts` file execution
- **Watch mode**: Auto-reload on file changes
- **Production**: Pre-compile with `tsc` for deployment

## Making Changes

1. Edit TypeScript files in `src/`
2. Changes auto-reload in dev mode (`tsx watch`)
3. No need to run build during development
4. For production deployment, run `npm run build`

## Code Style

- Use explicit types
- ES modules with `.js` extensions in imports
- Wrap operations in `Sentry.startSpan()` for observability
- Always use try/catch for hardware operations
- Log errors but don't crash
