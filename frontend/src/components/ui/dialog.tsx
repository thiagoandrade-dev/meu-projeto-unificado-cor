import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  
  React.useEffect(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      console.log('🔍 DialogOverlay montado:', {
        element: overlay,
        zIndex: getComputedStyle(overlay).zIndex,
        pointerEvents: getComputedStyle(overlay).pointerEvents,
        display: getComputedStyle(overlay).display,
        visibility: getComputedStyle(overlay).visibility
      });
      
      // Verificar se o overlay ainda existe após 10 segundos E se o diálogo está fechado
      const checkTimeout = setTimeout(() => {
        if (document.contains(overlay)) {
          const styles = getComputedStyle(overlay);
          const dataState = overlay.getAttribute('data-state');
          
          console.log('⚠️ DialogOverlay ainda existe após 10s:', {
            element: overlay,
            dataState: dataState,
            zIndex: styles.zIndex,
            pointerEvents: styles.pointerEvents,
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity
          });
          
          // APENAS remover se o diálogo estiver fechado (data-state="closed") ou invisível
          // E se ainda estiver bloqueando cliques
          if ((dataState === 'closed' || styles.opacity === '0' || styles.visibility === 'hidden') &&
              styles.pointerEvents !== 'none' && styles.display !== 'none') {
            console.log('🧹 Removendo overlay de diálogo fechado');
            // Verificar se o elemento ainda tem um pai antes de remover
            if (overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
            }
          } else if (dataState === 'open') {
            console.log('✅ Overlay pertence a diálogo ativo, mantendo');
          }
        }
      }, 10000);
      
      return () => {
        clearTimeout(checkTimeout);
        console.log('🔍 DialogOverlay desmontado');
      };
    }
    return undefined;
  }, []);
  
  return (
    <DialogPrimitive.Overlay
      ref={(node) => {
        if (overlayRef.current !== node) {
          overlayRef.current = node;
        }
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref && 'current' in ref) {
          // Verificar se o ref é mutável antes de tentar atribuir
          const descriptor = Object.getOwnPropertyDescriptor(ref, 'current');
          if (descriptor && descriptor.set) {
            // Ref tem setter, é seguro atribuir
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
          // Se não tem setter, é readonly - não fazer nada
        }
      }}
      className={cn(
        "fixed inset-0 z-[45] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
