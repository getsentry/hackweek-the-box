import type { Commit, Release } from "./types.js";
import { state } from "./state.js";
import axios, { type AxiosRequestConfig } from "axios";
import { mapKeys } from "radash";
import * as Sentry from "@sentry/node";

const BASE_URL = "https://sentry.sentry.io/api/0";

const PROJECT_IDS = [
  1, //sentry backend
  11276, // javascript frontend
];

interface SentryCommit extends Omit<Commit, "releases"> {
  releases: Release[];
  repository: {
    name: string;
  };
  pullRequest: {
    id: string;
    title: string;
  };
}

export async function getNewCommits(): Promise<Commit[]> {
  return Sentry.startSpan(
    { name: "getNewCommits", op: "function" },
    async (span) => {
      console.log("Fetching new commits");
      const releases = await getNewReleases();

      await state.releases.saveAll(releases);

      const allCommits = (
        await Promise.allSettled(releases.map(getCommitsForRelease))
      )
        .filter((p) => p.status === "fulfilled")
        // @ts-ignore
        .map((p: PromiseFulfilledResult<SentryCommit[]>) => p.value);

      const flattenedCommits: SentryCommit[] = allCommits.reduce(
        (acc, val) => acc.concat(val),
        []
      );

      const uniqueCommits = new Map(flattenedCommits.map((c) => [c.id, c]));
      const sentryRepoCommits = Array.from(uniqueCommits.values()).filter(
        (commit) => commit.repository.name === "getsentry/sentry"
      );

      const commits = sentryRepoCommits.map(transformCommit);

      span.setAttributes({
        newCommits: commits.length,
        uniqueCommits: uniqueCommits.size,
        sentryRepoCommits: sentryRepoCommits.length,
        totalCommits: flattenedCommits.length,
      });

      return commits;
    }
  );
}

async function getNewReleases(): Promise<Release[]> {
  return Sentry.startSpan(
    { name: "getNewReleases", op: "function" },
    async (span) => {
      try {
        const fetchSpan = Sentry.startInactiveSpan({
          name: "fetchReleases",
          op: "http.client",
        });
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
        fetchSpan.end();

        const relevantReleases = releases.filter(isRelevantRelease);

        const previousReleases = await state.releases.getAll();
        const versionReleases = mapKeys(previousReleases, (_, r) => r.version);

        const newReleases = relevantReleases.filter(
          (r: Release) => versionReleases[r.version] === undefined
        );

        span.setAttributes({
          releases: relevantReleases.length,
          newReleases: newReleases.length,
          relevantReleases: relevantReleases.length,
          previousReleases: Object.keys(previousReleases).length,
        });

        return newReleases;
      } catch (e) {
        logError("Error fetching releases", e);
        return [];
      }
    }
  );
}

async function getCommitsForRelease(release: Release): Promise<SentryCommit[]> {
  return Sentry.startSpan(
    { name: "getCommitsForRelease", op: "function" },
    async () => {
      const fetchSpan = Sentry.startInactiveSpan({
        name: "fetchCommits",
        op: "http.client",
      });
      try {
        const res = await get(
          `${BASE_URL}/projects/sentry/${getProjectSlug(release)}/releases/${
            release.version
          }/commits/`
        );
        fetchSpan.end();
        return res.data;
      } catch (e) {
        logError("Error fetching commits of release", e);
        return [];
      }
    }
  );
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

function transformCommit(commit: SentryCommit): Commit {
  return {
    id: commit.id,
    message: commit.pullRequest?.title || commit.message,
    dateCreated: commit.dateCreated,
    author: commit.author,
    pr: commit.pullRequest?.id,
    releases: commit.releases.map(getReleaseScope),
  };
}

function getReleaseScope(release: Release): string {
  return release?.version?.split("@")?.[0] ?? "unknown";
}

function getProjectSlug(release: Release): string {
  return release?.projects?.[0].slug ?? "sentry";
}

function logError(message: string, error: any) {
  if (error.response) {
    console.error(message, error.response.data.detail || error.response.data);
  } else {
    console.error(message, error.message);
  }
}
