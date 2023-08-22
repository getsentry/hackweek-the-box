import { readFile, writeFile } from "./file";
import { Release, Rule } from "./types";

const DB_FILENAME = "../.db";

const DEFAULT_RULES = [
  {
    match: {
      author: "matej.minar@sentry.io",
    },
    play: {
      nickname: "Ma-tay",
    },
  },
  {
    match: {
      author: "ognjen.bostjancic@sentry.io",
    },
    play: {
      nickname: "O-ghee",
    },
  },
  {
    match: {
      author: "radu.woinarowski@sentry.io",
    },
    play: {
      nickname: "Rah-doo",
      sound: "WOOF",
    },
  },
  {
    match: {
      author: "riccardo.busseti@sentry.io",
    },
    play: {
      voice: "it_001",
    },
  },
  // TESTING - REMOVE
  {
    match: {
      author: "megan@sentry.io",
    },
    play: {
      nickname: "Megan",
    },
  },
  {
    match: {
      scope: "heroku",
    },
    play: {
      voice: "en_uk_001",
    },
  },
];

export async function init(): Promise<void> {
  try {
    await readFile(DB_FILENAME);
    if (process.env.NODE_ENV === "dev") {
      await wipe();
    }
  } catch (e) {
    await wipe();
  }
}

async function wipe(): Promise<void> {
  await writeFile(
    DB_FILENAME,
    JSON.stringify({ releases: {}, rules: DEFAULT_RULES })
  );
}

async function getReleases(): Promise<Record<string, Release>> {
  const db = await readFile(DB_FILENAME);
  return JSON.parse(db).releases;
}

async function saveReleases(releases: Release[]): Promise<void> {
  const db = await readFile(DB_FILENAME);
  const dbJson = JSON.parse(db);

  for (const release of releases) {
    dbJson.releases[release.versionInfo.buildHash] = release;
  }

  await writeFile(DB_FILENAME, JSON.stringify(dbJson));
}

async function getRules(): Promise<Rule[]> {
  const db = await readFile(DB_FILENAME);
  return JSON.parse(db).rules;
}

async function saveRule(rule: Rule): Promise<void> {
  const db = await readFile(DB_FILENAME);
  const dbJson = JSON.parse(db);

  dbJson.rules.push(rule);

  await writeFile(DB_FILENAME, JSON.stringify(dbJson));
}

export const state = {
  releases: {
    getAll: getReleases,
    save: saveReleases,
  },
  rules: {
    save: saveRule,
    getAll: getRules,
  },
};
