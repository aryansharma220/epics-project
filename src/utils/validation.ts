import { z } from 'zod';
import { CropData } from '../types/dashboard';

export const cropDataSchema = z.object({
  month: z.string().min(1),
  yield: z.number().min(0).max(1000),
  target: z.number().min(0).max(1000),
  rainfall: z.number().min(0).max(5000),
  temperature: z.number().min(-50).max(60)
});

export function validateCropData(data: Partial<CropData>): { 
  isValid: boolean; 
  errors: Record<string, string>;
} {
  try {
    cropDataSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors: Record<string, string> = {};
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
    }
    return { isValid: false, errors };
  }
}
