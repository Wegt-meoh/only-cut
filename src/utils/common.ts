import { join } from "@tauri-apps/api/path";
import { readDir, stat } from "@tauri-apps/plugin-fs";

export function getCurrentDate() {
    const now = new Date()
    const d = now.getDate()
    const m = now.getMonth() + 1

    switch (navigator.language) {
        case "zh-CN":
            return `${m}月${d}日`
        default:
            return `${m}mm${d}dd`
    }
}

export function todo() {
    throw new Error('something todo here...')
}

export function formatToReadableSize(size: number) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export async function calculateFolderSize(path: string) {
    let totalSize = 0;

    async function traverse(currentPath: string) {
        const entries = await readDir(currentPath);

        for (const entry of entries) {
            const entryPath = await join(currentPath, entry.name);

            if (entry.isDirectory) {
                await traverse(entryPath);
            } else {
                const fileInfo = await stat(entryPath);
                totalSize += fileInfo.size;
            }
        }
    }

    await traverse(path);
    return totalSize;
}