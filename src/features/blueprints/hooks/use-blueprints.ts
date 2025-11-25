import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blueprintService } from '../services/blueprint-service';
import type {
  BlueprintFiltersDto,
  CreateBlueprintDto,
  UpdateBlueprintDto,
  CreateListFromBlueprintDto,
} from '@/types/dtos/blueprint';
import { toast } from 'sonner';

/**
 * Hook para obtener todos los blueprints con filtros
 */
export const useBlueprints = (filters?: BlueprintFiltersDto) => {
  return useQuery({
    queryKey: ['blueprints', filters],
    queryFn: () => blueprintService.getBlueprints(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para obtener un blueprint por ID
 */
export const useBlueprintById = (id: string) => {
  return useQuery({
    queryKey: ['blueprints', id],
    queryFn: () => blueprintService.getBlueprintById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para crear un blueprint
 */
export const useCreateBlueprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlueprintDto) => blueprintService.createBlueprint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      toast.success('Plantilla creada correctamente');
    },
    onError: () => {
      toast.error('Error al crear la plantilla');
    },
  });
};

/**
 * Hook para actualizar un blueprint
 */
export const useUpdateBlueprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlueprintDto }) =>
      blueprintService.updateBlueprint(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      queryClient.invalidateQueries({ queryKey: ['blueprints', variables.id] });
      toast.success('Plantilla actualizada correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar la plantilla');
    },
  });
};

/**
 * Hook para eliminar un blueprint
 */
export const useDeleteBlueprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blueprintService.deleteBlueprint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      toast.success('Plantilla eliminada correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar la plantilla');
    },
  });
};

/**
 * Hook para crear una lista desde un blueprint
 */
export const useCreateListFromBlueprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blueprintId, data }: { blueprintId: string; data?: CreateListFromBlueprintDto }) =>
      blueprintService.createListFromBlueprint(blueprintId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success(`Lista "${response.nombre}" creada con ${response.productosCreados} productos`);
    },
    onError: () => {
      toast.error('Error al crear lista desde plantilla');
    },
  });
};

/**
 * Hook para crear un blueprint desde una lista existente
 */
export const useCreateBlueprintFromList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      listId, 
      blueprintData 
    }: { 
      listId: string; 
      blueprintData: Omit<CreateBlueprintDto, 'productos'> 
    }) => blueprintService.createBlueprintFromList(listId, blueprintData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      toast.success('Plantilla creada desde lista correctamente');
    },
    onError: () => {
      toast.error('Error al crear plantilla desde lista');
    },
  });
};
