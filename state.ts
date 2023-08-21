import { promises as fs } from "fs";
import { Release } from "./types";

const DB_FILENAME = ".db";

export async function init(): Promise<void> {
  try {
    await fs.readFile(DB_FILENAME, "utf-8");
  } catch (e) {
    await wipe();
  }
}

export async function wipe(): Promise<void> {
  await fs.writeFile(".db", JSON.stringify({ releases: {} }));
}

async function getReleasesFromDb(): Promise<Record<string, Release>> {
  const db = await fs.readFile(DB_FILENAME, "utf-8");
  return JSON.parse(db).releases;
}

async function getReleases(): Promise<Record<string, Release>> {
  return getReleasesFromDb();
}

async function saveReleases(releases: Release[]): Promise<void> {
  const dbReleases = await getReleasesFromDb();

  for (const release of releases) {
    dbReleases[release.id] = release;
  }

  await fs.writeFile(".db", JSON.stringify({ releases: dbReleases }));
}

export const state = {
  releases: {
    getAll: getReleases,
    save: saveReleases,
  },
};
