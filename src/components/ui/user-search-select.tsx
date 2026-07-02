'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Check } from 'lucide-react';
import * as usersApi from '@/lib/api/users';

interface UserOption {
  id: string;
  documento: string;
  nombre: string;
}

interface Props {
  value: string;
  onChange: (userId: string) => void;
  placeholder?: string;
}

export function UserSearchSelect({ value, onChange, placeholder = 'Buscar usuario...' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = users.find((u) => u.id === value);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getAllUsuarios();
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await usersApi.getAllUsuarios();
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [open]);

  const filtered = query
    ? users.filter(
        (u) =>
          u.documento.toLowerCase().includes(query.toLowerCase()) ||
          u.nombre.toLowerCase().includes(query.toLowerCase()),
      )
    : users;

  return (
    <div ref={ref} className="relative">
      <div
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border-tabla px-3 py-2 text-sm hover:bg-lila-50 transition-colors"
        onClick={() => {
          setOpen(!open);
          setQuery('');
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <Search className="h-4 w-4 text-gris-tecnico shrink-0" />
        {selected ? (
          <span className="text-lila-800">{selected.documento} - {selected.nombre}</span>
        ) : (
          <span className="text-gris-tecnico">{placeholder}</span>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-full rounded-xl bg-white shadow-lg border border-border-tabla overflow-hidden">
          <div className="p-2 border-b border-border-tabla">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-border-tabla px-3 py-1.5 text-sm outline-none focus:border-violet-lab"
              placeholder="Buscar por documento o nombre..."
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {loading && users.length === 0 && (
              <p className="p-3 text-sm text-gris-tecnico text-center">Cargando...</p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="p-3 text-sm text-gris-tecnico text-center">Sin resultados</p>
            )}
            {filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-lila-50 transition-colors"
                onClick={() => {
                  onChange(u.id);
                  setOpen(false);
                }}
              >
                <span className="flex-1">
                  <span className="font-medium text-lila-900">{u.documento}</span>
                  <span className="text-gris-tecnico ml-1">- {u.nombre}</span>
                </span>
                {u.id === value && <Check className="h-4 w-4 text-violet-lab shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
