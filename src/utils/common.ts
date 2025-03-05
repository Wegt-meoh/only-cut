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

export function copyText() {
    switch (navigator.language) {
        case "zh-CN":
            return "副本"
        default:
            return "copy"
    }
}

export function todo() {
    throw new Error('something todo here...')
}

export function formatToReadableSize(size: number) {
    const units = ["B", "K", "M", "G", "T"];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    if (unitIndex === 0) {
        return `${size.toFixed(0)}${units[unitIndex]}`;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
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

function addPrefixZero(x: number) {
    return x >= 10 ? "" + x : "0" + x;
}

export function formatTime(time: number) {
    const hour = Math.floor(time / 3600)
    const minute = Math.floor((time - hour * 3600) / 60)
    const second = time - hour * 3600 - minute * 60

    if (hour === 0 && minute >= 0) {
        return `${addPrefixZero(minute)}:${addPrefixZero(second)}`
    }

    return `${addPrefixZero(hour)}:${addPrefixZero(minute)}:${addPrefixZero(second)}`
}