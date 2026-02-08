/**
 * Photo Compression Unit Tests
 * Feature: 004-maintenance-core
 * 
 * Tests for photo compression service
 */

import { describe, it, expect } from 'vitest';
import { validateImageFile, isCompressionSupported, getCompressionStats } from '@/lib/services/photoCompressor';

describe('Photo Compression Service', () => {
    describe('validateImageFile', () => {
        it('should throw error if no file provided', () => {
            expect(() => validateImageFile(null as any)).toThrow('No file provided');
        });

        it('should throw error if file is not an image', () => {
            const textFile = new File(['hello'], 'test.txt', { type: 'text/plain' });
            expect(() => validateImageFile(textFile)).toThrow('File must be an image');
        });

        it('should throw error if file is too large', () => {
            const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
            expect(() => validateImageFile(largeFile)).toThrow('File too large');
        });

        it('should pass validation for valid image file', () => {
            const imageFile = new File(['fake-image-data'], 'photo.jpg', { type: 'image/jpeg' });
            expect(() => validateImageFile(imageFile)).not.toThrow();
        });

        it('should accept various image types', () => {
            const jpegFile = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
            const pngFile = new File(['data'], 'photo.png', { type: 'image/png' });
            const webpFile = new File(['data'], 'photo.webp', { type: 'image/webp' });

            expect(() => validateImageFile(jpegFile)).not.toThrow();
            expect(() => validateImageFile(pngFile)).not.toThrow();
            expect(() => validateImageFile(webpFile)).not.toThrow();
        });
    });

    describe('isCompressionSupported', () => {
        it('should return boolean indicating support', () => {
            const result = isCompressionSupported();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('getCompressionStats', () => {
        it('should calculate compression stats correctly', () => {
            const result = {
                compressedBlob: new Blob(),
                compressedSizeKB: 200,
                originalSizeKB: 1000,
            };

            const stats = getCompressionStats(result);

            expect(stats.originalSize).toBe('1000KB');
            expect(stats.compressedSize).toBe('200KB');
            expect(stats.savings).toBe('800KB');
            expect(stats.savingsPercent).toBe(80);
        });

        it('should handle no compression case', () => {
            const result = {
                compressedBlob: new Blob(),
                compressedSizeKB: 100,
                originalSizeKB: 100,
            };

            const stats = getCompressionStats(result);

            expect(stats.savingsPercent).toBe(0);
        });

        it('should round savings percent', () => {
            const result = {
                compressedBlob: new Blob(),
                compressedSizeKB: 333,
                originalSizeKB: 1000,
            };

            const stats = getCompressionStats(result);

            expect(stats.savingsPercent).toBe(67); // Rounded from 66.7
        });
    });
});
