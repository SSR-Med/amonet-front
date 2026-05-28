'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormulaInput } from './formula-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRawMaterialStore } from '@/stores';
import type { RawMaterial } from '@/types';

interface RawMaterialRow {
  rawMaterialId: string;
  formula: string;
}

interface RawMaterialFormulaRowProps {
  index: number;
  row: RawMaterialRow;
  availableMaterials: RawMaterial[];
  onRemove: () => void;
  canRemove: boolean;
  errors?: { rawMaterialId?: { message?: string }; formula?: { message?: string } };
}

export function RawMaterialFormulaRow({
  index,
  row,
  availableMaterials,
  onRemove,
  canRemove,
  errors,
}: RawMaterialFormulaRowProps) {
  const selectedMaterial = availableMaterials.find((m) => m.id === row.rawMaterialId);

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 space-y-1">
        <Select
          value={row.rawMaterialId}
          onValueChange={(value) => {
            const select = document.querySelector(`[name="rawMaterials.${index}.rawMaterialId"]`);
            if (select) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
              nativeInputValueSetter?.call(select, value);
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una materia prima" />
          </SelectTrigger>
          <SelectContent>
            {availableMaterials.length === 0 ? (
              <SelectItem value="no-materials" disabled>
                No hay materias primas disponibles
              </SelectItem>
            ) : (
              availableMaterials.map((material) => (
                <SelectItem key={material.id} value={material.id}>
                  <Badge variant={material.type === 'chemical' ? 'chemical' : 'packaging'} className="mr-2">
                    ●
                  </Badge>
                  {material.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors?.rawMaterialId?.message && (
          <p className="text-xs text-coral-alerta">{errors.rawMaterialId.message}</p>
        )}
      </div>

      <div className="flex-[2] space-y-1">
        <FormulaInput
          value={row.formula}
          onChange={(value) => {
            const input = document.querySelector(`[name="rawMaterials.${index}.formula"]`) as HTMLInputElement;
            if (input) {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
              nativeInputValueSetter?.call(input, value);
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }}
        />
        {errors?.formula?.message && (
          <p className="text-xs text-coral-alerta">{errors.formula.message}</p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-1 h-9 w-9"
        onClick={onRemove}
        disabled={!canRemove}
      >
        <Trash2 className="h-4 w-4 text-coral-alerta" />
      </Button>
    </div>
  );
}
