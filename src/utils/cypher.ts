import { MediaEditorSchema } from "../schemas/project-config";
import { MediaEditorProject } from "../types/project-config";

export function obfuscateData(config: MediaEditorProject, key: string) {
    const jsonData = JSON.stringify(config);
    const masked = xorMask(jsonData, key);
    return btoa(masked);
}

export function deobfuscateData(data: string, key: string): MediaEditorProject {
    const masked = atob(data);
    const jsonData = xorMask(masked, key);
    const jsonObj = JSON.parse(jsonData);

    try {
        return MediaEditorSchema.parse(jsonObj);
    } catch (error) {
        throw new Error('Media editor project is broken or uncompatible')
    }
}

export function xorMask(data: string, key: string) {
    return data
        .split('')
        .map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length)))
        .join('');
}

export function generateKey(length: number) {
    if (length <= 0) {
        throw new Error('length needs to be larger than 0');
    }

    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => String.fromCharCode(byte % 94 + 33)).join('');
}