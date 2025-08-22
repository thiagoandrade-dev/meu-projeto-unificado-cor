import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  console.log('🍞 Toaster renderizado com', toasts.length, 'toasts ativos');
  console.log('🍞 Toasts detalhados:', toasts.map(t => ({ id: t.id, open: t.open, title: t.title })));
  
  // Filtrar toasts válidos para evitar erros de renderização
  const validToasts = toasts.filter(toast => {
    return toast && 
           toast.id && 
           typeof toast.id === 'string' && 
           toast.id.length > 0 &&
           toast.open !== false; // Só renderizar toasts que estão abertos
  });
  
  console.log('🍞 Toasts válidos para renderização:', validToasts.length);
  
  return (
    <ToastProvider>
      {validToasts.map(function ({ id, title, description, action, ...props }) {
        console.log('🍞 Renderizando toast válido:', id, 'open:', props.open, 'title:', title);
        
        // Verificação adicional antes da renderização
        if (!id || typeof id !== 'string') {
          console.warn('🚨 Toast com ID inválido ignorado:', { id, title });
          return null;
        }
        
        return (
          <Toast key={`toast-${id}-${Date.now()}`} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
