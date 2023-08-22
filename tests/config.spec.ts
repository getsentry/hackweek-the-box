import assert from "assert";
import * as fetch from "../src/fetch";
import { describe, it, mock } from "node:test";
import { checkForNewCommits } from "../src/index";
import { PlayConfig, Rule } from "../src/types";
import { getPlayConfig } from "../src/config";
import { partial } from "lodash";
import { Voice } from "../src/audio";

function mockCommit(author: string, message: string) {
  return {
    id: Date.now().toString(),
    message,
    dateCreated: new Date().toISOString(),
    author: {
      id: Date.now().toString(),
      name: author,
      username: author,
      email: author,
    },
  };
}

function authorRule(author: string, config: Partial<PlayConfig> = {}): Rule {
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

describe("getPlayConfig", () => {
  const commitMsg = "fix(dynamic-sampling) adjust sampling rate";

  it("should return play config (simple)", () => {
    const email = "matej.minar@sentry.io";
    const commit = mockCommit(email, commitMsg);
    const rules = [authorRule(email)];

    const config = getPlayConfig(commit, rules);

    assert.equal(config?.nickname, "Nickname");
  });

  it("should return play config (merged)", () => {
    const email = "matej.minar@sentry.io";
    const commit = mockCommit(email, commitMsg);
    const rules = [
      authorRule(email),
      authorRule(email, { voice: Voice.en_au_001 }),
    ];

    const config = getPlayConfig(commit, rules);

    assert.equal(config?.nickname, "Nickname");
    assert.equal(config?.voice, "voice");
  });

  it("should return nothing", () => {
    const email = "matej.minar@sentry.io";
    const commit = mockCommit(email, commitMsg);

    const rules: Rule[] = [];

    const config = getPlayConfig(commit, rules);

    assert.equal(config, undefined);
  });
});
