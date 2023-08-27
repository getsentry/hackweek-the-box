import { AnnouncementConfig, Rule, ParsedCommit, RuleConfig } from "./types";
import { Voice, getCommitSound } from "./audio";
import { getAnnounceMessage } from "./message";

/*
 * This function takes a commit and a list of rules and returns a PlayConfig
 * It checks which rules commit matches and applies them in the order they are defined
 * If no rules match, it returns undefined, and the commit is ignored
 */
export function getAnnouncementConfig(
  commit: ParsedCommit,
  rules: Rule[]
): AnnouncementConfig | void {
  const ruleDefinedConfig = getConfigFromRules(commit, rules);

  if (!ruleDefinedConfig) {
    return;
  }

  const message = getAnnounceMessage(commit, ruleDefinedConfig.nickname);

  if (!message) {
    console.error("Could not generate a message");
    return;
  }

  return {
    message,
    voice: ruleDefinedConfig.voice,
    sound: ruleDefinedConfig.sound,
    light: ruleDefinedConfig.light,
  };
}

function getConfigFromRules(commit: ParsedCommit, rules: Rule[]) {
  const matchingRules = rules.filter((rule) => matches(commit, rule));

  if (matchingRules.length === 0) {
    return;
  }

  const config = matchingRules.reduce((acc, rule) => {
    return { ...acc, ...rule.play };
  }, getDefaultConfig(commit));

  return config;
}

function matches({ author, type, scope }: ParsedCommit, { match }: Rule) {
  const matchAuthor = match.author ? match.author === author.email : true;
  const matchType = match.type ? match.type === type : true;
  const matchScope = match.scope
    ? sanitizeScope(match.scope) === sanitizeScope(scope as string)
    : true;

  return matchAuthor && matchType && matchScope;
}

function getDefaultConfig({ author, type }: ParsedCommit): RuleConfig {
  return {
    light: true,
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
