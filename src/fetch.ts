import { Commit, Release } from "./types";
import { state } from "./state";
import axios, { AxiosRequestConfig } from "axios";

const BASE_URL = "https://sentry.sentry.io/api/0";
const RECENT_THRESHOLD = 1000 * 30; // 30 seconds

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

  await state.releases.save(releases);

  const commits = (await Promise.allSettled(releases.map(getCommitsForRelease)))
    .filter((p) => p.status === "fulfilled")
    // @ts-ignore
    .map((p) => p.value);

  const flattenedCommits: SentryCommit[] = commits.reduce(
    (acc, val) => acc.concat(val),
    []
  );

  const uniqueCommits = new Map(flattenedCommits.map((c) => [c.id, c]));

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

    const relevantReleases = releases
      .filter(isRelevantRelease)
      .filter(isRecentlyCreated);
    const previousReleases = await state.releases.getAll();

    const newReleases = relevantReleases.filter(
      (r: Release) => previousReleases[r.id] === undefined
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
    isRecentlyCreated(release) &&
    release.commitCount > 0 &&
    release.authors.length > 0 &&
    release.deployCount > 0 &&
    release.lastDeploy.environment === "prod" &&
    ["frontend", "backend"].includes(release.versionInfo.package)
  );
}

function isRecentlyCreated(
  release: Release,
  threshold = RECENT_THRESHOLD
): boolean {
  if (process.env.NODE_ENV === "dev") {
    return true;
  }

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

function getProjectSlug(release: Release): string {
  return release?.projects?.[0].slug ?? "sentry";
}
