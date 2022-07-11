# Retrieving WCP URLs

Exports three **Pull Requests (${branch})** workflows that consist of multiple jobs and steps, where each workflow depends on the target branch. At the end of the file, we also export the **Pull Requests (Closed)** workflow, which is triggered once a PR has been closed. 

> The `utils.ts` file (see below) is a file that contains reusable steps and environment variables.

```ts
// .github/workflows/wac/pullRequests.ts

import { createWorkflow } from "github-actions-wac";
import { createSetupSteps, createStaticChecksSteps, getEnvironmentVariables } from "./utils";

const createPullRequestWorkflow = (branch: string) => {
    const env = {
        // We preview against the target branch.
        preview: getEnvironmentVariables(branch),

        // For short-lived deployment/testing purposes, we always use "dev" environment.
        deploy: getEnvironmentVariables("dev", {
            WEBINY_ENV: `pr\${{ github.event.pull_request.number }}`
        })
    };

    return createWorkflow({
        name: `Pull Requests (${branch})`,
        on: {
            pull_request: {
                branches: [branch]
            }
        },
        jobs: {
            validateCommits: {
                name: "Validate commit messages",
                "runs-on": "ubuntu-latest",
                steps: [
                    {
                        uses: "actions/checkout@v2"
                    },
                    {
                        uses: "webiny/action-conventional-commits@v1.0.3"
                    }
                ]
            },
            previewDeployment: {
                name: "Preview Deployment (staging)",
                "runs-on": "ubuntu-latest",
                env: { ...env.preview },
                steps: [
                    ...createSetupSteps(),
                    {
                        name: "Build WCP backend app",
                        run: `yarn webiny deploy wcp/backend --env ${branch} --no-deploy`
                    },
                    {
                        name: "Build WCP frontend app",
                        run: `yarn webiny deploy wcp/frontend --env ${branch} --no-deploy`
                    },
                    {
                        name: "Preview WCP backend app deployment",
                        run: `yarn webiny pulumi wcp/backend --env ${branch} -- preview --color always`
                    },
                    {
                        name: "Preview WCP frontend app deployment",
                        run: `yarn webiny pulumi wcp/frontend --env ${branch} -- preview --color always`
                    }
                ]
            },
            staticCodeAnalysis: {
                name: "Static code analysis",
                "runs-on": "ubuntu-latest",
                env: getEnvironmentVariables(branch),
                steps: [...createSetupSteps(), ...createStaticChecksSteps()]
            },
            unitTests: {
                name: "Unit tests",
                "runs-on": "ubuntu-latest",
                env: getEnvironmentVariables(branch),
                steps: [
                    ...createSetupSteps(),
                    {
                        name: "Run unit tests",
                        run: "yarn test:unit"
                    }
                ]
            },
            deployBackend: {
                name: "Deploy backend",
                "runs-on": "ubuntu-latest",
                env: { ...env.deploy },
                steps: [
                    ...createSetupSteps(),
                    {
                        name: "Deploy WCP Backend",
                        run: "yarn webiny deploy wcp/backend --env pr${{ github.event.pull_request.number }}"
                    }
                ]
            },
            integrationTests: {
                name: "Integration tests",
                needs: ["deployBackend"],
                strategy: {
                    matrix: {
                        shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                    }
                },
                "runs-on": "ubuntu-latest",
                env: { ...env.deploy },
                steps: [
                    ...createSetupSteps(),
                    {
                        name: "Run integration tests",
                        run: "yarn test:integration --shard ${{ matrix.shard }}/12"
                    }
                ]
            },
            e2eTests: {
                name: "End-to-end (E2E) tests",
                needs: ["deployBackend"],
                strategy: {
                    matrix: {
                        shard: [1, 2, 3, 4, 5, 6]
                    }
                },
                "runs-on": "ubuntu-latest",
                env: { ...env.deploy },
                steps: [
                    ...createSetupSteps(),
                    {
                        name: "Run end-to-end tests",
                        run: "yarn test:e2e --shard ${{ matrix.shard }}/6"
                    }
                ]
            },
            deployFrontend: {
                name: "Deploy frontend",
                needs: ["deployBackend"],
                "runs-on": "ubuntu-latest",
                env: { ...env.deploy },
                steps: [
                    ...createSetupSteps(),
                    {
                        name: "Deploy WCP Frontend",
                        run: "yarn webiny deploy wcp/frontend --env pr${{ github.event.pull_request.number }}"
                    }
                ]
            }
        }
    });
};

export const pullRequestDev = createPullRequestWorkflow("dev");
export const pullRequestStaging = createPullRequestWorkflow("staging");
export const pullRequestProd = createPullRequestWorkflow("prod");

export const pullRequestClosed = createWorkflow({
    name: "Pull Requests (Closed)",
    on: {
        pull_request: {
            branches: ["dev", "staging", "prod"],
            types: ["closed"]
        }
    },
    jobs: {
        "destroy-project": {
            name: "Destroy project deployed into a short-lived environment",
            "runs-on": "ubuntu-latest",
            env: getEnvironmentVariables("dev", {
                WEBINY_ENV: `pr\${{ github.event.pull_request.number }}`
            }),
            steps: [
                ...createSetupSteps(),
                {
                    name: "Install dependencies",
                    run: "yarn --immutable"
                },
                {
                    name: "Destroy WCP Frontend",
                    run: "yarn webiny destroy wcp/frontend --env pr${{ github.event.pull_request.number }}"
                },
                {
                    name: "Destroy WCP Backend",
                    run: "yarn webiny destroy wcp/backend --env pr${{ github.event.pull_request.number }}"
                }
            ]
        }
    }
});

```

