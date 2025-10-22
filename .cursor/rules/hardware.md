# Hardware Integration

## Raspberry Pi GPIO

- Pin 20 controls light beacon
- Binary path: `/home/ubuntu/raspi-gpio/raspi-gpio`
- Automatically detects if GPIO binary exists
- Gracefully skips light control if not available
- No errors on non-Pi systems (Mac/Linux dev machines)

Example:

```typescript
try {
  exec(`/home/ubuntu/raspi-gpio/raspi-gpio set ${LIGHT_PIN} dl`);
} catch (e) {
  console.error(e);
  console.log("Error while turning on light pin");
}
```

## Audio Playback

Platform-specific commands:

- Darwin (macOS): `afplay <file>`
- Linux: `DISPLAY=:0 mpg123 <file>`
- Audio playback blocks until complete (synchronous)

Implementation in `audio.ts`:

```typescript
if (system === "darwin") {
  exec(`afplay ${file}`);
} else if (system === "linux") {
  exec(`DISPLAY=:0 mpg123 ${file}`);
}
```

## TTS Generation

- Uses TikTok TTS API via `lib/tiktok.ts`
- Generates MP3 files to temp directory
- Files named `audio-0.mp3`, `audio-1.mp3`, etc.
- Cleanup handled automatically after playback
