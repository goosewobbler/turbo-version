//import { generateAllChangelogs } from "./GenerateChangelog";
import { generateVersion } from "./GenerateVersion";
import { getLatestTag } from "./GetLatestTag";
import { gitProcess } from "./GitCommands";
import { log } from "./Log";
import { Config } from "./Types";
//import { updateAllPackagesVersion } from "./UpdatePackageVersion";

export async function syncedFlux(config: Config, type?: string) {
  // try {
  //   const latestVersion = await getLatestTag("v");
  //   const nextVersion = await generateVersion(
  //     latestVersion,
  //     config.preset,
  //     config.tagPrefix,
  //     type
  //   );
  //   const nextTag = `${config.tagPrefix}${nextVersion}`;
  //   await updateAllPackagesVersion(config.packages, nextVersion);
  //   await generateAllChangelogs(config, nextVersion);
  //   await gitProcess(["."], nextTag);
  // } catch (err: any) {
  //   if (err) {
  //     throw err;
  //   }
  // }
}
