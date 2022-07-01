#!/usr/bin/env node
import * as yargs from "yargs";
import { build } from "./commands/build";

yargs
    .scriptName("github-actions-wac")
    .usage("$0 <cmd> [args]")
    .command("build", "Build all to YAML files.", yargs => {}, build)
    .help().argv;
