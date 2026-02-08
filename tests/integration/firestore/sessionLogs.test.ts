/**
 * SessionLog Repository Integration Tests
 * Feature: 004-maintenance-core
 * 
 * Integration tests for session log transaction integrity
 * NOTE: These tests require Firebase emulator to be running
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSessionLog, getSessionLogs, getLastSession, getSessionCount } from '@/lib/firestore/sessionLogs';
import { createKart, getKart, deleteKart } from '@/lib/firestore/karts';

describe('SessionLog Repository Integration Tests', () => {
    let createdKartIds: string[] = [];

    afterEach(async () => {
        // Cleanup: Delete all created karts (cascade deletes sessions)
        for (const kartId of createdKartIds) {
            try {
                await deleteKart(kartId);
            } catch {
                // Kart may already be deleted in test
            }
        }
        createdKartIds = [];
    });

    describe('createSessionLog - Transaction Integrity', () => {
        it('should atomically create session log and update kart hours', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            // Log 60 minutes (1 hour)
            const session = await createSessionLog(kart.id, 60, 'Test session');

            expect(session.id).toBeDefined();
            expect(session.kartId).toBe(kart.id);
            expect(session.durationMinutes).toBe(60);
            expect(session.durationHours).toBe(1);

            // Verify kart hours updated
            const updatedKart = await getKart(kart.id);
            expect(updatedKart?.totalEngineHours).toBe(1);
        });

        it('should accumulate hours correctly with multiple sessions', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            // Log first session - 30 minutes (0.5 hours)
            await createSessionLog(kart.id, 30);

            let updatedKart = await getKart(kart.id);
            expect(updatedKart?.totalEngineHours).toBe(0.5);

            // Log second session - 45 minutes (0.75 hours)
            await createSessionLog(kart.id, 45);

            updatedKart = await getKart(kart.id);
            expect(updatedKart?.totalEngineHours).toBe(1.25);

            // Log third session - 60 minutes (1 hour)
            await createSessionLog(kart.id, 60);

            updatedKart = await getKart(kart.id);
            expect(updatedKart?.totalEngineHours).toBe(2.25);
        });

        it('should handle fractional minutes correctly', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            // Log 90 minutes (1.5 hours)
            await createSessionLog(kart.id, 90);

            const updatedKart = await getKart(kart.id);
            expect(updatedKart?.totalEngineHours).toBe(1.5);
        });

        it('should fail entire transaction if kart does not exist', async () => {
            await expect(
                createSessionLog('non-existent-kart', 60)
            ).rejects.toThrow('Kart not found');
        });

        it('should store optional notes', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            const session = await createSessionLog(kart.id, 60, 'Great session!');

            expect(session.notes).toBe('Great session!');
        });
    });

    describe('getSessionLogs', () => {
        it('should return sessions in reverse chronological order', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            // Create multiple sessions
            await createSessionLog(kart.id, 30, 'First');
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
            await createSessionLog(kart.id, 45, 'Second');
            await new Promise(resolve => setTimeout(resolve, 100));
            await createSessionLog(kart.id, 60, 'Third');

            const sessions = await getSessionLogs(kart.id);

            expect(sessions.length).toBe(3);
            expect(sessions[0].notes).toBe('Third'); // Most recent first
            expect(sessions[1].notes).toBe('Second');
            expect(sessions[2].notes).toBe('First');
        });
    });

    describe('getLastSession', () => {
        it('should return most recent session', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            await createSessionLog(kart.id, 30);
            await new Promise(resolve => setTimeout(resolve, 100));
            const lastSession = await createSessionLog(kart.id, 60, 'Latest');

            const result = await getLastSession(kart.id);

            expect(result).not.toBeNull();
            expect(result?.id).toBe(lastSession.id);
            expect(result?.notes).toBe('Latest');
        });

        it('should return null for kart with no sessions', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            const result = await getLastSession(kart.id);

            expect(result).toBeNull();
        });
    });

    describe('getSessionCount', () => {
        it('should return correct session count', async () => {
            const kart = await createKart('Test Kart');
            createdKartIds.push(kart.id);

            expect(await getSessionCount(kart.id)).toBe(0);

            await createSessionLog(kart.id, 30);
            expect(await getSessionCount(kart.id)).toBe(1);

            await createSessionLog(kart.id, 45);
            expect(await getSessionCount(kart.id)).toBe(2);

            await createSessionLog(kart.id, 60);
            expect(await getSessionCount(kart.id)).toBe(3);
        });
    });
});
