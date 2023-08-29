import { Commit, Release } from "./types";
import { state } from "./state";
import axios, { AxiosRequestConfig } from "axios";

const BASE_URL = "https://sentry.sentry.io/api/0";
const RECENT_THRESHOLD = 1000 * 60 * 5; // 5 minutes

const PROJECT_IDS = [
  1, //sentry backend
  11276, // javascript frontend
];

interface SentryCommit extends Commit {
  pullRequest: {
    title: string;
  };
}

export async function getNewCommits(): Promise<Commit[]> {
  const releases = await getNewReleases();
  console.log("Found", releases.length, "new releases");

  await state.releases.save(releases);

  const commits = (await Promise.allSettled(releases.map(getCommitsForRelease)))
    .filter((p) => p.status === "fulfilled")
    // @ts-ignore
    .map((p) => p.value);

  const flattenedCommits: SentryCommit[] = commits.reduce(
    (acc, val) => acc.concat(val),
    []
  );
  console.log("Found total of", flattenedCommits.length, "commits");

  const uniqueCommits = new Map(flattenedCommits.map((c) => [c.id, c]));
  console.log("Found", uniqueCommits.size, "unique commits");

  return [...uniqueCommits.values()].map(transformCommit);
}

async function getNewReleases(): Promise<Release[]> {
  try {
    const { data: releases } = await get(
      `${BASE_URL}/organizations/sentry/releases/`,
      {
        params: {
          per_page: 20,
          sort: "date",
          status: "open",
          project: PROJECT_IDS,
        },
      }
    );
    console.log("Total new releases", releases.length);
    const recentReleases = releases.filter(isRecentlyCreated);
    console.log("Recent releases", recentReleases.length);
    const relevantReleases = recentReleases.filter(isRelevantRelease);
    console.log("Relevant releases", relevantReleases.length);
    const previousReleases = await state.releases.getAll();
    console.log("Previous releases", Object.keys(previousReleases).length);
    const newReleases = relevantReleases.filter(
      (r: Release) => previousReleases[r.versionInfo.buildHash] === undefined
    );

    return newReleases;
  } catch (e) {
    console.error(
      "Error fetching releases",
      // @ts-expect-error Axios errors
      e.response.data.detail || e.response.data || e.message
    );
    return [];
  }
}

async function getCommitsForRelease(release: Release): Promise<SentryCommit[]> {
  try {
    const res = await get(
      `${BASE_URL}/projects/sentry/${getProjectSlug(release)}/releases/${
        release.version
      }/commits/`
    );

    return res.data;
  } catch (e) {
    console.error(
      "Error fetching commits of release",
      release.version,
      // @ts-expect-error Axios errors
      e.response.data.detail || e.response.data || e.message
    );
    return [];
  }
}

function get(url: string, config?: AxiosRequestConfig) {
  return axios.get(url, {
    ...config,
    headers: {
      Authorization: `Bearer ${process.env.SENTRY_TOKEN}`,
    },
  });
}

function isRelevantRelease(release: Release): boolean {
  return (
    release.commitCount > 0 &&
    release.authors.length > 0 &&
    release.deployCount > 0 &&
    release.lastDeploy.environment === "prod" &&
    ["frontend", "backend"].includes(release.versionInfo.package)
  );
}

function isRecentlyCreated(release: Release): boolean {
  if (process.env.NODE_ENV === "dev") {
    return true;
  }
  const created = new Date(release.dateCreated);
  const now = new Date();

  const diff = now.getTime() - created.getTime();

  return diff < RECENT_THRESHOLD;
}

function transformCommit(commit: SentryCommit): Commit {
  return {
    id: commit.id,
    message: commit.pullRequest?.title || commit.message,
    dateCreated: commit.dateCreated,
    author: commit.author,
  };
}

function getProjectSlug(release: Release): string {
  return release?.projects?.[0].slug ?? "sentry";
}
