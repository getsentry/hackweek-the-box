import conventionalCommitsParser from "conventional-commits-parser";
import { Commit, PlayConfig, Rule } from "./types";
import { Voice, getCommitSound } from "./audio";

/*
 * This function takes a commit and a list of rules and returns a PlayConfig
 * It checks which rules commit matches and applies them in the order they are defined
 * If no rules match, it returns undefined, and the commit is ignored
 */
export function getPlayConfig(
  commit: Commit,
  rules: Rule[]
): PlayConfig | void {
  const matchingRules = rules.filter((rule) => matches(commit, rule));

  if (matchingRules.length === 0) {
    return;
  }

  const playConfig = matchingRules.reduce((acc, rule) => {
    return { ...acc, ...rule.play };
  }, getDefaultConfig(commit));

  return playConfig;
}

function matches({ author, message }: Commit, { match }: Rule) {
  const { type, scope } = conventionalCommitsParser.sync(message);

  const matchAuthor = match.author ? match.author === author.email : true;
  const matchType = match.type ? match.type === type : true;
  const matchScope = match.scope
    ? sanitizeScope(match.scope) === sanitizeScope(scope as string)
    : true;

  return matchAuthor && matchType && matchScope;
}

function getDefaultConfig({ author, message }: Commit): PlayConfig {
  const { type } = conventionalCommitsParser.sync(message);

  return {
    nickname: author.name,
    sound: getCommitSound(type as string),
    voice: Voice.en_us_001,
  };
}

function sanitizeScope(scope?: string) {
  if (!scope) {
    return;
  }

  return scope.replace(/\W/g, "");
}
