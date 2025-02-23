import { getCurrentDate } from '../src/utils/common';
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
        const currentDate = getCurrentDate();
        let result = false;
        if (currentDate === `2月1日` || currentDate === '2mm1dd') {
            result = true;
        }
        expect(result).toEqual(true);
    });
});