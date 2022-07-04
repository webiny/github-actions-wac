import * as tsNode from "ts-node";
import * as fs from "fs";
import * as path from "path";
import jsYaml from "js-yaml";
import debug from "debug";
import { getWorkflowsPaths, clearImportCache } from "./utils";

const log = debug("ghawac");

tsNode.register({ dir: process.cwd() });

const relativePath = p => path.relative(process.cwd(), p);

export const compile = async () => {
    const workflowFilesPaths = getWorkflowsPaths();
    log(
        "Detected following workflow files:\n",
        workflowFilesPaths.map(item => `-> ${relativePath(item)}`).join("\n")
    );

    for (let i = 0; i < workflowFilesPaths.length; i++) {
        const tsWorkflowPath = workflowFilesPaths[i];
        const exportedWorkflows = await import(tsWorkflowPath);
        for (const name in exportedWorkflows) {
            const yamlWorkflowPath = path.join(path.dirname(tsWorkflowPath), `${name}.yml`);
            log(`Writing to ${relativePath(yamlWorkflowPath)}:`);

            const content = jsYaml.dump(exportedWorkflows[name]);
            log("%s", `\n${content}`);

            fs.writeFileSync(yamlWorkflowPath, content);
        }
    }

    // For the "watch" command, we need to flush the cached imported files. Otherwise, once imported, the
    // above dynamic imports will always just returned cached imported objects and no change will happen.
    clearImportCache();

    console.log("Successfully compiled.");
};
