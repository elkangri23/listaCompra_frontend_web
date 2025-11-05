// Shared utility functions
import { v4 as uuidv4 } from 'uuid';

export function generateUUID(): string {
  return uuidv4();
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
