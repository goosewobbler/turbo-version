import { cwd, exit } from "node:process";
import { type Package, getPackagesSync } from "@manypkg/get-packages";
import { gitProcess } from "@turbo-version/git";
import { log } from "@turbo-version/log";
import type { Config } from "@turbo-version/setup";
import chalk from "chalk";
import type { ReleaseType } from "semver";
import { formatTag, formatTagPrefix } from "./utils/FormatTag";
import { generateChangelog } from "./utils/GenerateChangelog";
import { generateVersion } from "./utils/GenerateVersion";
import { generateVersionByBranchPattern } from "./utils/GenerateVersionByBranchPattern";
import { getLatestTag } from "./utils/GetLatestTag";
import { formatCommitMessage } from "./utils/TemplateString";
import { updatePackageVersion } from "./utils/UpdatePackageVersion";

export async function syncedFlux(
  config: Config,
  type?: ReleaseType,
  target?: string
) {
  try {
    const { packages: allPackages } = getPackagesSync(cwd());

    const targets = target?.split(",").map((t) => t.trim());
    const packages = target
      ? allPackages.filter((pkg: Package) =>
          targets?.some((t) => t === pkg.packageJson.name)
        )
      : allPackages;

    const tagPrefix = formatTagPrefix({
      synced: config.synced,
    });
    const { preset, baseBranch, branchPattern } = config;

    const latestTag = await getLatestTag(tagPrefix);

    let version: string | null = null;
    if (config.versionStrategy === "branchPattern") {
      version = await generateVersionByBranchPattern({
        latestTag,
        tagPrefix,
        type,
        branchPattern,
        baseBranch,
        prereleaseIdentifier: config.prereleaseIdentifier,
      });
    } else {
      version = await generateVersion({
        latestTag,
        preset,
        tagPrefix,
        type,
        prereleaseIdentifier: config.prereleaseIdentifier,
      });
    }

    if (typeof version === "string") {
      log(["new", `New version calculated ${version}`, "All"]);
      const nextTag = formatTag({ tagPrefix, version });

      for (const pkg of packages) {
        const { name } = pkg.packageJson;
        const path = pkg.relativeDir;

        if (config.skip?.some((p: string) => p === pkg.packageJson.name)) {
          log(["skip", "Skipped", name]);
        } else {
          await updatePackageVersion({ path, version, name });
          log(["paper", "Package version updated", name]);

          await generateChangelog({
            tagPrefix,
            preset,
            path,
            version,
            name,
          });
          log(["list", "Changelog generated", name]);
        }
      }

      const commitMessage = formatCommitMessage({
        commitMessage: config.commitMessage,
        version,
      });

      await gitProcess({
        files: packages
          .filter(
            (pkg: Package) =>
              !config.skip?.some((sp: string) => sp === pkg.packageJson.name)
          )
          .map((pkg: Package) => [
            `${pkg.relativeDir}/package.json`,
            `${pkg.relativeDir}/CHANGELOG.md`,
          ])
          .flat(),
        nextTag,
        commitMessage,
        skipHooks: config.skipHooks,
      });
      log(["tag", `Git Tag generated for ${nextTag}.`, "All"]);
    } else {
      log([
        "no_changes",
        "There are no changes since the last release.",
        "All",
      ]);
    }
  } catch (err: any) {
    log(["error", chalk.red(err.message), "Failure"]);
    exit(1);
  }
}
