import { getCurrentDate } from '../src/utils/time'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('test getCurrentTime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    })

    afterEach(() => {
        vi.useRealTimers();
    })

    it('get current time', () => {
        const date = new Date(2000, 1, 1);
        vi.setSystemTime(date);
        expect(getCurrentDate()).toEqual(`2月1日`);
    });
});