import { z } from 'zod';

export const brandSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
});

export type BrandFormData = z.infer<typeof brandSchema>;

export const rawMaterialSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  id_cat_amonet_tipo_materia_prima: z.string().min(1, 'El tipo es requerido'),
  id_cat_amonet_tipo_unidad: z.string().min(1, 'La unidad es requerida'),
});

export type RawMaterialFormData = z.infer<typeof rawMaterialSchema>;

export const productVariableSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Debe ser un identificador válido (sin espacios ni caracteres especiales exceptuando _)'),
});

export type ProductVariableFormData = z.infer<typeof productVariableSchema>;

export const productRawMaterialSchema = z.object({
  id_amonet_materia_prima: z.string().min(1, 'La materia prima es requerida'),
  formula: z.string().min(1, 'La fórmula es requerida'),
});

export type ProductRawMaterialFormData = z.infer<typeof productRawMaterialSchema>;

export const productSchema = z.object({
  codigo: z.string().min(1, 'El código es requerido').max(50, 'Máximo 50 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  id_amonet_marca: z.string().min(1, 'La marca es requerida'),
  materias_primas: z.array(productRawMaterialSchema).min(1, 'Al menos una materia prima es requerida'),
});

export type ProductFormData = z.infer<typeof productSchema>;
