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
import { Badge } from '@/components/ui/badge';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
}

interface EntityTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  editHref: (item: T) => string;
  onDelete: (item: T) => void;
  deleteDisabled?: (item: T) => boolean;
  deleteTooltip?: (item: T) => string;
}

export function EntityTable<T extends { id: string }>({
  data,
  columns,
  editHref,
  onDelete,
  deleteDisabled,
  deleteTooltip,
}: EntityTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key}>{col.header}</TableHead>
          ))}
          <TableHead className="w-24">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length + 1} className="h-32 text-center text-gris-tecnico">
              No hay registros
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.render(item)}</TableCell>
              ))}
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link href={editHref(item)}>
                      <Pencil className="h-4 w-4 text-violet-lab" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={deleteDisabled?.(item)}
                    title={deleteTooltip?.(item)}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-4 w-4 text-coral-alerta" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
