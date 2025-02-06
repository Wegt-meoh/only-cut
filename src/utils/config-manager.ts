import { join } from "@tauri-apps/api/path";
import { MediaEditorProject } from "../types/project-config";
import { writeTextFile } from "@tauri-apps/plugin-fs";

const configFileName = 'project-config.json';

function obfuscateData(config: MediaEditorProject, key: string) {
    const jsonData = JSON.stringify(config);
    const masked = xorMask(jsonData, key);
    return btoa(masked);
}

function deobfuscateData(data: string, key: string) {
    const masked = atob(data);
    const jsonData = xorMask(masked, key);
    return JSON.parse(jsonData);
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

export async function persistProjectConfig(config: MediaEditorProject) {
    const key = generateKey(16);
    const obfuscatedConfig = obfuscateData(config, key);
    await writeTextFile(await join(saveDirPath, configFileName), obfuscatedConfig);
}

export async function loadProjectConfig(configDirName: string) {

}

