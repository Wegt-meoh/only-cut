import { basename, join } from "@tauri-apps/api/path";
import { MediaEditorSchema } from "../schemas/project-config";
import { exists, mkdir, readDir, readTextFile, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { getVersion } from "@tauri-apps/api/app";
import { configFileName, getUniqueName, keyFileName, projectsConfigDir } from "./path";
import { copyText, getCurrentDate } from "./common";
import { MediaEditorConfig, MediaEditorProject } from "../types/project-config";
import { invoke } from "@tauri-apps/api/core";
import { generateKey, obfuscateData, deobfuscateData } from "./cypher";

export async function persistProjectConfig(project: MediaEditorProject) {
    const { config, name } = project;
    const projectDirPath = await join(await projectsConfigDir(), name);
    const key = generateKey(16);
    const obfuscatedConfig = obfuscateData(config, key);

    if (!await exists(projectDirPath)) {
        throw new Error(`project path: "${projectDirPath}" is not exists`);
    }

    // write the config file
    await writeTextFile(await join(projectDirPath, configFileName), obfuscatedConfig);
    // write the key file
    await writeTextFile(await join(projectDirPath, keyFileName), key);
}

export async function loadProjectConfig(name: string) {
    try {
        const projectDirPath = await join(await projectsConfigDir(), name);
        const key = await readTextFile(await join(projectDirPath, keyFileName));
        const obfuscatedString = await readTextFile(await join(projectDirPath, configFileName));
        const projectConfig = deobfuscateData(obfuscatedString, key);
        return projectConfig;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}

export async function genertateEditorConfig() {
    const now = new Date().toLocaleString();

    const config: MediaEditorConfig = {
        assets: [],
        metadata: {
            created_at: now,
            last_modified: now,
            version: await getVersion(),
            cover_path: null,
        },
        settings: { framerate: null, output_format: null, resolution: null },
        state: { ui: { zoom_level: 1, current_time_cursor: 0 } },
        timeline: { tracks: [] },
    };

    return MediaEditorSchema.parse(config);
}

async function createUniqueProjectDir(name: string) {
    const projectConfigDirPath = await projectsConfigDir();
    const uniqueName = await getUniqueName(projectConfigDirPath, name);
    const uniquePath = await join(projectConfigDirPath, uniqueName);
    await mkdir(uniquePath, { recursive: true });
    return uniqueName;
}

export async function copyProject(project: MediaEditorProject) {
    const newProjectName = await createUniqueProjectDir(`${project.name}-${copyText()}`);
    const now = new Date().toLocaleString();
    const newMetadata: MediaEditorConfig["metadata"] = {
        ...project.config.metadata,
        last_modified: now,
        created_at: now,
        version: await getVersion(),
    };

    await persistProjectConfig({ name: newProjectName, config: { ...project.config, metadata: newMetadata } });

    const config = await loadProjectConfig(newProjectName);
    if (!config) {
        throw new Error("can not load copyed project");
    }
    return { name: newProjectName, config };
}

export async function createNewProject() {
    // create project directory
    const uniquePath = await createUniqueProjectDir(getCurrentDate());
    const uniqueName = await basename(uniquePath);

    // generate project config file
    const projectConfig = await genertateEditorConfig();
    const project = { config: projectConfig, name: uniqueName };
    await persistProjectConfig(project);
    return project;
}

export async function deleteProject(name: string) {
    const projectPath = await join(await projectsConfigDir(), name);
    if (!await exists(projectPath)) {
        return;
    }

    try {
        await invoke("move_to_trash", { path: projectPath });
    }
    catch (error) {
        console.error(error);
    }
}

export async function listAllProjects() {
    const entryList = await readDir(await projectsConfigDir());
    const dirEntryList = entryList.filter(entry => entry.isDirectory);
    const projectResultList = await Promise.all(
        dirEntryList.map(async entry => ({
            name: entry.name,
            config: await loadProjectConfig(entry.name),
        })),
    );
    return projectResultList.filter((project): project is { name: string, config: MediaEditorConfig } => project.config !== null);
}

export async function updateProject(project: MediaEditorProject) {
    await persistProjectConfig(project);
}

export async function renameProject(oldName: string, newName: string) {
    const oldProjectDirPath = await join(await projectsConfigDir(), oldName);

    if (!await exists(oldProjectDirPath)) {
        throw new Error("the old project config path is not exsits");
    }

    const newProjectDirPath = await join(await projectsConfigDir(), newName);

    if (await exists(newProjectDirPath)) {
        throw new Error("the new project config path is already exists");
    }

    await rename(oldProjectDirPath, newProjectDirPath);
}
