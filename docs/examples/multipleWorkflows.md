# Retrieving WCP URLs

Exports multiple workflows that consist of a single jobs and multiple steps.

```ts
// .github/workflows/index.wac.ts

import { createWorkflow, NormalJob } from "github-actions-wac";

// Some global environment variables.
const defaultEnv = {
  NODE_OPTIONS: "--max_old_space_size=4096"
};

// Let's assign some of the common steps into a standalone const.
const checkoutInstallBuildTest: NormalJob["steps"] = [
  { uses: "actions/checkout@v2" },
  { name: "Install dependencies", run: "yarn --immutable" },
  { name: "Build", run: "yarn build" }
];

// Create "Push to main branch" workflow.
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

// Create "Pull requests" workflow.
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
