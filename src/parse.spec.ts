import assert from "node:assert";
import { describe, it } from "node:test";
import { getAnnounceMessage } from "./message.js";
import { Commit } from "./types.js";
import { parseCommit } from "./utils.js";

const parseAndConstruct = (message: string) => {
  const commit = { message } as Commit;
  const parsed = parseCommit(commit);
  return getAnnounceMessage(parsed, "Someone");
};

describe("parse commit and construct message", () => {
  it("should construct message", () => {
    assert.equal(
      parseAndConstruct("feat(test-scope): add new feature"),
      "Someone just shipped a new feature to test-scope. Add new feature!"
    );
    assert.equal(
      parseAndConstruct("fix(test-scope): add new feature"),
      "Someone just fixed the test-scope. Add new feature!"
    );
    assert.equal(
      parseAndConstruct("ref(test-scope): add new feature"),
      "Someone just refactored the test-scope. Add new feature!"
    );
    assert.equal(
      parseAndConstruct("feat: add new feature"),
      "Someone just shipped a new feature. Add new feature!"
    );
    assert.equal(
      parseAndConstruct("ref: add new feature"),
      "Someone just refactored the code. Add new feature!"
    );
    assert.equal(
      parseAndConstruct("feat(metrics) did something "),
      "Someone just deployed feat(metrics) did something !"
    );
    assert.equal(
      parseAndConstruct("did something"),
      "Someone just deployed did something!"
    );
  });
});
