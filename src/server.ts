import express from "express";
import { announce } from "./announcement.js";
import { state } from "./state.js";
import { Sound, Voice } from "./audio.js";
import type { AnnouncementConfig } from "./types.js";
import path from "path";
import { fileURLToPath } from "url";
import * as Sentry from "@sentry/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API: Get all commits
app.get("/api/commits", async (req, res) => {
  return Sentry.startSpan(
    { name: "api.getCommits", op: "http.server" },
    async () => {
      try {
        const commits = await state.commits.getAll();
        const commitsArray = Object.values(commits);
        res.json(commitsArray);
      } catch (error) {
        console.error("Error fetching commits:", error);
        res.status(500).json({ message: "Failed to fetch commits" });
      }
    }
  );
});

// API: Get all rules
app.get("/api/rules", async (req, res) => {
  return Sentry.startSpan(
    { name: "api.getRules", op: "http.server" },
    async () => {
      try {
        const rules = await state.rules.getAll();
        res.json(rules);
      } catch (error) {
        console.error("Error fetching rules:", error);
        res.status(500).json({ message: "Failed to fetch rules" });
      }
    }
  );
});

// API: Test announcement
app.post("/api/test", async (req, res) => {
  return Sentry.startSpan(
    { name: "api.testAnnouncement", op: "http.server" },
    async (span) => {
      try {
        const { message, voice, sound, light } = req.body;

        if (!message) {
          res.status(400).json({ message: "Message is required" });
          return;
        }

        const config: AnnouncementConfig = {
          message,
          voice: voice as Voice,
          sound: sound ? (sound as Sound) : undefined,
          light: light !== false,
        };

        span.setAttributes({
          voice,
          sound,
          light,
          messageLength: message.length,
        });

        await announce(config);

        res.json({ success: true, message: "Announcement played" });
      } catch (error) {
        console.error("Error playing announcement:", error);
        res.status(500).json({
          message:
            error instanceof Error
              ? error.message
              : "Failed to play announcement",
        });
      }
    }
  );
});

// API: Wednesday easter egg
app.post("/api/wednesday", async (req, res) => {
  return Sentry.startSpan(
    { name: "api.wednesday", op: "http.server" },
    async () => {
      try {
        await announce({
          message: "Do you know what is today?",
          voice: Voice.en_us_006,
          light: true,
        });
        await announce({
          sound: Sound.WEDNESDAY,
          light: true,
        });
        res.json({ success: true });
      } catch (error) {
        console.error("Error playing wednesday:", error);
        res.status(500).json({
          message:
            error instanceof Error ? error.message : "Failed to play wednesday",
        });
      }
    }
  );
});

// API: Soundboard - play custom sound
app.post("/api/soundboard/:soundId", async (req, res) => {
  return Sentry.startSpan(
    { name: "api.soundboard", op: "http.server" },
    async (span) => {
      try {
        const { soundId } = req.params;

        span.setAttribute("soundId", soundId);

        // Map soundboard IDs to actual sounds
        const soundMap: Record<string, Sound> = {
          nice: Sound.NOICE,
          riccardo: Sound.RICCARDO,
          ship: Sound.SHIP,
          ah_shit: Sound.AH_SHIT,
          damn_train: Sound.DAMN_TRAIN,
          drumroll: Sound.DRUM_ROLL,
        };

        const sound = soundMap[soundId];

        if (sound) {
          // Play the actual sound
          console.log(`Playing soundboard sound: ${soundId} -> ${sound}`);
          await announce({ sound, light: false });
          res.json({ success: true, sound: soundId });
        } else {
          // Stub for unmapped sounds
          console.log(`Stub: soundboard sound ${soundId} (not yet mapped)`);
          res.json({
            success: true,
            sound: soundId,
            message: "Sound stub - coming soon!",
          });
        }
      } catch (error) {
        console.error("Error playing soundboard sound:", error);
        res.status(500).json({
          message:
            error instanceof Error ? error.message : "Failed to play sound",
        });
      }
    }
  );
});

// API: Lunch easter egg
app.post("/api/lunch", async (req, res) => {
  return Sentry.startSpan(
    { name: "api.lunch", op: "http.server" },
    async () => {
      try {
        const slowRestaurants = [
          "Coconut Curry",
          "Da Rose",
          "Mochi Ramen",
          "Koi Asian",
        ];
        const fastRestaurants = [
          "Dean & David",
          "Bao Bar",
          "Max & Benito",
          "Noodle King",
          "Ilkim Kebap",
          "Canteen",
        ];

        const isFriday = new Date().getDay() === 5;
        const restaurants = isFriday ? slowRestaurants : fastRestaurants;

        const randomIndex = Math.floor(Math.random() * restaurants.length);
        const randomRestaurant = restaurants[randomIndex];

        await announce({
          message: `It is lunch time! You should go to ${randomRestaurant}!`,
          voice: Voice.en_us_006,
          light: true,
        });

        res.json({ success: true, restaurant: randomRestaurant });
      } catch (error) {
        console.error("Error playing lunch:", error);
        res.status(500).json({
          message:
            error instanceof Error ? error.message : "Failed to play lunch",
        });
      }
    }
  );
});

// Start server
export function startServer() {
  app.listen(PORT, () => {
    console.log(`🎁 The Box web interface running at http://localhost:${PORT}`);
  });
}
