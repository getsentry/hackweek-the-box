import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getAssetBasePath = () => {
  if (process.env.NODE_ENV === "production") {
    return join(__dirname, "..", "..", "..", "client", "assets");
  }
  return join(__dirname, "..", "..", "public", "assets");
};

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
  return join(getAssetBasePath(), file);
}

export function getTempPath(file: string = new Date().getTime().toString()) {
  return join(tmpdir(), file);
}
