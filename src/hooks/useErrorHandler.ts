import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown, fallbackMessage: string) => {
    const message = error instanceof Error ? error.message : fallbackMessage;
    toast.error(message);
    console.error(error);
  }, []);

  return { handleError };
}
