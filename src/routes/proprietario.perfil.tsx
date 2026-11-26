import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ChevronRight, QrCode, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConect } from "@/lib/store";
import { useCarros, useProprietario } from "@/lib/store-proprietario";
import { chavePixValida } from "@/lib/pix";

export const Route = createFileRoute("/proprietario/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Proprietário TCHI LÉVA" }] }),
  component: Perfil,
});

function Perfil() {
  const { nomeUsuario, logout } = useConect();
  const navigate = useNavigate();
  const carros = useCarros();
  const nome = nomeUsuario || "Proprietário";
  return (
    <PageSection>
      <div className="flex items-center gap-4 rounded-3xl gradient-warm p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-glow">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-bold">{nome}</div>
          <div className="text-xs text-muted-foreground">
            Proprietário · {carros.length} {carros.length === 1 ? "carro" : "carros"}
          </div>
        </div>
      </div>

      <RecebimentoPix nomePadrao={nomeUsuario} />

      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        {["Dados da empresa", "Documentos"].map((t) => (
          <button
            key={t}
            onClick={() => toast("Disponível quando o cadastro for para o banco de dados")}
            className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left"
          >
            <span className="font-semibold">{t}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-6 w-full rounded-xl"
        onClick={() => {
          logout();
          navigate({ to: "/" });
        }}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
    </PageSection>
  );
}

function RecebimentoPix({ nomePadrao }: { nomePadrao: string }) {
  const recebimento = useProprietario((s) => s.recebimento);
  const salvar = useProprietario((s) => s.salvarRecebimento);
  const [nome, setNome] = useState(recebimento?.nome ?? nomePadrao);
  const [cidade, setCidade] = useState(recebimento?.cidade ?? "São Paulo");
  const [chave, setChave] = useState(recebimento?.chavePix ?? "");
  const [tentou, setTentou] = useState(false);

  const chaveOk = chavePixValida(chave);
  const nomeOk = nome.trim().length >= 3;

  function onSalvar(e: React.FormEvent) {
    e.preventDefault();
    setTentou(true);
    if (!chaveOk || !nomeOk) return;
    salvar({ nome: nome.trim(), cidade: cidade.trim() || "São Paulo", chavePix: chave.trim() });
    toast.success("Dados de recebimento salvos");
  }

  return (
    <form
      onSubmit={onSalvar}
      className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex items-center gap-2">
        <QrCode className="h-4 w-4 text-primary" />
        <h2 className="font-street text-sm font-black uppercase">Recebimento via Pix</h2>
        {recebimento && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
            <Check className="h-3 w-3" /> Ativo
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Usado para gerar o QR Code e o Pix copia e cola das cobranças de aluguel.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="pix-nome" className="text-xs">
          Nome do recebedor
        </Label>
        <Input
          id="pix-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como aparece no seu banco"
        />
        {tentou && !nomeOk && (
          <p className="text-[11px] text-destructive">Informe o nome do recebedor.</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pix-cidade" className="text-xs">
          Cidade
        </Label>
        <Input id="pix-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pix-chave" className="text-xs">
          Chave Pix
        </Label>
        <Input
          id="pix-chave"
          value={chave}
          onChange={(e) => setChave(e.target.value)}
          placeholder="CPF, CNPJ, e-mail, +55 celular ou chave aleatória"
        />
        {tentou && !chaveOk && (
          <p className="text-[11px] text-destructive">
            Chave Pix inválida. Celular no formato +5511999999999; CPF/CNPJ só números.
          </p>
        )}
      </div>
      <Button type="submit" className="w-full rounded-xl gradient-primary text-primary-foreground">
        Salvar dados de recebimento
      </Button>
    </form>
  );
}
