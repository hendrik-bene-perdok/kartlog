/**
 * Photo Compression Service
 * Feature: 004-maintenance-core
 * 
 * Wrapper service for Web Worker photo compression
 * Provides easy-to-use API for compressing images in background
 */

interface CompressionResult {
    compressedBlob: Blob;
    compressedSizeKB: number;
    originalSizeKB: number;
}

/**
 * Compress photo using Web Worker
 * 
 * Offloads compression to background thread to avoid blocking UI
 * 
 * Features:
 * - Non-blocking compression (runs in Web Worker)
 * - Targets <500KB output size
 * - Preserves aspect ratio
 * - Max dimensions: 1920x1080
 * - 80% JPEG quality
 * 
 * @param file - Image file to compress
 * @returns Promise with compressed blob and size info
 */
export async function compressPhoto(file: File): Promise<CompressionResult> {
    return new Promise((resolve, reject) => {
        // Create Web Worker instance
        const worker = new Worker(
            new URL('../../workers/photoCompressor.worker.ts', import.meta.url),
            { type: 'module' }
        );

        // Set up message handler
        worker.onmessage = (e: MessageEvent) => {
            const data = e.data;

            // Check for errors
            if (data.error) {
                worker.terminate();
                reject(new Error(data.error));
                return;
            }

            // Return result
            worker.terminate();
            resolve(data as CompressionResult);
        };

        // Set up error handler
        worker.onerror = (error) => {
            worker.terminate();
            reject(new Error(`Worker error: ${error.message}`));
        };

        // Send file to worker
        worker.postMessage({ imageFile: file });
    });
}

/**
 * Validate file before compression
 * 
 * Checks:
 * - File exists
 * - File is an image
 * - File size is reasonable (< 50MB)
 * 
 * @param file - File to validate
 * @throws Error if validation fails
 */
export function validateImageFile(file: File): void {
    if (!file) {
        throw new Error('No file provided');
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
        throw new Error(`File too large (max ${maxSizeMB}MB)`);
    }
}

/**
 * Compress photo with validation
 * 
 * Validates file before compression and provides better error messages
 * 
 * @param file - Image file to compress
 * @returns Promise with compression result
 */
export async function compressPhotoWithValidation(file: File): Promise<CompressionResult> {
    validateImageFile(file);
    return compressPhoto(file);
}

/**
 * Check if compression is supported
 * 
 * Web Workers and OffscreenCanvas required
 */
export function isCompressionSupported(): boolean {
    return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
}

/**
 * Get compression stats for display
 * 
 * @param result - Compression result
 * @returns Human-readable stats
 */
export function getCompressionStats(result: CompressionResult): {
    originalSize: string;
    compressedSize: string;
    savings: string;
    savingsPercent: number;
} {
    const savings = result.originalSizeKB - result.compressedSizeKB;
    const savingsPercent = Math.round((savings / result.originalSizeKB) * 100);

    return {
        originalSize: `${result.originalSizeKB}KB`,
        compressedSize: `${result.compressedSizeKB}KB`,
        savings: `${savings}KB`,
        savingsPercent,
    };
}
