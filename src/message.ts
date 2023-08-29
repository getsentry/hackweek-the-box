import conventionalCommitsParser from "conventional-commits-parser";
import { Commit, ParsedCommit } from "./types";
import capitalize from "lodash.capitalize";

export function getAnnounceMessage(
  { type, scope, subject }: ParsedCommit,
  nickname: string
) {
  // if (!commit.subject) {
  //   if (commit.message.startsWith("Revert")) {
  //     return `Umm, I think we have to go back`;
  //   } else {
  //     // Ignore if we can't build a reasonable message
  //     return;
  //   }
  // }

  // Start the message with author's name
  let announceMessage = `${nickname}`;

  // Include the what and where
  switch (type) {
    case "feat":
      announceMessage += ` just shipped a new feature`;
      announceMessage += scope ? ` to ${scope.toLowerCase()}` : "";
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
    case "revert":
      announceMessage += ` just reverted the ${
        scope ? scope.toLowerCase() : "code"
      }`;
      announceMessage += subject ? `. ${capitalize(subject)}!` : "!";
      break;
    default:
      announceMessage += ` just deployed ${subject?.toLowerCase()}`;
      announceMessage += scope ? ` in ${scope.toLowerCase()}!` : "!";
  }

  return announceMessage;
}
