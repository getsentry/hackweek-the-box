import db from "./db.js";
import { readFile, writeFile } from "./file.js";
import type { Commit, Release, Rule } from "./types.js";

const RULES_FILENAME = "../.rules.json";

export async function initState(): Promise<void> {
  console.log("Initializing state");
  try {
    if (process.env.NODE_ENV === "dev") {
      await wipe();
    }
  } catch (e) {
    await wipe();
  }
}

async function wipe(): Promise<void> {
  await db.clear("prs");
  await db.clear("releases");
  await db.clear("commits");
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
    get: (id: string) => db.findOne<Release>("releases", id),
    getAll: () => db.findAll<Release>("releases"),
    save: (data: Release) => db.save("releases", data),
    saveAll: (data: Release[]) => db.saveAll("releases", data),
  },
  commits: {
    getAll: () => db.findAll<Commit>("commits"),
    saveAll: (data: Commit[]) => db.saveAll("commits", data),
  },
  PRs: {
    get: (id: string) => db.findOne("prs", id),
    getAll: () => db.findAll("prs"),
    save: (data: any) => db.save("prs", data),
  },
  rules: {
    save: saveRule,
    getAll: getRules,
  },
};
