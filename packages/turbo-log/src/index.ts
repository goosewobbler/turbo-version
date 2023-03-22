import chalk from "chalk";

export type LogStep =
  | "list"
  | "failed"
  | "warning"
  | "warning"
  | "success"
  | "new"
  | "box"
  | "paper"
  | "publish"
  | "tag"
  | "release"
  | "error";

export type LogProps = [LogStep, string, string];

const iconMap: Map<LogStep, string> = new Map([
  ["list", "📜"],
  ["failed", "❌"],
  ["warning", "🟠"],
  ["success", "🟢"],
  ["new", "🆕"],
  ["box", "📦"],
  ["paper", "📝"],
  ["publish", "🎉"],
  ["tag", "🔖"],
  ["release", "🚀"],
  ["error", "❌"],
]);

export function log([step, message, pkgName]: LogProps) {
  const icon = iconMap.get(step)?.toString() ?? "";
  const boldPkgName = chalk.bold(`[${pkgName}]`);
  const msg = `${boldPkgName} ${icon} ${message}`;

  if (step === "error") {
    return console.log(chalk.red(msg));
  }
  return console.log(msg);
}
