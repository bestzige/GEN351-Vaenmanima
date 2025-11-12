import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const PREORDER_CLOSED = true;

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const fireAndForget = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch {}
};

export const getErrorMessage = (
  error: unknown,
  defaultMessage = 'Unknown error'
): string => {
  if (error instanceof Error) return error.message;
  return defaultMessage;
};