```ts
// .github/workflows/wac/utils.ts

import { NormalJob } from "github-actions-wac";

export const getEnvironmentVariables = (branch: string, overrides = {}) => {
    const secret = (name: string) => {
        const fullName = branch.toUpperCase() + "_" + name;
        return `\${{ secrets.${fullName} }}`;
    };
    return {
        // Secrets.
        AWS_ACCESS_KEY_ID: secret("AWS_ACCESS_KEY_ID"),
        AWS_SECRET_ACCESS_KEY: secret("AWS_SECRET_ACCESS_KEY"),
        AWS_REGION: secret("AWS_REGION"),
        PULUMI_SECRETS_PROVIDER: secret("PULUMI_SECRETS_PROVIDER"),
        PULUMI_CONFIG_PASSPHRASE: secret("PULUMI_CONFIG_PASSPHRASE"),
        WEBINY_PULUMI_BACKEND: secret("WEBINY_PULUMI_BACKEND"),
        ACM_CERTIFICATE_ARN: secret("ACM_CERTIFICATE_ARN"),
        SENDGRID_API_KEY: secret("SENDGRID_API_KEY"),
        STRIPE_KEY: secret("STRIPE_KEY"),
        STRIPE_SECRET: secret("STRIPE_SECRET"),
        USE_ENCRYPTION_SECRET_KEY: secret("USE_ENCRYPTION_SECRET_KEY"),

        // Configs.
        NODE_OPTIONS: "--max_old_space_size=4096",

        // By default, upon building the AWS Lambda code (wcp/backend/src), the code is NOT type-checked. But, we
        // can actually enable type checking via the following environment variable. The reason why this is already
        // not the default behaviour currently is that this feature hasn't yet been officially released by Webiny.
        WEBINY_ENV: branch,
        WEBINY_ENABLE_TS_CHECKS: "true",
        ...overrides
    };
};

export const createSetupSteps = (): NormalJob["steps"] => [
    {
        uses: "actions/setup-node@v2",
        with: {
            "node-version": 12
        }
    },
    {
        uses: "actions/checkout@v2"
    },
    {
        uses: "actions/cache@v2",
        id: "yarn-cache",
        with: {
            path: ".yarn/cache",
            key: "yarn-${{ hashFiles('**/yarn.lock') }}"
        }
    },
    {
        name: "Install dependencies",
        run: "yarn --immutable"
    }
];

export const createStaticChecksSteps = (): NormalJob["steps"] => [
    {
        name: "Check code formatting",
        run: "yarn prettier:check"
    },
    {
        name: "Check dependencies",
        run: "yarn adio"
    },
    {
        name: "ESLint",
        run: "yarn eslint"
    }
];
```
