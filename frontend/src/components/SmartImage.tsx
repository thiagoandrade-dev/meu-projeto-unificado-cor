import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageData {
  original: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  webp?: string;
  orientation?: 'landscape' | 'portrait' | 'square' | 'unknown';
  dimensions?: {
    width?: number;
    height?: number;
  };
}

interface SmartImageProps {
  src: string | ImageData;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  size?: 'thumbnail' | 'medium' | 'large' | 'original';
  preferWebP?: boolean;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'auto',
  size = 'medium',
  preferWebP = true,
  lazy = true,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    orientation: 'landscape' | 'portrait' | 'square';
  } | null>(null);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Função para obter a URL da imagem baseada no tamanho e preferências
  const getImageSrc = useCallback((): string => {
    if (typeof src === 'string') {
      return src;
    }

    const imageData = src as ImageData;
    
    // Se preferir WebP e estiver disponível
    if (preferWebP && imageData.webp) {
      return imageData.webp;
    }
    
    // Selecionar tamanho baseado na preferência
    switch (size) {
      case 'thumbnail':
        return imageData.thumbnail || imageData.medium || imageData.original || '';
      case 'medium':
        return imageData.medium || imageData.large || imageData.original || '';
      case 'large':
        return imageData.large || imageData.original || '';
      case 'original':
      default:
        return imageData.original || imageData.large || imageData.medium || '';
    }
  }, [src, size, preferWebP]);

  // Detectar orientação da imagem
  const getOrientation = (): 'landscape' | 'portrait' | 'square' => {
    if (typeof src !== 'string' && src.orientation) {
      return src.orientation === 'unknown' ? 'landscape' : src.orientation;
    }
    return dimensions?.orientation || 'landscape';
  };

  // Efeito para carregar a imagem
  useEffect(() => {
    if (!isInView) return;
    
    const imageUrl = getImageSrc();
    
    if (!imageUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(imageUrl);
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const orientation = width > height ? 'landscape' : width < height ? 'portrait' : 'square';
      setDimensions({
        width,
        height,
        orientation
      });
      setIsLoading(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      onError?.();
    };
    
    img.src = imageUrl;
  }, [src, size, preferWebP, isInView, onLoad, onError, getImageSrc]);

  // Determinar classes CSS baseadas na orientação e aspect ratio
  const getContainerClasses = () => {
    const baseClasses = 'relative overflow-hidden image-container';
    
    // Aspect ratios específicos
    switch (aspectRatio) {
      case 'square':
        return cn(baseClasses, 'aspect-square');
      case 'landscape':
        return cn(baseClasses, 'aspect-[4/3]');
      case 'portrait':
        return cn(baseClasses, 'aspect-[3/4]');
      case 'auto':
      default:
        break;
    }

    // Auto aspect ratio baseado na orientação detectada
    const orientation = getOrientation();
    switch (orientation) {
      case 'landscape':
        return cn(baseClasses, 'aspect-[4/3]');
      case 'portrait':
        return cn(baseClasses, 'aspect-[3/4]');
      case 'square':
        return cn(baseClasses, 'aspect-square');
      default:
        return cn(baseClasses, 'aspect-square');
    }
  };

  const getImageClasses = () => {
    const baseClasses = 'w-full h-full transition-all duration-300 image-adaptive';
    const orientation = getOrientation();
    
    // Para imagens landscape em containers portrait, usar contain para evitar cortes
    if (orientation === 'landscape' && aspectRatio === 'portrait') {
      return cn(baseClasses, 'object-contain');
    }
    // Para imagens portrait em containers landscape, usar contain para evitar cortes
    if (orientation === 'portrait' && aspectRatio === 'landscape') {
      return cn(baseClasses, 'object-contain');
    }
    
    return cn(baseClasses, 'object-cover');
  };

  return (
    <div ref={containerRef} className={cn(getContainerClasses(), containerClassName)}>
      {!isInView && lazy && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-sm">📷</div>
        </div>
      )}
      
      {isInView && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Carregando...</div>
        </div>
      )}
      
      {isInView && hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Imagem não encontrada</div>
          </div>
        </div>
      )}
      
      {isInView && !isLoading && !hasError && imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(getImageClasses(), className)}
          onLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
            onError?.();
          }}
        />
      )}
    </div>
  );
};

export default SmartImage;