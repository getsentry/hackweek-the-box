import conventionalCommitsParser from "conventional-commits-parser";
import { Commit, PlayConfig, Rule } from "./types";
import { Voice, randomSound, randomVoice } from "./audio";

export function getPlayConfig(
  commit: Commit,
  rules: Rule[]
): PlayConfig | void {
  const matchingRules = rules.filter((rule) => matches(commit, rule));

  if (matchingRules.length === 0) {
    return;
  }

  const defaultPlayConfig: PlayConfig = {
    nickname: commit.author.name,
    sound: randomSound(),
    voice: randomVoice(),
  };

  const playConfig = matchingRules.reduce((acc, rule) => {
    if (rule.play.nickname) {
      acc.nickname = rule.play.nickname;
    }
    if (rule.play.sound) {
      acc.sound = rule.play.sound;
    }
    if (rule.play.voice) {
      acc.voice = rule.play.voice;
    }
    return acc;
  }, defaultPlayConfig);

  return playConfig;
}

function matches({ author, message }: Commit, { match }: Rule) {
  const { type, scope } = conventionalCommitsParser.sync(message);

  const matchAuthor = match.author ? match.author === author.email : true;
  const matchType = match.type ? match.type === type : true;
  const matchScope = match.scope ? match.scope === scope : true;

  return matchAuthor && matchType && matchScope;
}
