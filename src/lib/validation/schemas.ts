/**
 * Validation Schemas
 * Feature: 004-maintenance-core
 * 
 * Re-exports Zod schemas from types for use in components
 * Add any additional validation utilities here
 */

export {
    // Zod schemas
    maintenanceThresholdSchema,
    kartSchema,
    sessionLogSchema,
    maintenanceTaskSchema,
    shoppingListItemSchema,
    photoSchema,

    // Form input schemas
    createKartInputSchema,
    createSessionLogInputSchema,
    createMaintenanceTaskInputSchema,
    createShoppingListItemInputSchema,
    updateThresholdInputSchema,

    // Type exports for convenience
    type CreateKartInput,
    type CreateSessionLogInput,
    type CreateMaintenanceTaskInput,
    type CreateShoppingListItemInput,
    type UpdateThresholdInput,
} from '@/types/maintenance';

import { z, ZodError } from 'zod';

/**
 * Additional validation helper: Parse and validate form data
 * 
 * @param schema - Zod schema
 * @param data - Form data to validate
 * @returns Parsed data or null if validation fails
 */
export function validateFormData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: ZodError } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, errors: result.error };
    }
}

/**
 * Get first error message from Zod error
 * 
 * Useful for displaying validation errors in forms
 * 
 * @param error - Zod validation error
 * @returns First error message
 */
export function getFirstErrorMessage(error: ZodError): string {
    const firstError = (error as any).errors[0];
    return firstError?.message || 'Validation failed';
}

/**
 * Get all error messages grouped by field
 * 
 * @param error - Zod validation error
 * @returns Map of field names to error messages
 */
export function getErrorsByField(error: ZodError): Record<string, string[]> {
    const errorsByField: Record<string, string[]> = {};

    for (const issue of (error as any).errors) {
        const field = issue.path.join('.');
        if (!errorsByField[field]) {
            errorsByField[field] = [];
        }
        errorsByField[field].push(issue.message);
    }

    return errorsByField;
}
