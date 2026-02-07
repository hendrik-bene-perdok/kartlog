// Service Result Type - Generic error handling wrapper for service operations
// Implements discriminated union pattern for type-safe error handling

export type ServiceResult<T> =
    | { success: true; data: T }
    | { success: false; error: ServiceError };

export interface ServiceError {
    code: string;
    message: string;
    details?: unknown;
}

// Common error codes
export const ErrorCodes = {
    // Authentication
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    UNAUTHORIZED: 'UNAUTHORIZED',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',

    // Resource
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',

    // Permissions
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

    // General
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Helper functions for creating results
export function success<T>(data: T): ServiceResult<T> {
    return { success: true, data };
}

export function error<T>(code: string, message: string, details?: unknown): ServiceResult<T> {
    return {
        success: false,
        error: { code, message, details }
    };
}

// Wrap async operations with error handling
export async function wrapServiceCall<T>(
    fn: () => Promise<T>,
    errorMessage: string = 'Operation failed'
): Promise<ServiceResult<T>> {
    try {
        const data = await fn();
        return success(data);
    } catch (err) {
        console.error('[Service Error]', errorMessage, err);

        // Handle specific Firebase errors
        if (err && typeof err === 'object' && 'code' in err) {
            const firebaseError = err as { code: string; message: string };
            return error(firebaseError.code, firebaseError.message, err);
        }

        // Generic error
        return error(
            ErrorCodes.UNKNOWN_ERROR,
            err instanceof Error ? err.message : errorMessage,
            err
        );
    }
}
