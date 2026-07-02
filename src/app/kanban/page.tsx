'use client';

import { useRouter } from 'next/navigation';
import { Kanban, IterationCcw, ListTodo, Tags, ArrowUpFromDot } from 'lucide-react';

export default function KanbanHubPage() {
  const router = useRouter();

  const apps = [
    { label: 'Board', desc: 'Tablero kanban con drag & drop', icon: Kanban, href: '/kanban/board', color: 'text-violet-lab' },
    { label: 'Sprints', desc: 'Administrar sprints', icon: IterationCcw, href: '/kanban/sprints', color: 'text-blue-600' },
    { label: 'Todas las tareas', desc: 'Visualizar y filtrar tareas', icon: ListTodo, href: '/kanban/tareas', color: 'text-emerald-600' },
    { label: 'Tags', desc: 'Etiquetas para clasificar tareas', icon: Tags, href: '/kanban/tags', color: 'text-amber-600' },
    { label: 'Prioridades', desc: 'Niveles de prioridad', icon: ArrowUpFromDot, href: '/kanban/prioridades', color: 'text-rose-600' },
  ];

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <h1 className="mb-2 text-center text-3xl font-semibold text-lila-900">
          Planeación
        </h1>
        <p className="mb-10 text-center text-base text-gris-tecnico">
          Seleccioná una sección para comenzar
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.href}
                onClick={() => router.push(app.href)}
                className="group flex flex-col items-center gap-4 rounded-2xl border-2 border-border-tabla bg-white p-8 shadow-sm transition-all hover:border-violet-lab hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 group-hover:bg-violet-100 transition-colors">
                  <Icon className={`h-7 w-7 ${app.color}`} />
                </div>
                <div className="text-center">
                  <h2 className="text-base font-semibold text-lila-900">{app.label}</h2>
                  <p className="mt-0.5 text-xs text-gris-tecnico">{app.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
