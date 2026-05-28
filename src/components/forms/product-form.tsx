'use client';

import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { productSchema, ProductFormData } from '@/types/schemas';
import { useProductStore, useBrandStore, useRawMaterialStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { FormField } from './form-field';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormulaInput } from './formula-input';
import { Plus, Trash2 } from 'lucide-react';
import type { ProductRawMaterial } from '@/types';

interface ProductFormProps {
  initialData?: ProductFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function ProductForm({ initialData, entityId, mode = 'create' }: ProductFormProps) {
  const router = useRouter();
  const { create, update } = useProductStore();
  const { getAll: getAllBrands } = useBrandStore();
  const { getAll: getAllMaterials } = useRawMaterialStore();
  const { toast } = useToast();

  const brands = getAllBrands();
  const allMaterials = getAllMaterials();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: '',
      code: '',
      brandId: '',
      rawMaterials: [{ rawMaterialId: '', formula: '' }],
    },
  });

  const watchedRawMaterials = watch('rawMaterials');

  const availableMaterials = useCallback(
    (excludeIds: string[]) => {
      const usedIds = new Set(excludeIds);
      return allMaterials.filter((m) => !usedIds.has(m.id));
    },
    [allMaterials]
  );

  const addRow = () => {
    const current = watch('rawMaterials') || [];
    setValue('rawMaterials', [...current, { rawMaterialId: '', formula: '' }]);
  };

  const removeRow = (index: number) => {
    const current = watch('rawMaterials') || [];
    if (current.length > 1) {
      setValue(
        'rawMaterials',
        current.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const filteredMaterials = data.rawMaterials.filter((rm) => rm.rawMaterialId && rm.formula);
    if (filteredMaterials.length === 0) {
      toast({ title: 'Error', description: 'Al menos una materia prima es requerida', variant: 'error' });
      return;
    }

    try {
      if (mode === 'create') {
        create({
          name: data.name,
          code: data.code,
          brandId: data.brandId,
          rawMaterials: filteredMaterials,
        });
        toast({ title: 'Producto creado', description: 'El producto se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        update(entityId, {
          name: data.name,
          code: data.code,
          brandId: data.brandId,
          rawMaterials: filteredMaterials,
        });
        toast({ title: 'Producto actualizado', description: 'El producto se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/products');
    } catch {
      toast({ title: 'Error', description: 'Ha ocurrido un error inesperado', variant: 'error' });
    }
  };

  const brandId = watch('brandId');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Datos Generales</h3>

        <FormField label="Nombre" error={errors.name?.message}>
          <input
            {...register('name')}
            type="text"
            className="flex h-9 w-full rounded-8 border border-border-tabla bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gris-tecnico focus:border-2 focus:border-violet-lab focus:outline-none"
            placeholder="Nombre del producto"
          />
        </FormField>

        <FormField label="Código" error={errors.code?.message}>
          <input
            {...register('code')}
            type="text"
            className="flex h-9 w-full rounded-8 border border-border-tabla bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gris-tecnico focus:border-2 focus:border-violet-lab focus:outline-none"
            placeholder="Código alfanumérico"
          />
        </FormField>

        <FormField label="Marca" error={errors.brandId?.message}>
          <Select value={brandId} onValueChange={(value) => setValue('brandId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una marca" />
            </SelectTrigger>
            <SelectContent>
              {brands.length === 0 ? (
                <SelectItem value="no-brands" disabled>
                  No hay marcas disponibles
                </SelectItem>
              ) : (
                brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Materias Primas</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>

        {errors.rawMaterials?.message && (
          <p className="text-xs text-coral-alerta">{errors.rawMaterials.message}</p>
        )}

        <div className="space-y-3">
          {watchedRawMaterials?.map((row, index) => {
            const usedIds = watchedRawMaterials
              .filter((_, i) => i !== index)
              .map((r) => r.rawMaterialId)
              .filter(Boolean);
            const available = availableMaterials(usedIds);

            return (
              <div key={index} className="flex items-start gap-3 p-3 border border-border-tabla rounded-8">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-gray-900">Materia Prima</label>
                  <Controller
                    name={`rawMaterials.${index}.rawMaterialId` as const}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una materia prima" />
                        </SelectTrigger>
                        <SelectContent>
                          {available.length === 0 ? (
                            <SelectItem value="no-materials" disabled>
                              No hay materias primas disponibles
                            </SelectItem>
                          ) : (
                            available.map((material) => (
                              <SelectItem key={material.id} value={material.id}>
                                <span className="inline-flex items-center">
                                  <Badge variant={material.type === 'chemical' ? 'chemical' : 'packaging'} className="mr-2">
                                    ●
                                  </Badge>
                                  {material.name}
                                </span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex-[2] space-y-1">
                  <label className="text-xs font-medium text-gray-900">Fórmula</label>
                  <Controller
                    name={`rawMaterials.${index}.formula` as const}
                    control={control}
                    render={({ field }) => (
                      <FormulaInput
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-5 h-9 w-9"
                  onClick={() => removeRow(index)}
                  disabled={(watchedRawMaterials?.length || 0) <= 1}
                >
                  <Trash2 className="h-4 w-4 text-coral-alerta" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border-tabla">
        <Button type="button" variant="secondary" onClick={() => router.push('/products')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
