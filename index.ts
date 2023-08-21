import { getNewCommits } from "./fetch";
import { init } from "./state";
import dotenv from "dotenv";

dotenv.config();

const main = async () => {
  await init();

  const commits = await getNewCommits();
  console.log(commits.map((c) => c.message));
};

main();
