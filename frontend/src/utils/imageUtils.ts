// Utilitário para construir URLs de imagens

// Obter a URL base da API (sem o /api no final)
const getBaseURL = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove /api do final se existir
  return apiUrl.replace(/\/api$/, '');
};

/**
 * Constrói a URL completa para uma imagem
 * @param imagePath - Caminho da imagem armazenado no banco (ex: 'uploads/imoveis/imagem.jpg')
 * @returns URL completa da imagem
 */
export const buildImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '/placeholder-imovel.svg';
  }
  
  // Se já é uma URL completa, retorna como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Se é um placeholder local, retorna como está
  if (imagePath.startsWith('/') && !imagePath.startsWith('/uploads')) {
    return imagePath;
  }
  
  const baseUrl = getBaseURL();
  
  // Remove barra inicial se existir para evitar duplicação
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Constrói URLs para um array de imagens
 * @param imagePaths - Array de caminhos de imagens
 * @returns Array de URLs completas
 */
export const buildImageUrls = (imagePaths: string[] | undefined): string[] => {
  if (!imagePaths || imagePaths.length === 0) {
    return ['/placeholder-imovel.svg'];
  }
  
  return imagePaths.map(path => buildImageUrl(path));
};