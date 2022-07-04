#!/usr/bin/env node
import * as yargs from "yargs";
import { compile } from "./commands/compile";
import { watch } from "./commands/watch";

yargs
    .scriptName("github-actions-wac")
    .usage("$0 <cmd> [args]")
    .command(
        "compile",
        `Compiles YAML from detected TypeScript ("*.wac.ts") workflow files.`,
        {},
        compile
    )
    .command(
        "watch",
        `Watches for changes in detected TypeScript ("*.wac.ts") workflow files and automatically generates YAML.`,
        {},
        watch
    )
    .help().argv;
