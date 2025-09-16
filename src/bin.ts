#!/usr/bin/env node
import "tsx/esm";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { build } from "./commands/build.js";
import { watch } from "./commands/watch.js";
import { validate } from "./commands/validate.js";

await yargs(hideBin(process.argv))
    .scriptName("github-actions-wac")
    .usage("$0 <command> [options]")
    .command(
        "build",
        'Builds YAML from detected TypeScript ("*.wac.ts") workflow files.',
        () => {},
        build
    )
    .command(
        "watch",
        'Watches for changes in detected TypeScript ("*.wac.ts") workflow files and automatically generates YAML.',
        () => {},
        watch
    )
    .command(
        "validate",
        'Ensures "*.wac.ts" files are in sync with generated YAML files.',
        () => {},
        validate
    )
    .demandCommand(1, "You must specify a command")
    .strict()
    .help()
    .parse();