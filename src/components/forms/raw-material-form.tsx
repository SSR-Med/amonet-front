'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { rawMaterialSchema, RawMaterialFormData } from '@/types/schemas';
import { useRawMaterialStore } from '@/stores';
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

interface RawMaterialFormProps {
  initialData?: RawMaterialFormData;
  entityId?: string;
  mode?: 'create' | 'edit';
}

export function RawMaterialForm({ initialData, entityId, mode = 'create' }: RawMaterialFormProps) {
  const router = useRouter();
  const { create, update, isNameUnique, loadCatalogs, tipos, tiposUnidad } = useRawMaterialStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RawMaterialFormData>({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    if (tipos.length === 0 || tiposUnidad.length === 0) {
      loadCatalogs();
    }
  }, [tipos.length, tiposUnidad.length, loadCatalogs]);

  const onSubmit = async (data: RawMaterialFormData) => {
    const nameExists = isNameUnique(data.nombre, entityId);
    if (!nameExists) {
      setError('nombre', { message: 'Este nombre ya está en uso' });
      return;
    }

    try {
      if (mode === 'create') {
        await create(data);
        toast({ title: 'Materia prima creada', description: 'La materia prima se ha creado correctamente', variant: 'success' });
      } else {
        if (!entityId) return;
        await update(entityId, data);
        toast({ title: 'Materia prima actualizada', description: 'La materia prima se ha actualizado correctamente', variant: 'success' });
      }
      router.push('/raw-materials');
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nombre" error={errors.nombre?.message}>
        <Input {...register('nombre')} placeholder="Nombre de la materia prima" />
      </FormField>

      <Controller
        name="id_cat_amonet_tipo_materia_prima"
        control={control}
        render={({ field }) => (
          <FormField label="Tipo de materia prima" error={errors.id_cat_amonet_tipo_materia_prima?.message}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {tipos.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <Controller
        name="id_cat_amonet_tipo_unidad"
        control={control}
        render={({ field }) => (
          <FormField label="Unidad" error={errors.id_cat_amonet_tipo_unidad?.message}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la unidad" />
              </SelectTrigger>
              <SelectContent>
                {tiposUnidad.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre} ({u.abreviacion})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.push('/raw-materials')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Crear materia prima' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
