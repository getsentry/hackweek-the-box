import { readFile, writeFile } from "./file";
import { Release, Rule } from "./types";

const DB_FILENAME = "../.db";
const RULES_FILENAME = "../.rules.json";

export async function initState(): Promise<void> {
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
  await writeFile(DB_FILENAME, JSON.stringify({ releases: {} }));
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
  const rules = await readFile(RULES_FILENAME);
  return JSON.parse(rules);
}

async function saveRule(rule: Rule): Promise<void> {
  const rules = await readFile(RULES_FILENAME);
  const parsed = JSON.parse(rules);

  parsed.push(rule);

  await writeFile(RULES_FILENAME, JSON.stringify(parsed));
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
