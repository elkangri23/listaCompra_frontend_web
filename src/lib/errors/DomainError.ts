// Domain errors
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}

export class InvalidValueError extends DomainError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message);
    this.name = 'InvalidValueError';
    this.field = field;
    this.value = value;
  }
}
