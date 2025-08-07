/**
 * Utilitários para exportação de dados em formato CSV
 */

/**
 * Escapa valores para formato CSV adequado
 * @param value - Valor a ser escapado
 * @returns String escapada para CSV
 */
export const escapeCsvValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Se contém ponto e vírgula, vírgula, quebra de linha ou aspas, precisa ser envolvido em aspas
  if (stringValue.includes(';') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Escapar aspas duplicando-as
    const escapedValue = stringValue.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }
  
  return stringValue;
};

/**
 * Converte array de dados para formato CSV
 * @param headers - Cabeçalhos das colunas
 * @param data - Array de arrays com os dados
 * @returns String no formato CSV
 */
export const arrayToCsv = (headers: string[], data: (string | number | null | undefined)[][]): string => {
  // Usar ponto e vírgula como separador para melhor compatibilidade com Excel brasileiro
  const separator = ';';
  const csvHeaders = headers.map(header => escapeCsvValue(header)).join(separator);
  const csvRows = data.map(row => 
    row.map(cell => escapeCsvValue(cell)).join(separator)
  );
  
  return [csvHeaders, ...csvRows].join('\r\n');
};

/**
 * Baixa dados como arquivo CSV
 * @param csvContent - Conteúdo CSV
 * @param filename - Nome do arquivo
 */
export const downloadCsv = (csvContent: string, filename: string): void => {
  // Adicionar BOM para UTF-8 (para melhor compatibilidade com Excel)
  const BOM = '\uFEFF';
  const csvContentWithBOM = BOM + csvContent;
  
  // Garantir que o arquivo tenha extensão .csv
  const csvFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  
  // Criar blob com tipo MIME específico para CSV
  const blob = new Blob([csvContentWithBOM], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', csvFilename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpar URL do objeto
  URL.revokeObjectURL(url);
};

/**
 * Exporta dados diretamente para CSV
 * @param headers - Cabeçalhos das colunas
 * @param data - Array de arrays com os dados
 * @param filename - Nome do arquivo
 */
export const exportToCsv = (
  headers: string[], 
  data: (string | number | null | undefined)[][], 
  filename: string
): void => {
  const csvContent = arrayToCsv(headers, data);
  downloadCsv(csvContent, filename);
};