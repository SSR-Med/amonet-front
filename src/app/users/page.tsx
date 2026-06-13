'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUserStore } from '@/stores';
import { PageHeader } from '@/components/layout';
import { EntityTable } from '@/components/tables';
import { ConfirmDeleteModal } from '@/components/modals';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import type { User } from '@/types';

export default function UsersPage() {
  const { items: users, totalItems, currentPage, pageSize, loading, getAll, delete: deleteUser } = useUserStore();
  const { toast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<User | null>(null);

  const fetchUsers = useCallback(
    (page = 1) => getAll(page, pageSize),
    [getAll, pageSize],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    getAll(1, newPageSize);
  }, [getAll]);

  const handleDelete = useCallback((user: User) => {
    setItemToDelete(user);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await deleteUser(itemToDelete.id);
      toast({ title: 'Usuario desactivado', description: 'El usuario se ha desactivado correctamente', variant: 'success' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchUsers(currentPage);
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err, 'Error al desactivar'), variant: 'error' });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, deleteUser, toast, fetchUsers, currentPage]);

  const columns = [
    {
      key: 'documento',
      header: 'Documento',
      render: (user: User) => <span className="font-medium text-gray-900">{user.documento}</span>,
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (user: User) => <span>{user.nombre}</span>,
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (user: User) => (
        <Badge variant={user.rol === 'ADMIN' ? 'chemical' : 'default'}>{user.rol}</Badge>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (user: User) => (
        <Badge variant={user.activo ? 'success' : 'error'}>
          {user.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ];

  if (!loading && users.length === 0) {
    return (
      <>
        <PageHeader title="Usuarios" description="Gestiona los usuarios del sistema" />
        <EmptyState
          title="Aún no hay usuarios"
          description="Crea el primer usuario para comenzar."
          href="/users/new"
          hrefLabel="Crear usuario"
          icon="brand"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios del sistema"
        createHref="/users/new"
        createLabel="Crear usuario"
      />
      <div className="px-6">
        <EntityTable
          data={users}
          columns={columns}
          editHref={(user) => `/users/${user.id}/edit`}
          onDelete={handleDelete}
          pagination={{
            currentPage,
            totalItems,
            pageSize,
            onPageChange: fetchUsers,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title="¿Desactivar usuario?"
        description="El usuario no podrá iniciar sesión hasta que sea reactivado."
        itemName={itemToDelete?.documento || ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}
