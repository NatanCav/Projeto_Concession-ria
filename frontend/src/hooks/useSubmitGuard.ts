import { useRef } from "react";

/**
 * Evita envio duplicado quando o usuário clica duas vezes rápido no botão de
 * salvar: o estado `isSubmitting` do React Hook Form só reflete no DOM depois
 * de um re-render, e um duplo clique pode dispositar as duas chamadas antes
 * disso acontecer. Este guard bloqueia reentrância de forma síncrona via ref.
 */
export function useSubmitGuard<Args extends unknown[]>(fn: (...args: Args) => Promise<void>) {
  const isSubmittingRef = useRef(false);

  return async (...args: Args) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      await fn(...args);
    } finally {
      isSubmittingRef.current = false;
    }
  };
}
