'use client';

import { Button } from '@/components/ui/button';

interface PaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function PaginationBar({ currentPage, totalItems, pageSize, onPageChange, onPageSizeChange }: PaginationBarProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-8 border border-border-tabla bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <>
            <span className="text-sm text-gris-tecnico">Registros por página</span>
            <select
              className="cursor-pointer rounded-8 border border-border-tabla bg-white px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="mr-2 text-sm text-gris-tecnico">
          Página {currentPage} de {totalPages} ({totalItems} registros)
        </span>
        {totalPages > 1 && (
          <>
            <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
              Anterior
            </Button>
            <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
              Siguiente
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
