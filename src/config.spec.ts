import assert from "node:assert";
import { describe, it } from "node:test";
import { Voice } from "../src/audio.js";
import { getAnnouncementConfig } from "../src/config.js";
import { ParsedCommit, Rule, RuleConfig } from "../src/types.js";

function mockParsedCommit(author: string, message: string): ParsedCommit {
  return {
    type: "feat",
    scope: "dynamic-sampling",
    subject: message,
    author: {
      id: Date.now().toString(),
      name: author,
      username: author,
      email: author,
    },
  };
}

function authorRule(author: string, config: Partial<RuleConfig> = {}): Rule {
  return {
    match: {
      author,
    },
    play: {
      nickname: "Nickname",
      voice: Voice.en_us_001,
      ...config,
    },
  };
}

describe("getAnnouncementConfig", () => {
  const commitMsg = "adjust sampling rate";

  it("should return play config (simple)", () => {
    const email = "matej.minar@sentry.io";
    const commit = mockParsedCommit(email, commitMsg);
    const rules = [authorRule(email)];

    const config = getAnnouncementConfig(commit, rules);

    assert.equal(
      config?.message,
      "Nickname just shipped a new feature to dynamic-sampling. Adjust sampling rate!"
    );
  });

  it("should return play config (merged)", () => {
    const email = "matej.minar@sentry.io";
    const commit = mockParsedCommit(email, commitMsg);
    const rules = [
      authorRule(email),
      authorRule(email, { voice: Voice.en_au_001 }),
    ];

    const config = getAnnouncementConfig(commit, rules);

    assert.equal(
      config?.message,
      "Nickname just shipped a new feature to dynamic-sampling. Adjust sampling rate!"
    );
    assert.equal(config?.voice, Voice.en_au_001);
  });

  it("should return announcement config (sanitized scope match)", () => {
    const email = "matej.minar@sentry.io";
    const commit = mockParsedCommit(email, commitMsg);
    const rules = [
      {
        match: { scope: "dynamic-sampling" },
        play: {
          nickname: "Nickname",
          voice: Voice.en_us_001,
        },
      },
    ];

    const config = getAnnouncementConfig(commit, rules);

    assert.equal(typeof config, "object");
  });

  it("should return nothing", () => {
    const email = "matej.minar@sentry.io";
    const commit = mockParsedCommit(email, commitMsg);
    const rules: Rule[] = [];

    const config = getAnnouncementConfig(commit, rules);

    assert.equal(config, undefined);
  });
});
