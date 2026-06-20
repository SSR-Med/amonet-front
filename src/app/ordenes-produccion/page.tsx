'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Calendar, Package, FlaskConical } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FilterContainer } from '@/components/ui/filter-container';
import { PaginationBar } from '@/components/ui/pagination-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { useProductStore } from '@/stores';
import * as api from '@/lib/api/ordenes-produccion';
import type { OrdenProduccionDetail, EstadoProduccion } from '@/types';

export default function OrdenesProduccionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const { getAll: getAllProducts, items: products } = useProductStore();

  const [items, setItems] = useState<OrdenProduccionDetail[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [fechaMin, setFechaMin] = useState('');
  const [fechaMax, setFechaMax] = useState('');
  const [productoId, setProductoId] = useState('');
  const [estadoId, setEstadoId] = useState('');
  const [estados, setEstados] = useState<EstadoProduccion[]>([]);

  useEffect(() => {
    getAllProducts(1, 100);
    api.getEstadosProduccion().then(setEstados).catch(() => {});
  }, [getAllProducts]);

  const buildFilters = useCallback(() => {
    const filters: Record<string, string> = {};
    if (fechaMin) filters.fecha_min = fechaMin;
    if (fechaMax) filters.fecha_max = fechaMax;
    if (productoId) filters.amonet_producto_id = productoId;
    if (estadoId) filters.amonet_estado_produccion_id = estadoId;
    return filters;
  }, [fechaMin, fechaMax, productoId, estadoId]);

  const fetch = useCallback(async (p: number, ps?: number) => {
    setLoading(true);
    try {
      const res = await api.getAllOrdenesProduccion(p, ps || pageSize, buildFilters());
      setItems(res.items);
      setTotalItems(res.total_items);
      setPage(res.current_page);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, buildFilters, pageSize]);

  useEffect(() => {
    fetch(1);
  }, []);

  return (
    <>
      <PageHeader
        title="Órdenes de Producción"
        description="Gestiona las órdenes de producción"
        createHref={isAdmin ? '/ordenes-produccion/new' : undefined}
        createLabel="Nueva Orden"
      />

      <div className="px-6">
        <FilterContainer
          open={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
          onSearch={() => fetch(1, pageSize)}
          loading={loading}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha inicio</label>
              <Input type="date" value={fechaMin} onChange={(e) => setFechaMin(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha fin</label>
              <Input type="date" value={fechaMax} onChange={(e) => setFechaMax(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Producto</label>
              <Select value={productoId} onValueChange={setProductoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gris-tecnico mb-1">Estado</label>
              <Select value={estadoId} onValueChange={setEstadoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FilterContainer>

        {loading && <p className="py-8 text-center text-sm text-gris-tecnico">Cargando...</p>}

        {!loading && items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gris-tecnico">No se encontraron órdenes de producción.</p>
              {isAdmin && (
                <Button asChild className="mt-4">
                  <Link href="/ordenes-produccion/new">Nueva Orden</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3 mb-4">
            {items.map(orden => (
              <Card key={orden.id} className="cursor-pointer hover:border-violet-lab transition-colors" onClick={() => router.push(`/ordenes-produccion/${orden.id}`)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-violet-lab shrink-0" />
                        <p className="text-sm font-medium truncate">{orden.producto.nombre}</p>
                        <Badge variant="default">{orden.estado_produccion.nombre}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gris-tecnico">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(orden.fecha_alta).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FlaskConical className="h-3 w-3" />
                          {orden.materias_primas.length} MP
                        </span>
                        <span>${orden.coste.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <PaginationBar
            currentPage={page}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => fetch(p, pageSize)}
            onPageSizeChange={(s) => { setPageSize(s); fetch(1, s); }}
          />
        )}
      </div>
    </>
  );
}
