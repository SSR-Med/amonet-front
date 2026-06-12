'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
}

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

interface EntityTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  editHref?: (item: T) => string;
  onDelete?: (item: T) => void;
  deleteDisabled?: (item: T) => boolean;
  deleteTooltip?: (item: T) => string;
  hideActions?: boolean;
  pagination?: PaginationProps;
}

export function EntityTable<T extends { id: string }>({
  data,
  columns,
  editHref,
  onDelete,
  deleteDisabled,
  deleteTooltip,
  hideActions = false,
  pagination,
}: EntityTableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.pageSize) : 1;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
            {!hideActions && <TableHead className="w-24">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (hideActions ? 0 : 1)} className="h-32 text-center text-gris-tecnico">
                No hay registros
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.render(item)}</TableCell>
                ))}
                {!hideActions && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href={editHref?.(item) ?? '#'}>
                          <Pencil className="h-4 w-4 text-violet-lab" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={deleteDisabled?.(item)}
                        title={deleteTooltip?.(item)}
                        onClick={() => onDelete?.(item)}
                      >
                        <Trash2 className="h-4 w-4 text-coral-alerta" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <span className="text-sm text-gris-tecnico">
            Página {pagination.currentPage} de {totalPages} ({pagination.totalItems} registros)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.currentPage >= totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
