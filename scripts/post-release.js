import execa from "execa";
import fs from "fs";
import Listr from "listr";
import path from "path";
import { fileURLToPath } from "url";

/**
 * @type {Listr<{ tag: string, latestTags: string[] }>}
 */
const tasks = new Listr([
  {
    title: "Getting latest tags",
    async task(ctx, task) {
      const pkg = await fs.promises.readFile(
        path.join(
          path.dirname(fileURLToPath(import.meta.url)),
          "..",
          "package.json"
        ),
        "utf8"
      );

      const { version } = JSON.parse(pkg);

      task.output = `Parsing version: ${version}`;

      const [major, minor] = version.split(".");
      const currentTags = [`v${major}`, `v${major}.${minor}`];

      ctx.tag = `v${version}`;
      ctx.latestTags = [`v${major}`, `v${major}.${minor}`];

      task.output = `Resolved tags: ${currentTags.join(", ")}`;
    },
  },

  {
    title: "Removing tags",
    task({ latestTags }, task) {
      task.output = `Removing: ${latestTags.join(", ")}`;

      return execa("git", ["push", "--delete", "origin", ...latestTags]).catch(
        () => {
          task.skip(`Failed to remove tags: ${latestTags.join(", ")}`);
        }
      );
    },
  },

  {
    title: "Changing tag references",
    async task({ tag, latestTags }, task) {
      for (const latestTag of latestTags) {
        task.output = `Changing reference of ${latestTag} to ${tag}`;
        await execa("git", ["tag", "--force", latestTag, tag]);
      }
    },
  },

  {
    title: "Pushing updated tags",
    task() {
      return execa("git", ["push", "origin", "--tags"]);
    },
  },

  {
    title: "Creating release draft",
    task() {
      return execa("npx", ["np", "--release-draft-only"]);
    },
  },
]);

tasks.run().catch((error) => {
  process.exitCode = error.exitCode || 1;

  if (error.stderr) console.error(error.stderr);
  else console.error(error);
});
