# Diretrizes de TypeScript - Projeto Imobiliária

## Regras de Tipagem Obrigatórias

### ❌ PROIBIDO: Uso de `any`

```typescript
// ❌ NUNCA faça isso
const dados: any = response.data;
const lista: any[] = [];
function processar(param: any): any { }
```

```typescript
// ✅ SEMPRE faça isso
interface DadosResponse {
  id: string;
  nome: string;
  valor: number;
}

const dados: DadosResponse = response.data;
const lista: DadosResponse[] = [];
function processar(param: DadosResponse): DadosResponse { }
```

### ✅ Boas Práticas Implementadas

1. **Interfaces Específicas**: Sempre criar interfaces para objetos complexos
2. **Tipagem de APIs**: Usar generics no axios para tipar respostas
3. **ESLint Rigoroso**: Regra `@typescript-eslint/no-explicit-any` configurada como `error`
4. **TypeScript Strict**: Configurações rigorosas no `tsconfig.json`

### 🔧 Configurações Ativas

#### ESLint (`eslint.config.js`)
```javascript
"@typescript-eslint/no-explicit-any": "error"
```

#### TypeScript (`tsconfig.json`)
```json
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noImplicitThis": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "exactOptionalPropertyTypes": true
}
```

### 📝 Exemplos de Interfaces Criadas

```typescript
// Histórico de imóveis
export interface HistoricoImovel {
  _id: string;
  imovelId: string;
  acao: string;
  dataAcao: string;
  usuario: string;
  detalhes: {
    statusAnterior?: string;
    statusNovo?: string;
    valorVenda?: number;
    nomeComprador?: string;
    cpfComprador?: string;
    motivo?: string;
    observacoes?: string;
  };
}

// Estatísticas de vendas
export interface EstatisticasVendas {
  totalVendas: number;
  valorTotalVendas: number;
  valorMedioVenda: number;
}

// Lista paginada de imóveis vendidos
export interface ListaImoveisVendidos {
  imoveis: Imovel[];
  total: number;
  pagina: number;
  totalPaginas: number;
  estatisticas: EstatisticasVendas;
}
```

### 🚨 Como Evitar Erros

1. **Sempre definir interfaces** antes de implementar funções
2. **Usar generics** em chamadas de API: `api.get<TipoEsperado>(url)`
3. **Verificar tipos** com o ESLint antes de fazer commit
4. **Documentar interfaces** complexas com comentários

### 🔍 Verificação

Para verificar se há usos de `any` no projeto:
```bash
npm run lint
```

O build falhará se houver qualquer uso de `any` no código.

---

**Lembre-se**: TypeScript forte = menos bugs em produção! 🛡️