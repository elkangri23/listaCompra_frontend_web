'use client';

import { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Lista } from '@/types/Lista.types';
import Link from 'next/link';
import { useDeleteList, useUpdateList } from '../hooks/use-lists';
import { EditListFormValues } from './edit-list-form';

const EditListDialog = dynamic(() => import('./edit-list-dialog').then((mod) => mod.EditListDialog));

interface ListsTableProps {
  lists: Lista[];
}

export function ListsTable({ lists }: ListsTableProps) {
  const deleteListMutation = useDeleteList();
  const updateListMutation = useUpdateList();

  const handleUpdateList = (id: string) => (data: EditListFormValues) => {
    updateListMutation.mutate({ id, data });
  };

  const handleDeleteList = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta lista?')) {
      deleteListMutation.mutate(id);
    }
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lists.map((list) => (
            <tr key={list.id}>
              <td>
                <Link href={`/lists/${list.id}`}>
                  {list.nombre}
                </Link>
              </td>
              <td>{list.descripcion}</td>
              <td>
                <EditListDialog list={list} onSubmit={handleUpdateList(list.id)} />
                <button onClick={() => handleDeleteList(list.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}