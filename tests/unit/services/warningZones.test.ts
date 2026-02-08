/**
 * Warning Zone Evaluation Unit Tests
 * Feature: 004-maintenance-core
 * 
 * Tests for warning zone evaluation logic
 */

import { describe, it, expect } from 'vitest';
import {
    evaluateWarningZones,
    getHighestPriorityZone,
    hasRedWarning,
    hasYellowWarning,
    calculateThresholdProgress,
    formatHoursRemaining
} from '@/lib/services/warningZones';
import type { Kart } from '@/types/maintenance';
import { Timestamp } from 'firebase/firestore';

describe('Warning Zone Evaluation', () => {
    const createMockKart = (totalEngineHours: number): Kart => ({
        id: 'test-kart-1',
        userId: 'test-user',
        name: 'Test Kart',
        totalEngineHours,
        thresholds: [
            {
                type: 'Oil Change',
                intervalHours: 10,
                yellowWarningHours: 8,
                redWarningHours: 10,
            },
            {
                type: 'Air Filter',
                intervalHours: 25,
                yellowWarningHours: 22,
                redWarningHours: 25,
            }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });

    describe('evaluateWarningZones', () => {
        it('should return green zone when hours below yellow threshold', () => {
            const kart = createMockKart(5);
            const zones = evaluateWarningZones(kart);

            expect(zones[0].zone).toBe('green');
            expect(zones[0].priority).toBeNull();
            expect(zones[0].hoursUntilYellow).toBe(3);
            expect(zones[0].hoursUntilRed).toBe(5);
        });

        it('should return yellow zone when hours >= yellow threshold', () => {
            const kart = createMockKart(8.5);
            const zones = evaluateWarningZones(kart);

            expect(zones[0].zone).toBe('yellow');
            expect(zones[0].priority).toBe('Medium');
            expect(zones[0].hoursUntilYellow).toBe(0);
            expect(zones[0].hoursUntilRed).toBe(1.5);
        });

        it('should return red zone when hours >= red threshold', () => {
            const kart = createMockKart(10);
            const zones = evaluateWarningZones(kart);

            expect(zones[0].zone).toBe('red');
            expect(zones[0].priority).toBe('High');
            expect(zones[0].hoursUntilYellow).toBe(0);
            expect(zones[0].hoursUntilRed).toBe(0);
        });

        it('should evaluate multiple thresholds independently', () => {
            const kart = createMockKart(9); // Oil Change in yellow, Air Filter in green
            const zones = evaluateWarningZones(kart);

            expect(zones[0].zone).toBe('yellow'); // Oil Change
            expect(zones[1].zone).toBe('green');  // Air Filter
        });
    });

    describe('getHighestPriorityZone', () => {
        it('should return red zone when present', () => {
            const kart = createMockKart(10);
            const highestZone = getHighestPriorityZone(kart);

            expect(highestZone?.zone).toBe('red');
            expect(highestZone?.thresholdType).toBe('Oil Change');
        });

        it('should return yellow zone when no red zones', () => {
            const kart = createMockKart(8.5);
            const highestZone = getHighestPriorityZone(kart);

            expect(highestZone?.zone).toBe('yellow');
        });

        it('should return green zone when all zones green', () => {
            const kart = createMockKart(5);
            const highestZone = getHighestPriorityZone(kart);

            expect(highestZone?.zone).toBe('green');
        });
    });

    describe('hasRedWarning', () => {
        it('should return true when kart has red zone', () => {
            const kart = createMockKart(10);
            expect(hasRedWarning(kart)).toBe(true);
        });

        it('should return false when kart has no red zones', () => {
            const kart = createMockKart(5);
            expect(hasRedWarning(kart)).toBe(false);
        });
    });

    describe('hasYellowWarning', () => {
        it('should return true when kart has yellow zone', () => {
            const kart = createMockKart(8.5);
            expect(hasYellowWarning(kart)).toBe(true);
        });

        it('should return false when kart has no yellow zones', () => {
            const kart = createMockKart(5);
            expect(hasYellowWarning(kart)).toBe(false);
        });
    });

    describe('calculateThresholdProgress', () => {
        it('should calculate progress percentage correctly', () => {
            expect(calculateThresholdProgress(5, {
                type: 'Oil Change',
                intervalHours: 10,
                yellowWarningHours: 8,
                redWarningHours: 10
            })).toBe(50);

            expect(calculateThresholdProgress(10, {
                type: 'Oil Change',
                intervalHours: 10,
                yellowWarningHours: 8,
                redWarningHours: 10
            })).toBe(100);
        });

        it('should cap progress at 100%', () => {
            expect(calculateThresholdProgress(15, {
                type: 'Oil Change',
                intervalHours: 10,
                yellowWarningHours: 8,
                redWarningHours: 10
            })).toBe(100);
        });
    });

    describe('formatHoursRemaining', () => {
        it('should format hours remaining as hours', () => {
            expect(formatHoursRemaining(2.5)).toBe('2.5h');
        });

        it('should format minutes when less than 1 hour', () => {
            expect(formatHoursRemaining(0.5)).toBe('30m');
        });

        it('should show "Due now" when no hours remaining', () => {
            expect(formatHoursRemaining(0)).toBe('Due now');
            expect(formatHoursRemaining(-1)).toBe('Due now');
        });
    });
});
