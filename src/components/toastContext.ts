import { createContext, useContext } from 'react';

export interface ToastApi {
  message: string | null;
  show: (msg: string) => void;
}

export const ToastContext = createContext<ToastApi>({ message: null, show: () => undefined });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
