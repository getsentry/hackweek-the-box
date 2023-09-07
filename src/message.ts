import conventionalCommitsParser from "conventional-commits-parser";
import { Commit, ParsedCommit } from "./types";
import capitalize from "lodash.capitalize";

export function getAnnounceMessage(
  { type, scope, subject = "something" }: ParsedCommit,
  nickname: string
) {
  let announceMessage = `${nickname}`;

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
