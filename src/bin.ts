#!/usr/bin/env node
import * as yargs from "yargs";
import { build } from "./commands/build";
import { watch } from "./commands/watch";

yargs
    .scriptName("github-actions-wac")
    .usage("$0 <cmd> [args]")
    .command(
        "build",
        `Builds YAML from detected TypeScript ("*.wac.ts") workflow files.`,
        {},
        build
    )
    .command(
        "watch",
        `Watches for changes in detected TypeScript ("*.wac.ts") workflow files and automatically generates YAML.`,
        {},
        watch
    )
    .help().argv;
