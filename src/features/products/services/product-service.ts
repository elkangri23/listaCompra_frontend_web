import { axiosInstance } from '@/lib/api/axios-instance';
import {
  AddProductDto,
  AddProductResponseDto,
  DeleteProductDto,
  DeleteProductResponseDto,
  GetProductsDto,
  GetProductsResponseDto,
  MarkAsPurchasedDto,
  MarkAsPurchasedResponseDto,
  ReorderProductsDto,
  ReorderProductsResponseDto,
  UpdateProductDto,
  UpdateProductResponseDto,
} from '@/types/dtos/products';

const getProducts = async (
  params: GetProductsDto
): Promise<GetProductsResponseDto> => {
  const { listaId, ...rest } = params;

  const response = await axiosInstance.get<GetProductsResponseDto>(
    `/lists/${listaId}/products`,
    {
      params: rest,
    }
  );

  return response.data;
};

const createProduct = async (
  listaId: string,
  data: Omit<AddProductDto, 'listaId'>
): Promise<AddProductResponseDto> => {
  const response = await axiosInstance.post<AddProductResponseDto>(
    `/lists/${listaId}/products`,
    {
      ...data,
      listaId,
    }
  );

  return response.data;
};

const updateProduct = async (
  listaId: string,
  productoId: string,
  data: UpdateProductDto
): Promise<UpdateProductResponseDto> => {
  const response = await axiosInstance.put<UpdateProductResponseDto>(
    `/lists/${listaId}/products/${productoId}`,
    data
  );

  return response.data;
};

const deleteProduct = async (
  listaId: string,
  productoId: string,
  data?: DeleteProductDto
): Promise<DeleteProductResponseDto> => {
  const response = await axiosInstance.delete<DeleteProductResponseDto>(
    `/lists/${listaId}/products/${productoId}`,
    {
      data,
    }
  );

  return response.data;
};

const togglePurchased = async (
  listaId: string,
  productoId: string,
  data: MarkAsPurchasedDto
): Promise<MarkAsPurchasedResponseDto> => {
  const response = await axiosInstance.patch<MarkAsPurchasedResponseDto>(
    `/lists/${listaId}/products/${productoId}/purchase`,
    data
  );

  return response.data;
};

const reorderProducts = async (
  listaId: string,
  data: ReorderProductsDto
): Promise<ReorderProductsResponseDto> => {
  const response = await axiosInstance.patch<ReorderProductsResponseDto>(
    `/lists/${listaId}/products/reorder`,
    data
  );

  return response.data;
};

export const productService = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  togglePurchased,
  reorderProducts,
};
