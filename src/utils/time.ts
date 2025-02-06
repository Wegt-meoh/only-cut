export function getCurrentDate() {
    const now = new Date()
    const d = now.getDate()
    const m = now.getMonth() + 1
    return `${m}月${d}日`
}