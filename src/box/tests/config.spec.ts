import { assert, describe, it } from "vitest";
import { Voice } from "../audio.js";
import { getAnnouncementConfig } from "../config.js";
import type { ParsedCommit, Rule, RuleConfig } from "../types.js";

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
    assert.isDefined(config);

    assert.equal(
      // @ts-expect-error - we know it's defined
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
    assert.isDefined(config);

    assert.equal(
      // @ts-expect-error - we know it's defined
      config.message,
      "Nickname just shipped a new feature to dynamic-sampling. Adjust sampling rate!"
    );
    // @ts-expect-error - we know it's defined

    assert.equal(config.voice, Voice.en_au_001);
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
