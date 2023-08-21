import { Commit, Release } from "./types";
import { state } from "./state";

const BASE_URL = "https://sentry.sentry.io/api/0";
const RECENT_THRESHOLD = 1000 * 30; // 30 seconds

interface SentryCommit extends Commit {
  pullRequest: {
    title: string;
  };
}

export async function getNewCommits(): Promise<Commit[]> {
  const releases = await getNewReleases();

  await state.releases.save(releases);

  const commits = (await Promise.allSettled(releases.map(getCommitsForRelease)))
    .filter((p) => p.status === "fulfilled")
    // @ts-ignore
    .map((p) => p.value);

  const flattenedCommits = commits.reduce((acc, val) => acc.concat(val), []);

  return flattenedCommits.map(transformCommit);
}

async function getNewReleases(): Promise<Release[]> {
  try {
    const res = await authFetch(`${BASE_URL}/organizations/sentry/releases/`);
    const releases: Release[] = await res.json();

    const relevantReleases = releases.filter(isRelevantRelease);
    // .filter(isRecentlyCreated);
    const previousReleases = await state.releases.getAll();

    const newReleases = relevantReleases.filter(
      (r) => previousReleases[r.id] === undefined
    );

    return newReleases;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function getCommitsForRelease(release: Release): Promise<SentryCommit[]> {
  try {
    const res = await authFetch(
      `${BASE_URL}/projects/sentry/sentry/releases/${release.version}/commits/`
    );
    const commits = await res.json();

    return commits;
  } catch (e) {
    console.error(e);
    return [];
  }
}

function authFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SENTRY_TOKEN}`,
    },
  });
}

function isRelevantRelease(release: Release): boolean {
  return (
    // isRecentlyCreated(release) &&
    release.status === "open" &&
    release.commitCount > 0 &&
    release.authors.length > 0 &&
    release.deployCount > 0 &&
    release.lastDeploy.environment === "prod" &&
    release.versionInfo.package === "backend"
  );
}

function isRecentlyCreated(
  release: Release,
  threshold = RECENT_THRESHOLD
): boolean {
  const created = new Date(release.dateCreated);
  const now = new Date();

  const diff = now.getTime() - created.getTime();

  return diff < threshold;
}

function transformCommit(commit: SentryCommit): Commit {
  return {
    id: commit.id,
    message: commit.pullRequest?.title || commit.message,
    dateCreated: commit.dateCreated,
    author: commit.author,
  };
}
