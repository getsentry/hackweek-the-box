import { describe, it } from "node:test";
import { ParsedCommit } from "../types.js";
import assert from "node:assert";
import { getAnnounceMessage } from "../message.js";

const toCommit = (type: any, scope: any, subject: any): ParsedCommit => ({
  type,
  scope,
  subject,
  author: undefined as any,
});

describe("getAnnounceMessage", () => {
  it("should construct message with all params", () => {
    assert.equal(
      getAnnounceMessage(
        toCommit("feat", "test-scope", "added support for hackweek"),
        "Someone"
      ),
      "Someone just shipped a new feature to test-scope. Added support for hackweek!"
    );
    assert.equal(
      getAnnounceMessage(
        toCommit("fix", "test-scope", "removed bug in hackweek bias"),
        "Someone"
      ),
      "Someone just fixed the test-scope. Removed bug in hackweek bias!"
    );
    assert.equal(
      getAnnounceMessage(
        toCommit("ref", "test-scope", "moved the bugs somewhere else"),
        "Someone"
      ),
      "Someone just refactored the test-scope. Moved the bugs somewhere else!"
    );
  });

  it("should construct message with missing params", () => {
    assert.equal(
      getAnnounceMessage(
        toCommit(undefined, "test-scope", "added support for hackweek"),
        "Someone"
      ),
      "Someone just deployed added support for hackweek in test-scope!"
    );
    assert.equal(
      getAnnounceMessage(
        toCommit(undefined, undefined, "added support for hackweek"),
        "Someone"
      ),
      "Someone just deployed added support for hackweek!"
    );
    assert.equal(
      getAnnounceMessage(toCommit(undefined, undefined, undefined), "Someone"),
      "Someone just deployed something!"
    );
  });
});
