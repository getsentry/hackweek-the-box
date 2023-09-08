import { readFile, writeFile } from "./file.js";
import { Release, Rule } from "./types.js";

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
  await writeFile(DB_FILENAME, JSON.stringify({ releases: {}, prs: {} }));
}

async function getEntities(
  key: "releases" | "prs"
): Promise<Record<string, Release>> {
  const db = await readFile(DB_FILENAME);
  return JSON.parse(db)[key];
}

async function saveEntities(
  key: "releases" | "prs",
  entities: unknown
): Promise<void> {
  const db = await readFile(DB_FILENAME);
  const dbJson = JSON.parse(db);

  dbJson[key] = entities;

  await writeFile(DB_FILENAME, JSON.stringify(dbJson));
}

async function getReleases(): Promise<Record<string, Release>> {
  return getEntities("releases");
}

async function saveReleases(releases: Release[]): Promise<void> {
  const dbReleases = await getReleases();

  for (const release of releases) {
    dbReleases[release.version] = release;
  }

  await saveEntities("releases", dbReleases);
}

async function getPRs(): Promise<Record<string, any>> {
  return getEntities("prs");
}

async function getPR(number: string): Promise<Record<string, any>> {
  return (await getPRs())[number];
}

async function savePRs(prs: any[]): Promise<void> {
  const dbPrs = await getPRs();

  for (const pr of prs) {
    dbPrs[pr.number] = pr;
  }

  await saveEntities("prs", dbPrs);
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
  PRs: {
    get: getPR,
    getAll: getPRs,
    save: savePRs,
  },
  rules: {
    save: saveRule,
    getAll: getRules,
  },
};
