import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/proprietario/frota/novo")({
  head: () => ({ meta: [{ title: "Cadastrar carro — TCHI LÉVA" }] }),
  component: Novo,
});

function Novo() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto min-h-screen max-w-screen-sm bg-background px-5 py-5">
      <Link to="/proprietario" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold">Cadastrar carro</h1>
      <p className="text-sm text-muted-foreground">Preencha os dados do veículo.</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => { e.preventDefault(); toast.success("Carro cadastrado (mock)"); navigate({ to: "/proprietario" }); }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Marca" placeholder="Chevrolet" />
          <Field label="Modelo" placeholder="Onix" />
          <Field label="Ano" placeholder="2023" type="number" />
          <Field label="Placa" placeholder="ABC-1D23" />
          <Field label="Diária (R$)" placeholder="120" type="number" />
          <Field label="Mensal (R$)" placeholder="2600" type="number" />
          <Field label="Caução (R$)" placeholder="1500" type="number" />
          <Field label="KM" placeholder="20000" type="number" />
        </div>
        <Field label="Cidade" placeholder="São Paulo" />
        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea rows={3} placeholder="Ex: revisão em dia, IPVA pago..." />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          Cadastrar
        </Button>
      </form>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input {...rest} />
    </div>
  );
}
