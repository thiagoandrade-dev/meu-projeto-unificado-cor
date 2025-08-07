
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";

interface PropertySearchProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

const PropertySearch = ({ className = "", variant = "horizontal" }: PropertySearchProps) => {
  const [operacao, setOperacao] = useState<string>("Todos");
  const [tipo, setTipo] = useState<string>("Todos");
  const [localizacao, setLocalizacao] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ operacao, tipo, localizacao });
    // Adicionar lógica de busca ou redirecionamento aqui
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`bg-white rounded-lg shadow-lg p-6 ${
        variant === "vertical" ? "flex flex-col space-y-4" : "grid grid-cols-1 md:grid-cols-4 gap-4"
      } ${className}`}
    >
      {/* Tipo de Operação */}
      <div>
        <Label htmlFor="operacao" className="mb-1.5 block text-gray-700 font-medium">
          Operação
        </Label>
        <Select onValueChange={setOperacao} defaultValue="Todos">
          <SelectTrigger id="operacao" className="w-full">
            <SelectValue placeholder="Selecione a operação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Venda">Comprar</SelectItem>
            <SelectItem value="Aluguel">Alugar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Tipo de Imóvel */}
      <div>
        <Label htmlFor="tipo" className="mb-1.5 block text-gray-700 font-medium">
          Tipo de Imóvel
        </Label>
        <Select onValueChange={setTipo} defaultValue="Todos">
          <SelectTrigger id="tipo" className="w-full">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Apartamento">Apartamento</SelectItem>
            <SelectItem value="Casa">Casa</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Terreno">Terreno</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Localização */}
      <div>
        <Label htmlFor="localizacao" className="mb-1.5 block text-gray-700 font-medium">
          Localização
        </Label>
        <div className="relative">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            id="localizacao"
            placeholder="Bairro, cidade ou região"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Botão de Busca */}
      <div className={variant === "vertical" ? "" : "flex items-end"}>
        <Button 
          type="submit" 
          className="w-full bg-imobiliaria-azul hover:bg-imobiliaria-azul/90 text-white"
        >
          <Search size={18} className="mr-2" />
          Buscar Imóveis
        </Button>
      </div>
    </form>
  );
};

export default PropertySearch;
