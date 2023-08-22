import conventionalCommitsParser from "conventional-commits-parser";
import { Commit } from "./types";
import capitalize from "lodash.capitalize";

export function getAnnounceMessage(commit: Commit, nickname: string) {
  // Ignore unknown authors

  let announceMessage = "";
  const { type, scope, subject } = conventionalCommitsParser.sync(
    commit.message
  );

  // Ignore if we can't build a reasonable message
  if (!subject) {
    return;
  }

  // Start the message with author's name
  announceMessage += nickname;

  // Include the what and where
  switch (type) {
    case "feat":
      announceMessage += ` just shipped a new feature`;
      announceMessage += scope ? ` to the ${scope.toLowerCase()}` : "";
      announceMessage += subject ? `. ${capitalize(subject)}!` : "!";
      break;
    case "fix":
      announceMessage += ` just fixed the ${
        scope ? scope.toLowerCase() : "code"
      }`;
      announceMessage += subject ? `. ${capitalize(subject)}!` : "!";
      break;
    case "ref":
      announceMessage += ` just refactored the ${
        scope ? scope.toLowerCase() : "code"
      }`;
      announceMessage += subject ? `. ${capitalize(subject)}!` : "!";
      break;

    default:
      announceMessage += ` just deployed ${subject.toLowerCase()}`;
      announceMessage += scope ? ` in ${scope.toLowerCase()}!` : "!";
  }

  return announceMessage;
}
