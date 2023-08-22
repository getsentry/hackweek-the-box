import { promises as fs } from "fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ASSET_BASE_PATH = join(__dirname, "..", "assets");

export function readFile(path: string) {
  return fs.readFile(join(__dirname, path), "utf-8");
}

export function writeFile(path: string, content: string) {
  return fs.writeFile(join(__dirname, path), content);
}

export function readAsset(file: string) {
  return readFile(getAssetPath(file));
}

export function getAssetPath(file: string) {
  return join(ASSET_BASE_PATH, file);
}

export function getTempPath(file: string = new Date().getTime().toString()) {
  return join(tmpdir(), file);
}
