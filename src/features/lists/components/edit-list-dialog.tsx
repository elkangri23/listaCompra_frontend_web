'use client';

import { EditListForm, EditListFormValues } from './edit-list-form';
import { Lista } from '@/types/Lista.types';

interface EditListDialogProps {
  list: Lista;
  onSubmit: (data: EditListFormValues) => void;
}

export function EditListDialog({ list, onSubmit }: EditListDialogProps) {
  return (
    <div>
      <button>
        Editar
      </button>
      <div>
        <h2>Editar lista</h2>
        <EditListForm list={list} onSubmit={onSubmit} />
      </div>
    </div>
  );
}