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

export function ellipsisMiddleText(text: string, fontSize: string, maxWidth: number) {
    const textLength = text.length;

    if (text.length < 3) return text;

    let truncatedText = text;

    // create a template element for calc text width
    const tempElement = document.createElement('span');
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.position = 'absolute';
    tempElement.style.fontSize = fontSize;
    tempElement.textContent = text;
    document.body.appendChild(tempElement);

    // get text width
    const textWidth = tempElement.offsetWidth;

    // if the text width too long, exclude middle part
    if (textWidth > maxWidth) {
        let middle = Math.floor(textLength / 2);
        let start = middle - 1;
        let end = middle + 1;

        // 找到合适的截取位置
        while (start >= 0 && end < textLength) {
            const newText = text.slice(0, start) + '…' + text.slice(end);
            tempElement.textContent = newText;

            if (tempElement.offsetWidth <= maxWidth) {
                truncatedText = newText;
                break;
            }

            start--;
            end++;
        }
    }

    // 移除临时元素
    document.body.removeChild(tempElement);
    return truncatedText
}

export function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes("Win")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("like Mac")) return "iOS"; // iPhones & iPads
    return "Unknown";
}

export function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
    let lastCall = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function (...args: Parameters<T>) {
        const now = Date.now();
        if (timer) {
            clearTimeout(timer)
        }
        if (now - lastCall >= limit) {
            lastCall = now;
            func(...args)
        } else {
            timer = setTimeout(func, limit)
        }
    };
}

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return function (...args: Parameters<T>) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func(...args)
        }, delay);
    };
}