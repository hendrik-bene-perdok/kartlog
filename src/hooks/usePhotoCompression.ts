/**
 * usePhotoCompression Hook
 * Feature: 004-maintenance-core
 * 
 * React hook for photo compression with Web Worker
 */

'use client';

import { useState } from 'react';
import { compressPhotoWithValidation } from '@/lib/services/photoCompressor';
import { savePhoto } from '@/lib/indexedDB/photoRepository';

interface UsePhotoCompressionReturn {
    compressing: boolean;
    error: Error | null;
    compressAndSave: (file: File) => Promise<string>;
}

/**
 * Hook for compressing and saving photos
 * 
 * Features:
 * - Non-blocking compression via Web Worker
 * - Automatic save to IndexedDB
 * - Error handling
 * - Loading state
 * 
 * @returns Compression state and compress function
 */
export function usePhotoCompression(): UsePhotoCompressionReturn {
    const [compressing, setCompressing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const compressAndSave = async (file: File): Promise<string> => {
        try {
            setCompressing(true);
            setError(null);

            // Compress photo in Web Worker
            const result = await compressPhotoWithValidation(file);

            // Save compressed blob to IndexedDB
            const photoId = await savePhoto(
                result.compressedBlob,
                file.name,
                result.compressedSizeKB
            );

            return photoId;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Photo compression failed');
            setError(error);
            throw error;
        } finally {
            setCompressing(false);
        }
    };

    return {
        compressing,
        error,
        compressAndSave,
    };
}
