import * as fs from "fs";
import * as path from "path";
import jsYaml from "js-yaml";
import debug from "debug";
import { getWorkflowsPaths, clearImportCache, TOP_YAML_WORKFLOW_COMMENT } from "./utils";
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

export const build = async () => {
    registerTsNode();

    const workflowFilesPaths = getWorkflowsPaths();
    log(
        "Detected following workflow files:\n",
        workflowFilesPaths.map(item => `-> ${relativePath(item)}`).join("\n")
    );

    let builtFilesCount = 0;
    for (let i = 0; i < workflowFilesPaths.length; i++) {
        const tsWorkflowPath = workflowFilesPaths[i];
        const exportedWorkflows = await import(tsWorkflowPath);
        for (const name in exportedWorkflows) {
            const yamlWorkflowPath = path.join(".github", "workflows", `${name}.yml`);
            log(`Writing to ${relativePath(yamlWorkflowPath)}:`);

            const content = jsYaml.dump(exportedWorkflows[name], { noRefs: true });
            log("%s", `\n${content}`);

            fs.writeFileSync(yamlWorkflowPath, [TOP_YAML_WORKFLOW_COMMENT, content].join("\n"));
            builtFilesCount++;
        }
    }

    // For the "watch" command, we need to flush the cached imported files. Otherwise, once imported, the
    // above dynamic imports will always just returned cached imported objects and no change will happen.
    clearImportCache();

    console.log(`Successfully built ${builtFilesCount} file(s).`);
};
