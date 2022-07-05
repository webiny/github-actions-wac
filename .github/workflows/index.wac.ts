import { createWorkflow, NormalJob } from "../../src";

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
                {
                    name: "Release",
                    uses: "cycjimmy/semantic-release-action@v3",
                    with: { "working_directory": "./dist" },
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
