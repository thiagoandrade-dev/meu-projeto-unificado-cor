import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ToastErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 Toast Error Boundary capturou erro:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Toast Error Boundary - Detalhes do erro:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    // Tentar limpar elementos toast órfãos quando há erro
    setTimeout(() => {
      try {
        const toastElements = document.querySelectorAll([
          '[data-radix-toast-viewport]',
          '[data-radix-toast]', 
          '[data-radix-toast-focus-proxy]',
          '.toast'
        ].join(', '));
        
        console.log('🧹 Limpando elementos toast após erro:', toastElements.length);
        
        toastElements.forEach((element) => {
          try {
            if (element.parentNode) {
              element.parentNode.removeChild(element);
            }
          } catch (cleanupError) {
            console.warn('⚠️ Erro na limpeza de toast:', cleanupError);
          }
        });
      } catch (cleanupError) {
        console.warn('⚠️ Erro geral na limpeza de toasts:', cleanupError);
      }
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      console.log('🔄 Toast Error Boundary renderizando fallback');
      
      // Tentar resetar o erro após um tempo
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 2000);
      
      // Renderizar um fallback mínimo ou nada
      return (
        <div 
          style={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            background: '#ef4444', 
            color: 'white', 
            padding: '8px 12px', 
            borderRadius: '6px',
            fontSize: '14px',
            zIndex: 9999,
            maxWidth: '300px'
          }}
        >
          Sistema de notificações temporariamente indisponível
        </div>
      );
    }

    return this.props.children;
  }
}

export default ToastErrorBoundary;