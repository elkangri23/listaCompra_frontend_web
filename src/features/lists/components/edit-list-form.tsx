'use client';

import { Lista } from '@/types/Lista.types';
import { useState } from 'react';

export type EditListFormValues = {
  nombre: string;
  descripcion?: string;
};

interface EditListFormProps {
  list: Lista;
  onSubmit: (data: EditListFormValues) => void;
}

export function EditListForm({ list, onSubmit }: EditListFormProps) {
  const [nombre, setNombre] = useState(list.nombre);
  const [descripcion, setDescripcion] = useState(list.descripcion ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, descripcion });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          type="text"
          placeholder="Mi nueva lista"
          value={nombre}
          onChange={(e: any) => setNombre(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="descripcion">Descripción</label>
        <input
          id="descripcion"
          type="text"
          placeholder="Una breve descripción"
          value={descripcion}
          onChange={(e: any) => setDescripcion(e.target.value)}
        />
      </div>
      <button type="submit">Guardar</button>
    </form>
  );
}