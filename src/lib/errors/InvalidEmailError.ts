export class InvalidEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEmailError';
  }

  static create(message: string): InvalidEmailError {
    return new InvalidEmailError(message);
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }

  static create(message: string): InvalidPasswordError {
    return new InvalidPasswordError(message);
  }

  static emptyPassword(): InvalidPasswordError {
    return new InvalidPasswordError('La contraseña no puede estar vacía');
  }

  static weakPassword(): InvalidPasswordError {
    return new InvalidPasswordError('La contraseña es demasiado débil (mínimo 8 caracteres)');
  }

  static tooLong(): InvalidPasswordError {
    return new InvalidPasswordError('La contraseña es demasiado larga (máximo 100 caracteres)');
  }
}
