import { sync } from "conventional-commits-parser";
import type { Commit, CommitType, ParsedCommit } from "./types.js";
import shelljs from "shelljs";
import * as Sentry from "@sentry/node";
import { execSync } from "child_process";

export const sleep = (miliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, miliseconds));

export const runEvery = (seconds: number, fn: () => Promise<void>) => {
  const wrappedFn = async () => {
    await fn();
    setTimeout(wrappedFn, seconds * 1000);
  };

  wrappedFn();
};

export const parseCommit = (commit: Commit): ParsedCommit => {
  return Sentry.startSpan({ name: "parseCommit", op: "function" }, () => {
    try {
      if (commit.message.startsWith("Revert")) {
        const originalMessage = commit.message.match(/Revert "(.*)"/)?.[1];

        const parsed = parseCommit({
          ...commit,
          message: originalMessage || "",
        });

        return { ...parsed, type: "revert" };
      }

      const { type, scope, subject } = sync(commit.message);

      const parsedType = type ? type.trim() : "unknown";

      return {
        type: parsedType as CommitType,
        scope: scope ? scope.trim() : undefined,
        subject: subject ? subject.trim() : commit.message,
        author: commit.author,
      };
    } catch (err) {
      return {
        type: "unknown",
        scope: undefined,
        subject: commit.message,
        author: commit.author,
      };
    }
  });
};

export function normalizeString(parameter: unknown): string {
  if (typeof parameter !== "string") {
    return "";
  }

  const truncated = parameter.slice(0, 100);
  const normalized = truncated.replace(/[^a-zA-Z0-9\s.!;,-]/g, "");

  return normalized;
}

export const exec = (cmd: string) => shelljs.exec(cmd);

export function sendMetric(name: string, value: number) {
  return Sentry.startSpan({ name }, (span) => {
    span.setAttribute("value", value);
  });
}

export function sendMetrics(metrics: Record<string, number>) {
  return Sentry.startSpan({ name: "sendMetrics" }, (span) => {
    span.setAttributes(metrics);
  });
}

export const getCurrentVersion = () => {
  try {
    return execSync("git rev-parse HEAD").toString().trim().slice(0, 8);
  } catch (error) {
    return "unknown";
  }
};
