'use client';

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface Props {
  value: RgbColor;
  onChange: (color: RgbColor) => void;
}

function toHex({ r, g, b }: RgbColor): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): RgbColor {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export function ColorPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const hex = toHex(value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-lg border border-border-tabla px-3 py-2 hover:bg-lila-50 transition-colors"
      >
        <div className="h-6 w-6 rounded-full border border-border-tabla" style={{ backgroundColor: hex }} />
        <span className="text-sm text-lila-800 font-medium">{hex}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-12 z-50 rounded-xl bg-white p-3 shadow-lg border border-border-tabla">
          <HexColorPicker color={hex} onChange={(h) => onChange(fromHex(h))} />
          <input
            type="text"
            value={hex}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                onChange(fromHex(val));
              }
            }}
            className="mt-2 w-full rounded-md border border-border-tabla px-2 py-1.5 text-xs font-mono text-center outline-none focus:border-violet-lab transition-colors"
            placeholder="#ff0000"
          />
          <div className="mt-3 flex gap-2">
            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#6b7280'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(fromHex(c))}
                className="h-6 w-6 rounded-full border border-border-tabla transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
