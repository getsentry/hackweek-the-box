import assert from "assert";
import * as fetch from "../src/fetch";
import { describe, it, mock } from "node:test";
import { checkForNewCommits } from "../src/index";

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
