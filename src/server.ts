import express from "express";
import { announce } from "./announcement.js";
import { state } from "./state.js";
import { Sound, Voice } from "./audio.js";
import type { AnnouncementConfig, Commit } from "./types.js";
import path from "path";
import { fileURLToPath } from "url";
import * as Sentry from "@sentry/node";
import { requireAuth, login, logout } from "./auth.js";
import { getPR } from "./pr.js";
import { parseCommit } from "./utils.js";
import { getAnnouncementConfig } from "./config.js";
import { lightOn, lightOff, getLightState } from "./light.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Auth: Login endpoint (unprotected)
app.post("/api/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  const token = login(password);

  if (token) {
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Auth: Logout endpoint
app.post("/api/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    logout(token);
  }
  res.json({ success: true });
});

// API: Get all commits
app.get("/api/commits", requireAuth, async (req, res) => {
  return Sentry.startSpan(
    { name: "api.getCommits", op: "http.server" },
    async () => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const commits = await state.commits.getAll();
        const commitsArray = Object.values(commits);

        // Sort by dateCreated descending (newest first)
        const sortedCommits = commitsArray.sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
        );

        // Paginate
        const paginatedCommits = sortedCommits.slice(offset, offset + limit);

        res.json({
          commits: paginatedCommits,
          total: sortedCommits.length,
          page,
          limit,
          totalPages: Math.ceil(sortedCommits.length / limit),
        });
      } catch (error) {
        console.error("Error fetching commits:", error);
        res.status(500).json({ message: "Failed to fetch commits" });
      }
    }
  );
});

// API: Get all rules
app.get("/api/rules", requireAuth, async (req, res) => {
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
app.post("/api/test", requireAuth, async (req, res) => {
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
app.post("/api/wednesday", requireAuth, async (req, res) => {
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
app.post("/api/soundboard/:soundId", requireAuth, async (req, res) => {
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
          skill_issue: Sound.SKILL_ISSUE,
          fake_news: Sound.FAKE_NEWS,
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

app.post("/api/lunch", requireAuth, async (req, res) => {
  return Sentry.startSpan(
    { name: "api.lunch", op: "http.server" },
    async () => {
      try {
        const slowRestaurants = [
          "Coconut Curry",
          "Da Rose",
          "Mochi Ramen",
          "Koi Asian",
          "Spoon Food",
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

// API: Test PR by URL
app.post("/api/test-pr", requireAuth, async (req, res) => {
  return Sentry.startSpan(
    { name: "api.testPR", op: "http.server" },
    async () => {
      try {
        const { prUrl } = req.body;
        const prMatch = prUrl.match(/\/pull\/(\d+)/);
        const prNumber = prMatch[1];
        const pr = await getPR(prNumber);

        const mockCommit: Commit = {
          id: `test-${prNumber}`,
          message: pr.title || "",
          dateCreated: pr.created_at || new Date().toISOString(),
          author: {
            id: pr.user?.id?.toString() || "unknown",
            name: pr.user?.login || "Unknown",
            username: pr.user?.login || "unknown",
            email: "",
          },
          pr: prNumber,
          releases: ["test"],
        };

        const parsedCommit = parseCommit(mockCommit);
        const rules = await state.rules.getAll();
        const config = getAnnouncementConfig(parsedCommit, rules);

        if (!config) {
          // Create a default config for "announce anyway"
          const defaultConfig: AnnouncementConfig = {
            message: pr.title || "Pull request",
            voice: Voice.en_us_001,
            light: true,
          };

          res.json({
            success: true,
            wouldAnnounce: false,
            reason: "No matching rules for this commit",
            commit: mockCommit,
            parsed: parsedCommit,
            defaultConfig, // Provide default config for "announce anyway"
          });
          return;
        }

        res.json({
          success: true,
          wouldAnnounce: true,
          config,
          commit: mockCommit,
          parsed: parsedCommit,
        });
      } catch (error) {
        console.error("Error testing PR:", error);
        res.status(500).json({
          message: error instanceof Error ? error.message : "Failed to test PR",
        });
      }
    }
  );
});

app.post("/api/light/on", requireAuth, async (req, res) => {
  return Sentry.startSpan(
    { name: "api.lightOn", op: "http.server" },
    async () => {
      try {
        lightOn();
        res.json({ success: true, state: "on" });
      } catch (error) {
        console.error("Error turning light on:", error);
        res.status(500).json({
          message:
            error instanceof Error ? error.message : "Failed to turn light on",
        });
      }
    }
  );
});

app.post("/api/light/off", requireAuth, async (req, res) => {
  return Sentry.startSpan(
    { name: "api.lightOff", op: "http.server" },
    async () => {
      try {
        lightOff();
        res.json({ success: true, state: "off" });
      } catch (error) {
        console.error("Error turning light off:", error);
        res.status(500).json({
          message:
            error instanceof Error ? error.message : "Failed to turn light off",
        });
      }
    }
  );
});

app.get("/api/light/status", requireAuth, async (req, res) => {
  return Sentry.startSpan(
    { name: "api.lightStatus", op: "http.server" },
    async () => {
      res.json({ state: getLightState() ? "on" : "off" });
    }
  );
});

// Start server
export function startServer() {
  app.listen(PORT, () => {
    console.log(`🎁 The Box web interface running at http://localhost:${PORT}`);
  });
}
