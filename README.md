# `github-actions-wac`

[![](https://img.shields.io/npm/dw/github-actions-wac.svg)](https://www.npmjs.com/package/github-actions-wac)
[![](https://img.shields.io/npm/v/github-actions-wac.svg)](https://www.npmjs.com/package/github-actions-wac)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

GitHub Actions - Workflows as Code (WaC).

## Table of Contents

- [Installation](#installation)
- [Overview](#overview)
- [Examples](#examples)
- [Reference](#reference)
  - [Functions](#functions)
    - [`createWorkflow`](#createWorkflow)

## Installation

```
npm install --save github-actions-wac --dev
```

Or if you prefer yarn:

```
yarn add github-actions-wac --dev
```

## Overview

The `github-actions-wac` package enables you to define your GitHub Actions workflows via TypeScript code.

To get started, simply create a new `.wac.ts` TypeScript file in your `.github/workflows` folder and start defining your GitHub Actions workflow. For example:

```ts
import { createWorkflow, NormalJob } from "github-actions-wac";

// Some global environment variables.
const defaultEnv = {
  NODE_OPTIONS: "--max_old_space_size=4096"
};

// Let's assign some of the common steps into a standalone const.
const checkoutInstallBuildTest: NormalJob["steps"] = [
  {
    uses: "actions/setup-node@v2",
    with: { "node-version": 14 }
  },
  { uses: "actions/checkout@v2" },
  {
    uses: "actions/cache@v2",
    with: {
      path: ".yarn/cache",
      key: "yarn-${{ runner.os }}-${{ hashFiles('**/yarn.lock') }}"
    }
  },
  { name: "Install dependencies", run: "yarn --immutable" },
  { name: "Build", run: "yarn build" },
  { name: "Test", run: "echo 'yarn test'" }
];

// Define "Push to main branch" workflow.
export const push = createWorkflow({
  name: "Push to main branch",
  on: "push",
  env: defaultEnv,
  jobs: {
    buildTestRelease: {
      name: "Build, test, release",
      "runs-on": "ubuntu-latest",
      steps: [
        ...checkoutInstallBuildTest,
        { name: "Prepare for release", run: "yarn prepare-dist-for-release" },
        {
          name: "Release",
          uses: "cycjimmy/semantic-release-action@v3",
          with: { working_directory: "./dist" },
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
            NPM_TOKEN: "${{ secrets.NPM_TOKEN }}"
          }
        }
      ]
    }
  }
});

// Define "Pull requests" workflow.
export const pullRequests = createWorkflow({
  name: "Pull requests",
  on: "pull_request",
  env: defaultEnv,
  jobs: {
    buildTest: {
      name: "Build and test",
      "runs-on": "ubuntu-latest",
      steps: [...checkoutInstallBuildTest]
    }
  }
});
```

Once you're done, in your terminal, simply run `yarn github-actions-wac build` (or `yarn ghawac build`), to emit your TypeScript code into regular YAML files.

Writing GitHub Actions workflows via TypeScript has a couple of benefits:

- no need to write YAML (sorry 😅)
- type safety - the `yarn github-actions-wac build` command will throw TypeScript errors if something is wrong
- no need to copy/paste dozens of lines of YAML - simply store all of your repetitive jobs/steps into variables (or even as factory functions if additional dynamicity is required)
- it's even possible to import external NPM modules if needed (although, personally I haven't had the need to do it yet)

## Examples

| Example                                                      | Description                                                                 |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [Registering Plugins](./docs/examples/registeringPlugins.md) | Shows how to register relevant plugins in a [handler function](../handler). |

## Reference

### Functions

#### `createWorkflow`

<details>
<summary>Type Declaration</summary>
<p>

```ts
export declare const createWorkflow: (workflow: Workflow) => Workflow;
```

</p>
</details>

Defines a new GitHub Actions workflow. Accepts a `Workflow` object.

```ts
export const push = createWorkflow({
    name: "Push to main branch",
    on: "push",
    env: defaultEnv,
    jobs: { ... }
});
```

### CLI Commands

#### `build`

Builds YAML from detected TypeScript ("*.wac.ts") workflow files.

#### `watch`

Watches for changes in detected TypeScript ("*.wac.ts") workflow files and automatically generates YAML.
