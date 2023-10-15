import assert from "node:assert";
import * as fetch from "../fetch.js";
import { describe, it, mock } from "node:test";
import { checkForNewCommits } from "../index.js";

describe("checkForNewCommits", () => {
  it("test", async () => {
    // mock.method(fetch, "getNewCommits", async () => {
    //   return Promise.resolve([]);
    // });
    // try {
    //   await checkForNewCommits();
    //   console.log("test");
    // } catch (e) {
    //   console.log("catch");
    //   console.log(e);
    // }
    assert.ok(true);
  });
});
