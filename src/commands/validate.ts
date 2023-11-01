import * as fs from "fs";
import * as path from "path";
import jsYaml from "js-yaml";
import debug from "debug";
import { getWorkflowsPaths, TOP_YAML_WORKFLOW_COMMENT } from "./utils";
import * as tsNode from "ts-node";

const log = debug("ghawac");

const relativePath = p => path.relative(process.cwd(), p);

let tsNodeRegistered = false;
const registerTsNode = (options = {}) => {
    if (tsNodeRegistered) {
        return;
    }

    tsNode.register({ ...options });
    tsNodeRegistered = true;
};

export const validate = async () => {
    registerTsNode();

    const workflowFilesPaths = getWorkflowsPaths();
    log(
        "Detected following workflow files:\n",
        workflowFilesPaths.map(item => `-> ${relativePath(item)}`).join("\n")
    );

    const invalidFiles = [];
    for (let i = 0; i < workflowFilesPaths.length; i++) {
        const tsWorkflowPath = workflowFilesPaths[i];
        const exportedWorkflows = await import(tsWorkflowPath);
        for (const name in exportedWorkflows) {
            const yamlWorkflowPath = path.join(".github", "workflows", `${name}.yml`);

            const yaml = [
                TOP_YAML_WORKFLOW_COMMENT,
                jsYaml.dump(exportedWorkflows[name], { noRefs: true })
            ].join("\n");

            const existingYaml = fs.readFileSync(yamlWorkflowPath, "utf8");

            if (yaml !== existingYaml) {
                invalidFiles.push({
                    name,
                    tsWorkflowPath,
                    yamlWorkflowPath
                });
            }
        }
    }

    if (invalidFiles.length === 0) {
        console.log("All files are valid.");
        return;
    }

    console.log("The following files are not valid:");
    for (let i = 0; i < invalidFiles.length; i++) {
        const { name, tsWorkflowPath, yamlWorkflowPath } = invalidFiles[i];
        console.log(`‣ ${relativePath(tsWorkflowPath)} -> ${relativePath(yamlWorkflowPath)}`);
        console.log(`   ${name} is not in sync with ${relativePath(yamlWorkflowPath)}`);
    }

    console.log("\nPlease run `ghawac build` to fix the above issues.");

    process.exit(1);
};
