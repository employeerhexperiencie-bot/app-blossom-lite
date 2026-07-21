import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { carros, motoristas } from "@/lib/mock-data";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/contratos/novo")({
  head: () => ({ meta: [{ title: "Novo contrato — TCHI LÉVA" }] }),
  component: NovoContrato,
});

function NovoContrato() {
  const navigate = useNavigate();
  const criar = useProprietario((s) => s.criarContrato);
  const [motoristaId, setMotoristaId] = useState(motoristas[0].id);
  const [carroId, setCarroId] = useState(carros.find((c) => c.status === "disponivel")?.id ?? carros[0].id);
  const [valor, setValor] = useState(120);
  const [periodicidade, setPeriodicidade] = useState<"diaria" | "semanal" | "mensal">("diaria");
  const [caucao, setCaucao] = useState(1500);
  const [inicio, setInicio] = useState(new Date().toISOString().slice(0, 10));
  const [observacoes, setObservacoes] = useState("");

  const carrosDisp = carros.filter((c) => c.status !== "manutencao");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const m = motoristas.find((x) => x.id === motoristaId)!;
    const id = criar({
      carroId, motoristaId, motoristaNome: m.nome,
      valor, periodicidade, caucao, inicio, observacoes,
    });
    toast.success("Contrato criado");
    navigate({ to: "/proprietario/contratos/$id", params: { id } });
  }

  return (
    <PageSection>
      <Link to="/proprietario/contratos" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Contratos
      </Link>
      <h1 className="mt-3 font-street text-2xl font-black uppercase">Novo contrato</h1>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div className="space-y-1.5">
          <Label>Motorista</Label>
          <select value={motoristaId} onChange={(e) => setMotoristaId(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
            {motoristas.map((m) => <option key={m.id} value={m.id}>{m.nome} · ⭐ {m.avaliacao}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label>Veículo</Label>
          <select value={carroId} onChange={(e) => setCarroId(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
            {carrosDisp.map((c) => <option key={c.id} value={c.id}>{c.marca} {c.modelo} · {c.placa}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input type="number" value={valor} onChange={(e) => setValor(+e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Periodicidade</Label>
            <select value={periodicidade} onChange={(e) => setPeriodicidade(e.target.value as "diaria" | "semanal" | "mensal")} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
              <option value="diaria">Diária</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Caução (R$)</Label>
            <Input type="number" value={caucao} onChange={(e) => setCaucao(+e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Início</Label>
            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Regras, restrições, combinados..." />
        </div>

        <Button type="submit" size="lg" className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          Criar contrato
        </Button>
      </form>
    </PageSection>
  );
}
