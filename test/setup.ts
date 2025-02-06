import { vi } from 'vitest';

// Mock @tauri-apps/api/path
vi.mock('@tauri-apps/api/path', () => (
    {
        appLocalDataDir: async () => '/mock/appLocalDataDir',
        join: async (...paths: string[]) => paths.join('/'),
    }
));

// Mock @tauri-apps/plugin-fs
vi.mock('@tauri-apps/plugin-fs', () => ({
    exists: async (path: string) => !path.endsWith(')')
}))