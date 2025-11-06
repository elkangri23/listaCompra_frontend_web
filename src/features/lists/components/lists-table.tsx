'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Lista } from '@/types/Lista.types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useDeleteList, useUpdateList } from '../hooks/use-lists';
import { EditListDialog } from './edit-list-dialog';
import { EditListFormValues } from './edit-list-form';

interface ListsTableProps {
  lists: Lista[];
}

export function ListsTable({ lists }: ListsTableProps) {
  const deleteListMutation = useDeleteList();
  const updateListMutation = useUpdateList();

  const handleUpdateList = (id: string) => (data: EditListFormValues) => {
    updateListMutation.mutate({ id, data });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lists.map((list) => (
          <TableRow key={list.id}>
            <TableCell><Link href={`/lists/${list.id}`} className="hover:underline">{list.nombre}</Link></TableCell>
            <TableCell>{list.descripcion}</TableCell>
            <TableCell className="text-right">
              <EditListDialog list={list} onSubmit={handleUpdateList(list.id)} />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará
                      permanentemente la lista.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteListMutation.mutate(list.id)}
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
