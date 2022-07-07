import * as glob from "fast-glob";

export const getWorkflowsPaths = () => {
    const workflowFilesGlobs = [[process.cwd(), ".github", "workflows", "**/*.wac.ts"].join("/")];

    return glob.sync(workflowFilesGlobs, { onlyFiles: true });
};

export const clearImportCache = () => {
    // For the "watch" command, we need to flush the cached imported files. Otherwise, once imported, the
    // above dynamic imports will always just returned cached imported objects and no change will happen.
    Object.keys(require.cache).forEach(function (key) {
        delete require.cache[key];
    });
};
