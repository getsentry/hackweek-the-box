# 🎁 The Box

A hackweek project that monitors Sentry commits and announces them via TTS audio and a physical light beacon on Raspberry Pi.

## Features

- 🔊 Text-to-speech announcements using TikTok TTS
- 🎵 Sound effects for different commit types
- 💡 Physical light beacon control via GPIO
- 📊 Web dashboard for monitoring and testing
- 🎯 Rule-based commit matching and personalization
- 📝 Persistent state tracking

## Quick Start

### Installation

```bash
npm install
```

No build step needed for development! Uses `tsx` for instant TypeScript execution.

### Environment Setup

Create a `.env` file:

```bash
SENTRY_DSN=<your_sentry_dsn>
SENTRY_TOKEN=<your_sentry_api_token>
NODE_ENV=production  # or 'dev' for testing
```

### Run Modes

**Development (with auto-reload)**

```bash
npm run dev
```

Runs monitor + web dashboard at http://localhost:3000 with auto-reload.

**Production**

```bash
npm start            # Direct execution with tsx
npm run start:prod   # Pre-compiled (for deployment)
```

Uses `tsx` for instant TypeScript execution with watch mode - no build step needed!

## Web Dashboard

The web interface provides:

- **Dashboard**: View recent announcements and stats
- **Test Sounds**: Try different voices, sounds, and messages
- **Rules**: View configured announcement rules

Access at: http://localhost:3000

### API Endpoints

- `GET /api/commits` - Get all announced commits
- `GET /api/rules` - Get announcement rules
- `POST /api/test` - Test an announcement
  ```json
  {
    "message": "Hello!",
    "voice": "en_us_001",
    "sound": "SHIP",
    "light": true
  }
  ```
- `POST /api/wednesday` - Play Wednesday easter egg
- `POST /api/lunch` - Random restaurant picker

## CLI Commands

```bash
# Test announcement
box play "Hello from The Box" --voice en_us_001 --sound SHIP

# Play sound only
box sound SHIP

# Easter eggs
box wednesday
box lunch
```

## Rules System

Rules are stored in `../.rules.json` and define how commits are announced.

### Rule Structure

```json
{
  "match": {
    "author": "user@example.com",
    "type": "feat",
    "scope": "frontend"
  },
  "play": {
    "nickname": "Alice",
    "voice": "en_us_001",
    "sound": "SHIP",
    "light": true
  }
}
```

### Commit Types

- `feat` → Ship horn 🚢
- `fix` → Sigh of relief 😮‍💨
- `ref` → Noice! 👌
- `chore` → Vacuum cleaner 🧹
- `test` → Testing 123 🧪
- `revert` → Rewind ⏪
- `unknown` → Woof 🐕

### Available Voices

**English US**

- `en_us_001` - Female
- `en_us_006` - Male 1
- `en_us_007` - Male 2

**English UK/AU**

- `en_uk_001` - Male UK
- `en_au_001` - Female AU

**Special**

- `en_us_rocket` - Rocket (character voice)
- `en_female_ht_f08_glorious` - Singing

## Hardware Setup

### Raspberry Pi GPIO

- Uses GPIO pin 20 for light control
- Requires `raspi-gpio` utility
- Gracefully degrades on non-Pi systems

### Audio Requirements

- **macOS**: Uses `afplay` (built-in)
- **Linux**: Requires `mpg123`
  ```bash
  sudo apt-get install mpg123
  ```

## Development

### Project Structure

```
src/
  index.ts          # Main polling loop
  server.ts         # Express web server
  announcement.ts   # Announcement execution
  audio.ts          # Sound/voice playback
  config.ts         # Rule matching
  message.ts        # Message generation
  state.ts          # Persistence layer

public/
  index.html        # Web dashboard (Alpine.js + Tailwind)
```

### Adding New Sounds

1. Add MP3 to `assets/`
2. Add enum to `Sound` in `audio.ts`
3. Add mapping to `SoundFileMap`
4. Optionally map to commit type

### Testing

```bash
npm test
```

Uses Node.js native test runner.

### Dev Mode

```bash
NODE_ENV=dev npm start
```

Announces all commits with test data (Pikachu).

## Architecture

1. Polls Sentry API for new releases
2. Extracts commits from `getsentry/sentry` repo
3. Matches against rules (author/type/scope)
4. Generates announcement config
5. Executes: sound → TTS → light control
6. Tracks announced commits

## TODOs

- [x] Add decent storage (lowdb implemented)
- [ ] Add linter (ESLint/Prettier)
- [ ] Fix async tests
- [x] Add web interface

## License

ISC
