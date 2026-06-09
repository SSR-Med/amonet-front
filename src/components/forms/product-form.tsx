'use client';

import { useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { productSchema, ProductFormData } from '@/types/schemas';
import { useProductStore, useBrandStore, useRawMaterialStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { FormField } from './form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormulaInput } from './formula-input';
import { Plus, Trash2 } from 'lucide-react';

interface ProductFormProps {
  initialData?: ProductFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function ProductForm({ initialData, entityId, mode = 'create' }: ProductFormProps) {
  const router = useRouter();
  const { create, update } = useProductStore();
  const { getAll: getAllBrands } = useBrandStore();
  const { getAll: getAllMaterials, items: allMaterials } = useRawMaterialStore();
  const { toast } = useToast();

  useEffect(() => {
    getAllBrands();
    getAllMaterials();
  }, [getAllBrands, getAllMaterials]);

  const brands = useBrandStore((s) => s.items);

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
      codigo: '',
      nombre: '',
      id_amonet_marca: '',
      materias_primas: [{ id_amonet_materia_prima: '', formula: '' }],
    },
  });

  const watchedRawMaterials = watch('materias_primas');

  const availableMaterials = useCallback(
    (excludeIds: string[]) => {
      const usedIds = new Set(excludeIds);
      return allMaterials.filter((m) => !usedIds.has(m.id));
    },
    [allMaterials]
  );

  const addRow = () => {
    const current = watch('materias_primas') || [];
    setValue('materias_primas', [...current, { id_amonet_materia_prima: '', formula: '' }]);
  };

  const removeRow = (index: number) => {
    const current = watch('materias_primas') || [];
    if (current.length > 1) {
      setValue(
        'materias_primas',
        current.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    const filteredMaterials = data.materias_primas.filter((rm) => rm.id_amonet_materia_prima && rm.formula);
    if (filteredMaterials.length === 0) {
      toast({ title: 'Error', description: 'Al menos una materia prima es requerida', variant: 'error' });
      return;
    }

    try {
      if (mode === 'create') {
        await create({ ...data, materias_primas: filteredMaterials });
        toast({ title: 'Producto creado', description: 'El producto se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        await update(entityId, { ...data, materias_primas: filteredMaterials });
        toast({ title: 'Producto actualizado', description: 'El producto se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/products');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Datos Generales</h3>

        <FormField label="Nombre" error={errors.nombre?.message}>
          <Input {...register('nombre')} placeholder="Nombre del producto" />
        </FormField>

        <FormField label="Código" error={errors.codigo?.message}>
          <Input {...register('codigo')} placeholder="Código alfanumérico" />
        </FormField>

        <Controller
          name="id_amonet_marca"
          control={control}
          render={({ field }) => (
            <FormField label="Marca" error={errors.id_amonet_marca?.message}>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.length === 0 ? (
                    <SelectItem value="no-brands" disabled>No hay marcas disponibles</SelectItem>
                  ) : (
                    brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.nombre}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormField>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Materias Primas</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        </div>

        {errors.materias_primas?.message && (
          <p className="text-xs text-coral-alerta">{errors.materias_primas.message}</p>
        )}

        <div className="space-y-3">
          {watchedRawMaterials?.map((row, index) => {
            const usedIds = watchedRawMaterials
              .filter((_, i) => i !== index)
              .map((r) => r.id_amonet_materia_prima)
              .filter(Boolean);
            const available = availableMaterials(usedIds);

            return (
              <div key={index} className="flex items-start gap-3 p-3 border border-border-tabla rounded-8">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-gray-900">Materia Prima</label>
                  <Controller
                    name={`materias_primas.${index}.id_amonet_materia_prima` as const}
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una materia prima" />
                        </SelectTrigger>
                        <SelectContent>
                          {available.length === 0 ? (
                            <SelectItem value="no-materials" disabled>No hay materias primas disponibles</SelectItem>
                          ) : (
                            available.map((material) => (
                              <SelectItem key={material.id} value={material.id}>
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-violet-lab" />
                                  {material.nombre}
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
                    name={`materias_primas.${index}.formula` as const}
                    control={control}
                    render={({ field }) => (
                      <FormulaInput value={field.value || ''} onChange={field.onChange} />
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
