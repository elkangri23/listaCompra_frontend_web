import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/layout/hero';

describe('Hero', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar el componente Hero', () => {
      render(<Hero imageUrl="/test-image.jpg" />);
      const hero = screen.getByRole('img');
      expect(hero).toBeInTheDocument();
    });

    it('debe aplicar la imagen de fondo correctamente', () => {
      render(<Hero imageUrl="/test-image.jpg" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveStyle({ backgroundImage: 'url(/test-image.jpg)' });
    });

    it('debe usar altura "md" por defecto', () => {
      render(<Hero imageUrl="/test-image.jpg" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveClass('hero--md');
    });

    it('debe renderizar sin alt text por defecto', () => {
      render(<Hero imageUrl="/test-image.jpg" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveAttribute('aria-label', '');
    });
  });

  describe('Props personalizadas', () => {
    it('debe aplicar alt text cuando se proporciona', () => {
      render(<Hero imageUrl="/test-image.jpg" alt="Hero principal" />);
      const hero = screen.getByRole('img', { name: 'Hero principal' });
      expect(hero).toHaveAttribute('aria-label', 'Hero principal');
    });

    it('debe aplicar altura "sm"', () => {
      render(<Hero imageUrl="/test-image.jpg" height="sm" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveClass('hero--sm');
    });

    it('debe aplicar altura "lg"', () => {
      render(<Hero imageUrl="/test-image.jpg" height="lg" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveClass('hero--lg');
    });

    it('debe aplicar className personalizada', () => {
      render(<Hero imageUrl="/test-image.jpg" className="custom-hero" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveClass('custom-hero');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener role="img" para accesibilidad', () => {
      render(<Hero imageUrl="/test-image.jpg" alt="Hero image" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveAttribute('role', 'img');
    });

    it('debe proporcionar aria-label descriptivo', () => {
      const altText = 'Banner principal con productos';
      render(<Hero imageUrl="/test-image.jpg" alt={altText} />);
      const hero = screen.getByRole('img', { name: altText });
      expect(hero).toBeInTheDocument();
    });

    it('debe combinar todas las clases correctamente', () => {
      render(
        <Hero 
          imageUrl="/test-image.jpg" 
          alt="Hero completo" 
          height="lg" 
          className="extra-class" 
        />
      );
      const hero = screen.getByRole('img');
      expect(hero).toHaveClass('hero');
      expect(hero).toHaveClass('hero--lg');
      expect(hero).toHaveClass('extra-class');
    });

    it('debe mantener clases base incluso sin props opcionales', () => {
      render(<Hero imageUrl="/test-image.jpg" />);
      const hero = screen.getByRole('img');
      expect(hero).toHaveClass('hero');
      expect(hero).toHaveClass('hero--md'); // default height
    });
  });
});
