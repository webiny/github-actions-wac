export interface Workflow {
    name: string;
    on: string | string[] | Record<string, any>;
    env?: Record<string, any>;
    jobs: Record<string, Job>;
}

export type Job = { steps: Step[], 'runs-on': string, };
export type Step = Record<string, any>;
