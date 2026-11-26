import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { PurchaseHabitsSection } from '@/features/ai/components/purchase-habits-section';
import { aiService } from '@/features/ai/services/ai-service';

jest.mock('next-auth/react');
jest.mock('@/features/ai/services/ai-service', () => ({
  aiService: {
    analyzePurchaseHabits: jest.fn(),
  },
}));
jest.mock('@/components/layout', () => ({
  GeneralLoading: () => <div data-testid="general-loading">Cargando...</div>,
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockAnalyze = aiService.analyzePurchaseHabits as jest.Mock;

const habitsResponse = {
  insights: [
    {
      type: 'frequency',
      title: 'Compras la leche cada semana',
      description: 'La leche aparece en tus listas casi cada semana.',
      confidence: 0.82,
    },
    {
      type: 'optimization',
      title: 'Podrías ahorrar comprando a granel',
      description: 'El arroz lo compras en paquetes pequeños cada semana.',
      confidence: 0.64,
    },
  ],
  metadata: {
    period: { start: '2026-08-28', end: '2026-11-26', preset: '90d' },
    productsAnalyzed: 42,
    listsAnalyzed: 5,
    generatedAt: '2026-11-26T16:00:00.000Z',
  },
};

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PurchaseHabitsSection />
    </QueryClientProvider>,
  );
}

describe('PurchaseHabitsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ data: { user: { id: 'u-1' } } } as any);
    mockAnalyze.mockResolvedValue(habitsResponse);
  });

  it('no llama a la IA hasta pulsar Analizar', () => {
    renderSection();

    expect(screen.getByText('Tus hábitos de compra')).toBeInTheDocument();
    expect(mockAnalyze).not.toHaveBeenCalled();
    expect(screen.getByText('Analizar mis hábitos')).toBeInTheDocument();
  });

  it('muestra los insights con confianza y resumen tras analizar', async () => {
    renderSection();
    fireEvent.click(screen.getByText('Analizar mis hábitos'));

    expect(await screen.findByText('Compras la leche cada semana')).toBeInTheDocument();
    expect(screen.getByText('Podrías ahorrar comprando a granel')).toBeInTheDocument();
    expect(screen.getByText('Confianza: 82%')).toBeInTheDocument();
    expect(screen.getByText(/42 productos analizados en 5 listas/)).toBeInTheDocument();
    expect(mockAnalyze).toHaveBeenCalledWith('u-1', '90d');
  });

  it('respeta el periodo elegido al analizar', async () => {
    renderSection();
    fireEvent.change(screen.getByLabelText('Periodo de análisis'), { target: { value: '30d' } });
    fireEvent.click(screen.getByText('Analizar mis hábitos'));

    await waitFor(() => {
      expect(mockAnalyze).toHaveBeenCalledWith('u-1', '30d');
    });
  });

  it('muestra el estado vacío cuando no hay insights', async () => {
    mockAnalyze.mockResolvedValue({ insights: [], metadata: habitsResponse.metadata });
    renderSection();
    fireEvent.click(screen.getByText('Analizar mis hábitos'));

    expect(
      await screen.findByText('Todavía no hay suficientes compras en este periodo para sacar conclusiones.'),
    ).toBeInTheDocument();
  });

  it('muestra el error cuando el análisis falla', async () => {
    mockAnalyze.mockRejectedValue(new Error('IA caída'));
    renderSection();
    fireEvent.click(screen.getByText('Analizar mis hábitos'));

    expect(await screen.findByText(/No se pudo analizar tus hábitos ahora mismo/)).toBeInTheDocument();
  });
});
