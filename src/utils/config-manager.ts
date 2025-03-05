import { basename, join } from "@tauri-apps/api/path";
import { MediaEditorSchema } from "../schemas/project-config";
import { exists, mkdir, readDir, readTextFile, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import { getVersion } from "@tauri-apps/api/app";
import { getUniquePath, projectConfigDirPath } from "./path";
import { getCurrentDate } from "./common";
import { MediaEditorProject } from "../types/project-config";
import { invoke } from "@tauri-apps/api/core";

const configFileName = 'project-config.json';
const keyFileName = 'key';

function obfuscateData(config: MediaEditorProject, key: string) {
    const jsonData = JSON.stringify(config);
    const masked = xorMask(jsonData, key);
    return btoa(masked);
}

function deobfuscateData(data: string, key: string): MediaEditorProject {
    const masked = atob(data);
    const jsonData = xorMask(masked, key);
    const jsonObj = JSON.parse(jsonData);

    try {
        return MediaEditorSchema.parse(jsonObj);
    } catch (error) {
        throw new Error('Media editor project is broken or uncompatible')
    }
}

function xorMask(data: string, key: string) {
    return data
        .split('')
        .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length)))
        .join('');
}

function generateKey(length: number) {
    if (length <= 0) {
        throw new Error('length needs to be larger than 0');
    }
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => String.fromCharCode(byte % 94 + 33)).join('');
}

export async function persistProjectConfig(config: MediaEditorProject, projectDirPath: string) {
    const key = generateKey(16);
    const obfuscatedConfig = obfuscateData(config, key);

    // write the config file
    await writeTextFile(await join(projectDirPath, configFileName), obfuscatedConfig);
    //write the key file
    await writeTextFile(await join(projectDirPath, keyFileName), key);
}

export async function loadProjectConfig(projectDirPath: string) {
    try {
        const key = await readTextFile(await join(projectDirPath, keyFileName));
        const obfuscatedString = await readTextFile(await join(projectDirPath, configFileName));
        const projectConfig = deobfuscateData(obfuscatedString, key);
        return projectConfig;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function genertateEditorConfig(name: string) {
    const now = new Date().toLocaleString();

    const config: MediaEditorProject = {
        assets: [],
        metadata: {
            created_at: now,
            last_modified: now,
            name: name,
            version: await getVersion(),
            cover_path: null
        },
        settings: { framerate: null, output_format: null, resolution: null },
        state: { ui: { zoom_level: 1, current_time_cursor: 0 } },
        timeline: { tracks: [] }
    }

    return MediaEditorSchema.parse(config);
}

async function createProjectDir(name: string) {
    const uniquePath = await getUniquePath(projectConfigDirPath, name);
    await mkdir(uniquePath, { recursive: true });
    return uniquePath
}

export async function copyProject(project: MediaEditorProject) {
    const projectPath = await createProjectDir(project.metadata.name)
    const now = new Date().toLocaleString();
    const newMetadata = {
        ...project.metadata,
        name: await basename(projectPath),
        last_modified: now,
        created_at: now,
        version: await getVersion(),
    }
    await persistProjectConfig({ ...project, metadata: newMetadata }, projectPath)
    return loadProjectConfig(projectPath)
}

export async function createNewProject() {
    // ceate project directory    
    const uniquePath = await createProjectDir(getCurrentDate())

    // generate project config file
    const projectName = await basename(uniquePath);
    const projectConfig = await genertateEditorConfig(projectName);
    await persistProjectConfig(projectConfig, uniquePath);
    return projectConfig
}

export async function deleteProject(name: string) {
    const projectPath = await join(projectConfigDirPath, name)
    if (!await exists(projectPath)) {
        return;
    }

    try {
        await invoke("move_to_trash", { path: projectPath })
    } catch (error) {
        console.error(error)
    }
}

export async function listAllProjects() {
    const entryList = await readDir(projectConfigDirPath);
    return (await Promise.all(entryList.filter(entry => entry.isDirectory)
        .map(async (entry) =>
            await loadProjectConfig(await join(projectConfigDirPath, entry.name))
        )
    )).filter(project => project !== null);
}

export async function updateProject(project: MediaEditorProject, oldName: string) {
    const oldProjectDirPath = await join(projectConfigDirPath, oldName)
    if (!await exists(oldProjectDirPath)) {
        throw new Error("the old project config path is not exsits")
    }

    const newProjectDirPath = await join(projectConfigDirPath, project.metadata.name);
    if (await exists(newProjectDirPath)) {
        throw new Error("the new project config path is already exists")
    }

    await rename(oldProjectDirPath, newProjectDirPath)
    await persistProjectConfig(project, newProjectDirPath)
}