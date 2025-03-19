import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

export async function getUniqueName(targetDirPath: string, name: string) {
    if (await exists(await join(targetDirPath, name))) {
        let index = 1;
        while (await exists(await join(targetDirPath, `${name}(${index})`))) {
            index += 1;
        }
        return `${name}(${index})`
    }

    return name
}

export async function projectsConfigDir() {
    const result = await join(await userDataDir(), "projects")

    if (! await exists(result)) {
        await mkdir(result)
    }

    return result
}

async function userDataDir() {
    const result = await join(await appLocalDataDir(), "user_data");

    if (! await exists(result)) {
        await mkdir(result)
    }

    return result;
}

export const configFileName = 'project-config.json';
export const keyFileName = 'key';