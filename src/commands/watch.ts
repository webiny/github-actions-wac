import * as path from "path";
import { watch as chokidarWatch } from "chokidar";
import { compile } from "./compile";

export const watch = async () => {
    const watcher = chokidarWatch([path.join(process.cwd(), ".github", "workflows", "**/*.ts")]);
    watcher.on("change", compile).on("error", console.error);

    console.log('Watching for changes in TypeScript (*.wac.ts) workflow files...')
};
