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