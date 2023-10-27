import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { Release } from "./types.js";

type Data = {
  releases: Record<string, Release>;
  prs: Record<string, any>;
  commits: Record<string, any>;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "..", ".db.json");

const adapter = new JSONFile<Data>(file);

const defaultData = { releases: {}, prs: {}, commits: {} };

const db = new Low<Data>(adapter, defaultData);

async function findAll<T>(key: keyof Data): Promise<Record<string, T>> {
  await db.read();
  return db.data[key] as Record<string, T>;
}

async function findOne<T>(key: keyof Data, id: string): Promise<T> {
  await db.read();
  return db.data[key][id] as T;
}

async function save(key: keyof Data, data: any) {
  await db.read();
  db.data[key][data.id] = data;
  await db.write();
}

async function saveAll(key: keyof Data, data: any[]) {
  await db.read();
  for (const item of data) {
    db.data[key][item.id] = item;
  }
  await db.write();
}

async function remove(key: keyof Data, id: string) {
  await db.read();
  delete db.data[key][id];
  await db.write();
}

async function clear(key: keyof Data) {
  await db.read();
  db.data[key] = {};
  await db.write();
}

export default {
  findAll,
  findOne,
  save,
  saveAll,
  remove,
  clear,
};
