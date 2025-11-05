// Shared utility functions
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback RFC4122 v4-like generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function isValidName(name: string): boolean {
  return name.length > 0 && name.length <= 100;
}

export function sanitizeString(str: string): string {
  return str.trim();
}

export function createDate(): Date {
  return new Date();
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && password.length <= 100;
}

type ClassValue = string | false | null | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const processValue = (value: ClassValue): void => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(processValue);
    } else {
      classes.push(value);
    }
  };

  inputs.forEach(processValue);

  return classes.join(' ');
}
