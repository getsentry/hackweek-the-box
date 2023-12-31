import parser from "conventional-commits-parser";
import { Commit, CommitType, ParsedCommit } from "./types.js";

export const sleep = (miliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, miliseconds));

export const runEvery = (seconds: number, fn: () => void) => {
  const wrappedFn = async () => {
    await fn();
    setTimeout(wrappedFn, seconds * 1000);
  };

  wrappedFn();
};

export const parseCommit = (commit: Commit): ParsedCommit => {
  try {
    if (commit.message.startsWith("Revert")) {
      const originalMessage = commit.message.match(/Revert "(.*)"/)?.[1];

      const parsed = parseCommit({
        ...commit,
        message: originalMessage || "",
      });

      return { ...parsed, type: "revert" };
    }

    const { type, scope, subject } = parser.sync(commit.message);

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
};