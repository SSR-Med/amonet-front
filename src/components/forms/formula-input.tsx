'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFormula } from '@/lib/formula-validator';
import { useProductVariableStore } from '@/stores';
import type { ProductVariable } from '@/types';

interface FormulaInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function FormulaInput({
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: FormulaInputProps) {
  const { items, getAll } = useProductVariableStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVariables, setFilteredVariables] = useState<ProductVariable[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (items.length === 0) getAll();
  }, [items.length, getAll]);

  const validation = value.trim() ? validateFormula(value, items.map((v) => v.nombre)) : { valid: true };
  const showError = error || (!validation.valid && value.trim() !== '');

  useEffect(() => {
    if (value && showSuggestions) {
      const word = value.slice(0, cursorPosition).split(/[\s+\-*/^()]/).pop() || '';
      if (word && /^[a-zA-Z_]/.test(word)) {
        setFilteredVariables(
          items.filter((v) =>
            v.nombre.toLowerCase().startsWith(word.toLowerCase())
          )
        );
      } else {
        setFilteredVariables([]);
      }
    } else {
      setFilteredVariables([]);
    }
  }, [value, cursorPosition, items, showSuggestions]);

  const insertVariable = (varName: string) => {
    const word = value.slice(0, cursorPosition).split(/[\s+\-*/^()]/).pop() || '';
    const before = value.slice(0, cursorPosition - word.length);
    const after = value.slice(cursorPosition);
    const newValue = before + varName + after;
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setCursorPosition(e.target.selectionStart || 0);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
            onBlur?.();
          }}
          onKeyDown={(e) => {
            if (e.key === '(' || e.key === ')') {
              e.preventDefault();
              const pos = inputRef.current?.selectionStart || 0;
              const before = value.slice(0, pos);
              const after = value.slice(pos);
              onChange(before + e.key + after);
              setCursorPosition(pos + 1);
            }
          }}
          disabled={disabled}
          placeholder="Ej: peso_neto * 0.05"
          className={cn(
            'flex h-9 w-full rounded-8 border border-border-tabla bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gris-tecnico focus:border-2 focus:border-violet-lab focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            showError && 'border-coral-alerta',
            className
          )}
        />
        <div className="absolute right-3 flex items-center">
          {!value.trim() ? null : validation.valid ? (
            <Check className="h-4 w-4 text-verde-exito" />
          ) : (
            <AlertCircle className="h-4 w-4 text-coral-alerta" />
          )}
        </div>
      </div>

      {showSuggestions && filteredVariables.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-8 border border-border-tabla bg-white shadow-lg">
          {filteredVariables.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertVariable(v.nombre);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-lila-50"
              >
                <code className="text-violet-lab">{v.nombre}</code>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showError && (
        <p className="mt-1 text-xs text-coral-alerta">{error || validation.error}</p>
      )}

      <p className="mt-1 text-xs text-gris-tecnico">
        Variables disponibles: {items.length === 0 ? 'Ninguna' : items.map((v) => v.nombre).join(', ')}
      </p>
    </div>
  );
}
