import db from "./db.js";
import { readFile, writeFile } from "./file.js";
import { Release, Rule } from "./types.js";

const RULES_FILENAME = "../.rules.json";

export async function initState(): Promise<void> {
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
    get: (id: string) => db.findOne("releases", id),
    getAll: () => db.findAll("releases"),
    save: (data: Release) => db.save("releases", data),
    saveAll: (data: Release[]) => db.saveAll("releases", data),
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
