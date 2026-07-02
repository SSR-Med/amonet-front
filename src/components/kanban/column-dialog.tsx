'use client';

import { useState } from 'react';
import { X, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import * as api from '@/lib/api/kanban-board';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function ColumnDialog({ onClose, onCreated }: Props) {
  const { toast } = useToast();
  const [nombre, setNombre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nombre.trim()) return;
    setSubmitting(true);
    try {
      await api.createColumnaKanban({ nombre: nombre.trim() });
      toast({ title: 'Columna creada', variant: 'success' });
      onCreated();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl border-border-tabla shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tabla">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-lab/10">
              <LayoutGrid className="h-4 w-4 text-violet-lab" />
            </div>
            <h2 className="text-base font-semibold text-lila-900">Nueva columna</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gris-tecnico hover:bg-lila-50 hover:text-lila-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="text-xs font-medium text-gris-tecnico uppercase tracking-wide">Nombre de la columna</label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: En Progreso, Hecho, Revisión..."
            className="mt-2 w-full"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-tabla bg-lavanda-soft/30">
          <Button variant="secondary" onClick={onClose} className="rounded-xl">Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !nombre.trim()}
            className="rounded-xl bg-violet-lab hover:bg-violet-700"
          >
            {submitting ? 'Creando...' : 'Crear columna'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
