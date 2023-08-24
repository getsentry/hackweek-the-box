import conventionalCommitsParser from "conventional-commits-parser";
import { Commit } from "./types";
import capitalize from "lodash.capitalize";

export function getAnnounceMessage(commit: Commit, nickname: string) {
  // Ignore unknown authors

  let announceMessage = "";
  const { type, scope, subject } = conventionalCommitsParser.sync(
    commit.message
  );
  if (!subject) {
    if (commit.message.startsWith("Revert")) {
      return `Umm, I think we have to go back`;
    } else {
      // Ignore if we can't build a reasonable message
      return;
    }
  }

  // Start the message with author's name
  announceMessage += nickname;

  // Include the what and where
  switch (type) {
    case "feat":
      announceMessage += ` just shipped a new feature`;
      announceMessage += scope ? ` to  ${scope.toLowerCase()}` : "";
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
