import conventionalCommitsParser  from 'conventional-commits-parser';
import { Commit } from './types';
import capitalize from 'lodash.capitalize';

// Authors not in this map will be ignored
const AUTHOR_MAP: Record<string, {nickname: string}> = {
    'matej.minar@sentry.io': {
        nickname: 'Ma-tay',
    },
    'ognjen.bostjancic@sentry.io': {
        nickname: 'Ogi',
    }
}

export function getAnnounceMessage(commit: Commit) {
    // Ignore unknown authors
    if (!Object.keys(AUTHOR_MAP).includes(commit.author.email)) {
        return;
    }
    
    let announceMessage = '';
    const {type, scope, subject} = conventionalCommitsParser.sync(commit.message);
    
    // Ignore if we can't build a reasonable message
    if (!subject) {
        return;
    }

    // Start the message with author's name
    announceMessage += AUTHOR_MAP[commit.author.email].nickname;

    // Include the what and where
    switch (type) {
        case 'feat':
            announceMessage += ` just shipped a new feature`
            announceMessage += scope ? ` to the ${scope.toLowerCase()}` : ''
            announceMessage += subject ? `. ${capitalize(subject)}!` : '!'
            break;
        case 'fix':
            announceMessage += ` just fixed the ${scope ? scope.toLowerCase() : 'code'}`
            announceMessage += subject ? `. ${capitalize(subject)}!` : '!'
            break;
        case 'ref':
            announceMessage += ` just refactored the ${scope ? scope.toLowerCase() : 'code'}`
            announceMessage += subject ? `. ${capitalize(subject)}!` : '!'
            break;

        default:
            announceMessage += ` just deployed ${subject.toLowerCase()}`
            announceMessage += scope ? ` in ${scope.toLowerCase()}!` : '!'
    }

    return announceMessage;
}

