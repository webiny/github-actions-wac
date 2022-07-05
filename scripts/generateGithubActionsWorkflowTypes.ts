import * as fs from "fs";
import * as path from "path";
import fetch from "node-fetch";
import { compile } from "json-schema-to-typescript";

const JSON_SCHEMA_URL = "https://json.schemastore.org/github-workflow.json";

(async () => {
    const jsonSchema = await fetch(JSON_SCHEMA_URL).then(response => response.json());

    const outputPath = path.join(process.cwd(), "src", "githubActionsWorkflow.ts");

    let workflowTypes = await compile(jsonSchema, "Workflow");

    // Before storing the file, let's add a @ts-nocheck at the top of the file (maybe we can improve this?).
    workflowTypes = `// @ts-nocheck\n${workflowTypes}`

    fs.writeFileSync(outputPath, workflowTypes)

})();
