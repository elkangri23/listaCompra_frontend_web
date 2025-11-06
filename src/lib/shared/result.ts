// Módulo Result temporal para tipos del backend
// TODO: Estos tipos deberían venir del backend mediante MCP

export interface Result<T, E = Error> {
  isSuccess: boolean;
  isFailure: boolean;
  success: boolean; // Alias for isSuccess
  value?: T;
  error?: E;
}

export function success<T>(value: T): Result<T, never> {
  return {
    isSuccess: true,
    isFailure: false,
    success: true,
    value,
  };
}

export function failure<E>(error: E): Result<never, E> {
  return {
    isSuccess: false,
    isFailure: true,
    success: false,
    error,
  };
}
