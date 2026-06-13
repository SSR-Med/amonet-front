'use client';

import { useState, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import * as logsApi from '@/lib/api/logs';
import type { LogItem } from '@/types';
import { Calendar, Download, Search } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function formatPeso(peso: number | null): string {
  if (peso === null) return '-';
  if (peso < 1024) return `${peso} B`;
  if (peso < 1024 * 1024) return `${(peso / 1024).toFixed(1)} KB`;
  return `${(peso / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LogsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<LogItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(today);
  const [searchClicked, setSearchClicked] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await logsApi.getLogs(currentPage, pageSize, fechaInicio, fechaFin);
      setItems(res.items);
      setTotalItems(res.total_items);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al cargar logs'), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, fechaInicio, fechaFin, toast]);

  useEffect(() => {
    if (searchClicked > 0 || currentPage > 1) {
      fetchLogs();
    }
  }, [fetchLogs, searchClicked, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchClicked((c) => c + 1);
    fetchLogs();
  };

  const handleDownload = async (log: LogItem) => {
    try {
      const token = localStorage.getItem('amonet_token');
      const url = `${API_URL}/logs/download?nombre=${encodeURIComponent(log.nombre)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }

      if (res.redirected) {
        window.open(res.url, '_blank');
      } else {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = log.nombre;
        a.click();
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al descargar'), variant: 'error' });
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <>
      <PageHeader title="Logs" description="Visualiza los archivos de auditoría del sistema" />
      <div className="px-6">
        <div className="mb-4 flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-44"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gris-tecnico mb-1">Fecha fin</label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-44"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>

        {loading && <p className="text-sm text-gris-tecnico py-8 text-center">Cargando...</p>}

        {!loading && items.length === 0 && (
          <p className="text-sm text-gris-tecnico py-8 text-center">
            No hay logs en el rango seleccionado.
          </p>
        )}

        {!loading && items.length > 0 && (
          <div className="rounded-8 border border-border-tabla overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-lavanda-soft border-b border-border-tabla">
                  <th className="text-left px-4 py-3 font-medium text-gris-tecnico">Archivo</th>
                  <th className="text-left px-4 py-3 font-medium text-gris-tecnico">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gris-tecnico">Peso</th>
                  <th className="text-left px-4 py-3 font-medium text-gris-tecnico">Origen</th>
                  <th className="w-20 px-4 py-3 font-medium text-gris-tecnico">Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={`${log.origen}-${log.nombre}`} className="border-b border-border-tabla hover:bg-lila-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{log.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">{log.fecha}</td>
                    <td className="px-4 py-3 text-gray-700">{formatPeso(log.peso)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-8 px-2 py-0.5 text-xs font-medium ${
                        log.origen === 's3' ? 'bg-lila-50 text-violet-lab' : 'bg-verde-exito/10 text-verde-exito'
                      }`}>
                        {log.origen === 's3' ? 'S3' : 'Local'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(log)} title="Descargar">
                        <Download className="h-4 w-4 text-violet-lab" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border-tabla">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gris-tecnico">Registros por página</span>
                <select
                  className="text-sm border border-border-tabla rounded-8 px-2 py-1 bg-white"
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                >
                  {[10, 20, 50, 100].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gris-tecnico mr-2">
                    Página {currentPage} de {totalPages} ({totalItems} registros)
                  </span>
                  <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    Anterior
                  </Button>
                  <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
