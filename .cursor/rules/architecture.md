# Architecture

## Tech Stack

- Node.js + TypeScript (ES modules)
- Audio: afplay (macOS) / mpg123 (Linux)
- TTS: TikTok TTS API
- Storage: lowdb + JSON
- Hardware: Raspberry Pi GPIO (pin 20)
- Monitoring: Sentry SDK

## System Flow

1. Poll Sentry API every 60s for new releases
2. Extract commits from getsentry/sentry repo only
3. Match commits against rules (author/type/scope)
4. Generate announcement (voice, sound, light, message)
5. Execute: sound → TTS → light control
6. Track announced commits to prevent duplicates

## Key Files

- `index.ts` - Main polling loop
- `fetch.ts` - Sentry API client
- `config.ts` - Rule matching engine
- `announcement.ts` - Execution with locking
- `message.ts` - Natural language generation
- `audio.ts` - Sound/voice playback
- `light.ts` - GPIO control
- `state.ts` - Persistence (lowdb + JSON)
- `pr.ts` - GitHub PR labels
- `utils.ts` - Parsing & helpers

## Patterns to Follow

✅ Use locking mechanism for announcements (prevents overlap)
✅ Check state before announcing (prevent duplicates)
✅ Graceful hardware error handling
✅ Persist state after mutations
✅ Transform API responses to internal types
✅ Log every cycle with timestamp and reason

## Patterns to Avoid

❌ Blocking the polling loop
❌ Announcing same commit twice
❌ Crashing on hardware errors
❌ Mutating state without persistence
❌ Using raw API responses
❌ Playing audio without lock
