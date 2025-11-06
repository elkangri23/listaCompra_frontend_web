'use client';

import { useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
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
import { EditListFormValues } from './edit-list-form';
import { useVirtualList } from '@/hooks/use-virtual-list';

const EditListDialog = dynamic(() => import('./edit-list-dialog').then((mod) => mod.EditListDialog));

interface ListsTableProps {
  lists: Lista[];
}

export function ListsTable({ lists }: ListsTableProps) {
  const deleteListMutation = useDeleteList();
  const updateListMutation = useUpdateList();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const tableRows = useMemo(() => lists, [lists]);
  const shouldVirtualize = tableRows.length > 20;

  const { virtualItems, paddingTop, paddingBottom } = useVirtualList({
    itemCount: shouldVirtualize ? tableRows.length : 0,
    itemHeight: 68,
    overscan: 6,
    scrollRef: scrollContainerRef,
    initialViewportHeight: 400,
  });

  const handleUpdateList = (id: string) => (data: EditListFormValues) => {
    updateListMutation.mutate({ id, data });
  };

  return (
    <div
      ref={scrollContainerRef}
      className="max-h-[520px] overflow-y-auto"
      data-testid="lists-table-virtual-scroll"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shouldVirtualize && paddingTop > 0 && (
            <TableRow aria-hidden style={{ height: paddingTop }}>
              <TableCell colSpan={3} />
            </TableRow>
          )}
          {(shouldVirtualize
            ? virtualItems
                .map((virtualRow) => tableRows[virtualRow.index])
                .filter((list): list is Lista => Boolean(list))
            : tableRows
          ).map((list) => (
            <TableRow key={list.id}>
              <TableCell>
                <Link href={`/lists/${list.id}`} className="hover:underline">
                  {list.nombre}
                </Link>
              </TableCell>
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
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la lista.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteListMutation.mutate(list.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
          {shouldVirtualize && paddingBottom > 0 && (
            <TableRow aria-hidden style={{ height: paddingBottom }}>
              <TableCell colSpan={3} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
