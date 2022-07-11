# Retrieving WCP URLs

Exports a single workflow that consists of a couple of a single job and some steps.

```ts
// .github/workflows/index.wac.ts

import { createWorkflow } from "github-actions-wac";

// Create "Push to main branch" workflow.
export const push = createWorkflow({
  name: "Push to main branch",
  on: "push",
  env: {
    NODE_OPTIONS: "--max_old_space_size=4096"
  },
  jobs: {
    buildTestRelease: {
      name: "Build, test, release",
      "runs-on": "ubuntu-latest",
      steps: [
        { uses: "actions/checkout@v2" },
        { name: "Install dependencies", run: "yarn --immutable" },
        { name: "Build", run: "yarn build" },
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
```
