import type { Commit } from "../types.js";
import { normalizeString, parseCommit } from "../utils.js";
import { assert, describe, it } from "vitest";

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

  it("should parse a non conventional commit", () => {
    const mockCommit = {
      ...commit,
      message: `I am not a conventional commit`,
    };
    const parsedCommit = parseCommit(mockCommit);

    assert.equal(parsedCommit.type, "unknown");
    assert.equal(parsedCommit.scope, undefined);
    assert.equal(parsedCommit.subject, "I am not a conventional commit");
    assert.equal(parsedCommit.author.name, "Matej Minar");
  });
});

describe("normalizeString", () => {
  it("should return null when the parameter is not a string", () => {
    const result = normalizeString(123);
    assert.strictEqual(result, "");
  });

  it("should truncate and normalize the string, removing special characters", () => {
    const parameter = "Hello @World!; #42.";
    const result = normalizeString(parameter);
    assert.strictEqual(result, "Hello World!; 42.");
  });

  it("should handle an empty string and return an empty result", () => {
    const parameter = "";
    const result = normalizeString(parameter);
    assert.strictEqual(result, "");
  });

  it("should handle a string with only special characters and return an empty result", () => {
    const parameter = "!@#$%^&*()";
    const result = normalizeString(parameter);
    assert.strictEqual(result, "!");
  });

  it("should handle a string with only alphanumeric characters, dots, commas, and spaces", () => {
    const parameter = "abc 123.,";
    const result = normalizeString(parameter);
    assert.strictEqual(result, "abc 123.,");
  });

  it("should handle a string with a length greater than 100 characters", () => {
    const parameter =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor purus ipsum, vel tempor odio feugiat in.";
    const result = normalizeString(parameter);
    assert.strictEqual(
      result,
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor purus ipsum, vel tempor odio feu"
    );
  });
});
