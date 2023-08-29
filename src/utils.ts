import conventionalCommitsParser from "conventional-commits-parser";
import { Commit, ParsedCommit } from "./types";

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
  if (commit.message.startsWith("Revert")) {
    const originalMessage = commit.message.match(/Revert "(.*)"/)?.[1];

    const parsed = parseCommit({
      ...commit,
      message: originalMessage || "",
    });

    return { ...parsed, type: "revert" };
  }

  const { type, scope, subject } = conventionalCommitsParser.sync(
    commit.message
  );

  return {
    type: type ? type.trim() : undefined,
    scope: scope ? scope.trim() : undefined,
    subject: subject ? subject.trim() : undefined,
    author: commit.author,
  };
};
