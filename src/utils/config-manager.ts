import { basename, join } from "@tauri-apps/api/path";
import { MediaEditorProject, MediaEditorSchema } from "../types/project-config";
import { mkdir, readDir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getVersion } from "@tauri-apps/api/app";
import { getUniquePath, projectConfigDir } from "./path";
import { getCurrentDate } from "./time";

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
    await writeTextFile(await join(projectDirPath, configFileName), obfuscatedConfig);
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
            version: await getVersion()
        },
        settings: { framerate: null, output_format: null, resolution: null },
        state: { ui: { zoom_level: 1, current_time_cursor: 0 } },
        timeline: { tracks: [] }
    }

    return MediaEditorSchema.parse(config);
}

export async function createNewProject() {
    // ceate project directory
    const currentDate = getCurrentDate();
    const uniquePath = await getUniquePath(await projectConfigDir(), currentDate);
    await mkdir(uniquePath, { recursive: true });

    // generate project config file
    const projectName = await basename(uniquePath);
    const projectConfig = await genertateEditorConfig(projectName);
    await persistProjectConfig(projectConfig, uniquePath);
}

export async function listAllProjects() {
    const entryList = await readDir(await projectConfigDir());
    return Promise.all(entryList.filter(entry => entry.isDirectory)
        .map(async (entry) => await loadProjectConfig(await join(await projectConfigDir(), entry.name))))
}