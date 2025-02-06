import { describe, it, expect } from 'vitest';
import { getUniquePath } from '../src/utils/path';
import { appLocalDataDir, join } from '@tauri-apps/api/path';

describe('test getUniquePath', () => {
    it('test get unique path', async () => {
        const appLocalDataDirPath = await appLocalDataDir()
        const filename = 'test'

        expect(await getUniquePath(appLocalDataDirPath, filename))
            .toEqual(await join(appLocalDataDirPath, filename) + "(1)")
    })
})