'use client';

import { useParams } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban/kanban-board';

export default function KanbanBoardSprintPage() {
  const params = useParams();
  return <KanbanBoard sprintId={params.sprint_id as string} />;
}
