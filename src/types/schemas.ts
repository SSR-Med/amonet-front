import { z } from 'zod';

export const brandSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
});

export type BrandFormData = z.infer<typeof brandSchema>;

export const rawMaterialSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  type: z.enum(['chemical', 'packaging'], {
    required_error: 'El tipo es requerido',
  }),
});

export type RawMaterialFormData = z.infer<typeof rawMaterialSchema>;

export const productVariableSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Debe ser un identificador válido (sin espacios ni caracteres especiales exceptuando _)'),
});

export type ProductVariableFormData = z.infer<typeof productVariableSchema>;

export const productRawMaterialSchema = z.object({
  rawMaterialId: z.string().min(1, 'La materia prima es requerida'),
  formula: z.string().min(1, 'La fórmula es requerida'),
});

export type ProductRawMaterialFormData = z.infer<typeof productRawMaterialSchema>;

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  code: z.string().min(1, 'El código es requerido').max(50, 'Máximo 50 caracteres'),
  brandId: z.string().min(1, 'La marca es requerida'),
  rawMaterials: z.array(productRawMaterialSchema).min(1, 'Al menos una materia prima es requerida'),
});

export type ProductFormData = z.infer<typeof productSchema>;
