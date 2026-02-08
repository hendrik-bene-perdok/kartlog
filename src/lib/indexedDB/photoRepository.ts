/**
 * Photo Repository (IndexedDB)
 * Feature: 004-maintenance-core
 * 
 * IndexedDB CRUD operations for compressed photo storage
 */

import { openPhotosDB, getPhotosStore } from '../indexedDB/photos';
import type { Photo } from '@/types/maintenance';
import { v4 as uuidv4 } from 'uuid';

/**
 * Store compressed photo in IndexedDB
 * 
 * @param blob - Compressed JPEG blob (<500KB)
 * @param originalFileName - Original file name
 * @param compressedSizeKB - Size in KB after compression
 * @returns Photo ID (UUID)
 */
export async function savePhoto(
    blob: Blob,
    originalFileName: string,
    compressedSizeKB: number
): Promise<string> {
    const id = uuidv4();

    const photo: Photo = {
        id,
        blob,
        originalFileName,
        compressedSizeKB,
        createdAt: Date.now(),
    };

    const store = await getPhotosStore('readwrite');

    return new Promise((resolve, reject) => {
        const request = store.add(photo);

        request.onsuccess = () => {
            resolve(id);
        };

        request.onerror = () => {
            reject(new Error(`Failed to save photo: ${request.error?.message}`));
        };
    });
}

/**
 * Get photo from IndexedDB
 * 
 * @param photoId - Photo UUID
 * @returns Photo object or null if not found
 */
export async function getPhoto(photoId: string): Promise<Photo | null> {
    const store = await getPhotosStore('readonly');

    return new Promise((resolve, reject) => {
        const request = store.get(photoId);

        request.onsuccess = () => {
            resolve(request.result || null);
        };

        request.onerror = () => {
            reject(new Error(`Failed to get photo: ${request.error?.message}`));
        };
    });
}

/**
 * Delete photo from IndexedDB
 * 
 * @param photoId - Photo UUID
 */
export async function deletePhoto(photoId: string): Promise<void> {
    const store = await getPhotosStore('readwrite');

    return new Promise((resolve, reject) => {
        const request = store.delete(photoId);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(new Error(`Failed to delete photo: ${request.error?.message}`));
        };
    });
}

/**
 * Get all photos from IndexedDB
 * 
 * Useful for debugging/admin purposes
 */
export async function getAllPhotos(): Promise<Photo[]> {
    const store = await getPhotosStore('readonly');

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(new Error(`Failed to get all photos: ${request.error?.message}`));
        };
    });
}

/**
 * Get total storage size used by photos (in KB)
 */
export async function getTotalPhotoStorageKB(): Promise<number> {
    const photos = await getAllPhotos();
    return photos.reduce((total, photo) => total + photo.compressedSizeKB, 0);
}

/**
 * Clear all photos from IndexedDB
 * 
 * Use with caution - for testing/cleanup only
 */
export async function clearAllPhotos(): Promise<void> {
    const store = await getPhotosStore('readwrite');

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(new Error(`Failed to clear photos: ${request.error?.message}`));
        };
    });
}
