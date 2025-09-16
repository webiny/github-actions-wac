import * as fs from "fs";
import * as path from "path";
import jsYaml from "js-yaml";
import debug from "debug";
import { getWorkflowsPaths, TOP_YAML_WORKFLOW_COMMENT } from "./utils.js";

const log = debug("ghawac");

const relativePath = (p: string) => path.relative(process.cwd(), p);

export const build = async () => {
    const workflowFilesPaths = getWorkflowsPaths();
    log(
        "Detected following workflow files:\n",
        workflowFilesPaths.map(item => `-> ${relativePath(item)}`).join("\n")
    );

    let builtFilesCount = 0;
    for (let i = 0; i < workflowFilesPaths.length; i++) {
        const tsWorkflowPath = workflowFilesPaths[i];
        const exportedWorkflows = await import(`${tsWorkflowPath}?update=${Date.now()}`);
        for (const name in exportedWorkflows) {
            const yamlWorkflowPath = path.join(".github", "workflows", `${name}.yml`);
            log(`Writing to ${relativePath(yamlWorkflowPath)}:`);

            const content = jsYaml.dump(exportedWorkflows[name], { noRefs: true });
            log("%s", `\n${content}`);

            fs.writeFileSync(yamlWorkflowPath, [TOP_YAML_WORKFLOW_COMMENT, content].join("\n"));
            builtFilesCount++;
        }
    }

    console.log(`Successfully built ${builtFilesCount} file(s).`);
};
