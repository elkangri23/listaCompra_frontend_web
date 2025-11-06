// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Matchers mínimos inspirados en jest-dom para evitar dependencias externas
expect.extend({
  toBeInTheDocument(received) {
    const pass = received instanceof Element || received instanceof SVGElement
    return {
      pass,
      message: () => (pass ? 'Elemento encontrado en el documento.' : 'Elemento esperado no está en el documento.'),
    }
  },
  toHaveClass(received, expected) {
    if (!(received instanceof Element)) {
      return {
        pass: false,
        message: () => 'toHaveClass solo acepta nodos del DOM.',
      }
    }
    const pass = expected
      .split(/\s+/)
      .filter(Boolean)
      .every((className) => received.classList.contains(className))

    return {
      pass,
      message: () =>
        pass
          ? `El elemento contiene la clase "${expected}".`
          : `Se esperaba que el elemento contuviera la clase "${expected}". Clases actuales: ${received.className}.`,
    }
  },
  toBeDisabled(received) {
    if (!(received instanceof Element)) {
      return {
        pass: false,
        message: () => 'toBeDisabled solo acepta nodos del DOM.',
      }
    }
    const pass = received.hasAttribute('disabled') || received.getAttribute('aria-disabled') === 'true'
    return {
      pass,
      message: () => (pass ? 'El elemento está deshabilitado.' : 'Se esperaba que el elemento estuviera deshabilitado.'),
    }
  },
})

if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
