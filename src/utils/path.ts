import { appLocalDataDir, join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";

export async function getUniquePath(targetDirPath: string, name: string) {
    let currentPath;
    if (await exists(await join(targetDirPath, name))) {
        let index = 1;
        while (await exists(currentPath = await join(targetDirPath, `${name}(${index})`))) {
            index += 1;
        }
    }

    if (!currentPath) {
        throw new Error('unique path is undefine')
    }

    return currentPath
}

export async function projectConfigDir() {
    return await join(await userDataDir(), "projects")
}

export async function userDataDir() {
    return await join(await appLocalDataDir(), "user_data");
} 