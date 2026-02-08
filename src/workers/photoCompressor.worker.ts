/**
 * Photo Compression Web Worker
 * Feature: 004-maintenance-core
 * 
 * Background worker for non-blocking image compression
 * Compresses images to <500KB JPEG for IndexedDB storage
 */

interface CompressPhotoMessage {
    imageFile: File;
}

interface CompressPhotoResponse {
    compressedBlob: Blob;
    compressedSizeKB: number;
    originalSizeKB: number;
}

// Web Worker message handler
self.onmessage = async (e: MessageEvent<CompressPhotoMessage>) => {
    try {
        const { imageFile } = e.data;

        // Create bitmap from file
        const bitmap = await createImageBitmap(imageFile);

        // Calculate dimensions (max 1920x1080, preserve aspect ratio)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = bitmap.width;
        let height = bitmap.height;

        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }

        // Create offscreen canvas and draw
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get 2D context from OffscreenCanvas');
        }

        ctx.drawImage(bitmap, 0, 0, width, height);

        // Convert to JPEG blob (80% quality) - targets ~200-400KB
        const blob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: 0.8
        });

        const response: CompressPhotoResponse = {
            compressedBlob: blob,
            compressedSizeKB: Math.round(blob.size / 1024),
            originalSizeKB: Math.round(imageFile.size / 1024)
        };

        // Send back compressed blob
        self.postMessage(response);

    } catch (error) {
        self.postMessage({
            error: error instanceof Error ? error.message : 'Unknown compression error'
        });
    }
};

export { };
