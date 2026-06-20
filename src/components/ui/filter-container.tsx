'use client';

import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterContainerProps {
  open: boolean;
  onToggle: () => void;
  onSearch: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export function FilterContainer({ open, onToggle, onSearch, loading, children }: FilterContainerProps) {
  return (
    <div className="mb-4">
      <button
        className="flex items-center gap-2 text-sm text-gris-tecnico mb-3 hover:text-gray-900"
        onClick={onToggle}
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Filtros de búsqueda
      </button>

      {open && (
        <div className="mb-4 rounded-8 border border-border-tabla bg-white p-4 space-y-3">
          {children}
          <Button onClick={onSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </div>
      )}

      {!open && (
        <div className="mb-4 flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onSearch} disabled={loading}>
            <Search className="mr-1 h-3 w-3" /> Buscar
          </Button>
        </div>
      )}
    </div>
  );
}
