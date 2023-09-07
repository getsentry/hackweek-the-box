import axios from "axios";
import { state } from "./state";

const BASE_URL = "https://api.github.com/repos/getsentry/sentry";

export async function getPR(id: string) {
  // check if we already have the PR in our database
  const pr = await state.PRs.get(id);
  if (pr) {
    return pr;
  }

  // otherwise, fetch it from github
  try {
    const res = await axios.get(`${BASE_URL}/pulls/${id}`, {});
    await state.PRs.save([res.data]);
    return res.data;
  } catch (error) {
    console.log(error);
    return { labels: [{ name: "frontend" }, { name: "backend" }] };
  }
}

export async function getPRScopes(id: string) {
  const pr = await getPR(id);
  const scopes = pr.labels
    .map((label: any) => label.name.toLowerCase())
    .filter((name: string) => name.startsWith("scope: "))
    .map((name: string) => name.replace("scope: ", ""));

  return scopes;
}
