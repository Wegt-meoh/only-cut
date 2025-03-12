import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

export async function getUniquePath(targetDirPath: string, name: string) {
    let currentPath = await join(targetDirPath, name);
    if (await exists(await join(targetDirPath, name))) {
        console.log('path exist');
        let index = 1;
        while (await exists(currentPath = await join(targetDirPath, `${name}(${index})`))) {
            console.log('repeat', index)
            index += 1;
        }
    }

    if (!currentPath) {
        throw new Error('unique path is undefine')
    }

    return currentPath
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