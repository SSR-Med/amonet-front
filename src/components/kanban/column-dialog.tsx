'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva columna</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la columna"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={submitting || !nombre.trim()}>
              {submitting ? 'Creando...' : 'Crear columna'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
