import { describe, it } from "node:test";
import { Commit } from "./types";
import { parseCommit } from "./utils";
import assert from "node:assert";

const commit: Commit = {
  id: "123",
  dateCreated: "2021-01-01T00:00:00.000Z",
  message: "feat: add new feature",
  releases: [],
  pr: "123",
  author: {
    id: "123",
    name: "Matej Minar",
    username: "matej.minar",
    email: "matej.minar@sentry.io",
  },
};

describe("parseCommit", () => {
  it("should parse commit", () => {
    const mockCommit = { ...commit };
    const parsedCommit = parseCommit(mockCommit);

    assert.equal(parsedCommit.type, "feat");
    assert.equal(parsedCommit.scope, undefined);
    assert.equal(parsedCommit.subject, "add new feature");
    assert.equal(parsedCommit.author.name, "Matej Minar");
  });

  it("should parse commit with scope", () => {
    const mockCommit = {
      ...commit,
      message: "feat(test-scope): add new feature",
    };
    const parsedCommit = parseCommit(mockCommit);

    assert.equal(parsedCommit.type, "feat");
    assert.equal(parsedCommit.scope, "test-scope");
    assert.equal(parsedCommit.subject, "add new feature");
    assert.equal(parsedCommit.author.name, "Matej Minar");
  });

  it("should parse revert commit", () => {
    const mockCommit = {
      ...commit,
      message: `Revert "feat(test-scope): add new feature"`,
    };
    const parsedCommit = parseCommit(mockCommit);

    assert.equal(parsedCommit.type, "revert");
    assert.equal(parsedCommit.scope, "test-scope");
    assert.equal(parsedCommit.subject, "add new feature");
    assert.equal(parsedCommit.author.name, "Matej Minar");
  });
});
