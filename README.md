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
        - [`createWcpContext`](#getWcpAppUrl)
        - [`createWcpGraphQL`](#getWcpApiUrl)

## Installation

```
npm install --save github-actions-wac
```

Or if you prefer yarn:

```
yarn add github-actions-wac
```

## Overview

The `github-actions-wac` package enables you to define your GitHub Actions workflows as TypeScript code.

To get started, simply create a new `.wac.ts` TypeScript file in your `.github/workflows` folder and start defining your GitHub Actions workflow. For example:

```ts
import { createWorkflow, NormalJob } from "github-actions-wac";

const defaultEnv = {
    NODE_OPTIONS: "--max_old_space_size=4096"
};

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

export const pullRequests = createWorkflow({
    name: "Push to main branch",
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

## Examples

| Example                                                     | Description                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| [Registering Plugins](./docs/examples/registeringPlugins.md) | Shows how to register relevant plugins in a [handler function](../handler). |

## Reference

### Functions

#### `createWcpContext`

<details>
<summary>Type Declaration</summary>
<p>

```ts
export declare const createWcpContext: () => ContextPlugin<WcpContext>;
```

</p>
</details>

Creates the WCP context API.

```ts
import { createHandler } from "@webiny/handler-aws";
import { createWcpContext } from "github-actions-wac";

export const handler = createHandler({
  plugins: [
    // Registers WCP context API.  
    createWcpContext(),
    // ...
  ]
});
```

#### `createWcpGraphQL`

<details>
<summary>Type Declaration</summary>
<p>

```ts
export declare const createWcpGraphQL: () => GraphQLSchemaPlugin<WcpContext>;
```

</p>
</details>

Returns WCP API URL. The default URL can be overridden via the `WCP_API_URL` environment variable.

```ts
import { createHandler } from "@webiny/handler-aws";
import { createWcpGraphQL } from "github-actions-wac";

export const handler = createHandler({
    plugins: [
        // Registers WCP context API.  
        createWcpGraphQL(),
        // ...
    ]
});
```
