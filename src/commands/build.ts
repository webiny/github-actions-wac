import * as glob from "fast-glob";
import * as tsNode from "ts-node";
import * as fs from "fs";
import * as path from "path";
import jsYaml from "js-yaml";

tsNode.register({ dir: process.cwd() });

export const build = async () => {
    const workflowFilesGlob = [process.cwd(), ".github", "workflows", "*.workflow.ts"].join("/");

    const workflowFiles = glob.sync(workflowFilesGlob, { onlyFiles: true });

    for (let i = 0; i < workflowFiles.length; i++) {
        const tsWorkflowPath = workflowFiles[i];
        const exportedWorkflows = await import(tsWorkflowPath);
        for (const name in exportedWorkflows) {
            const yamlWorkflowPath = path.join(path.dirname(tsWorkflowPath), `${name}.yml`);
            fs.writeFileSync(yamlWorkflowPath, jsYaml.dump(exportedWorkflows[name]));
        }
    }
};
