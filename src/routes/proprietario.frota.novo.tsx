import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, FileText } from "lucide-react";
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
      <Link to="/proprietario/frota" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mt-4 font-street text-2xl font-black uppercase">Cadastrar carro</h1>
      <p className="text-sm text-muted-foreground">Preencha os dados do veículo.</p>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => { e.preventDefault(); toast.success("Carro cadastrado (mock)"); navigate({ to: "/proprietario/frota" }); }}
      >
        <Bloco titulo="Identificação">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca" placeholder="Chevrolet" />
            <Field label="Modelo" placeholder="Onix" />
            <Field label="Ano" placeholder="2023" type="number" />
            <Field label="Cor" placeholder="Preto" />
            <Field label="Placa" placeholder="ABC-1D23" />
            <Field label="Combustível" placeholder="Flex" />
            <Field label="Chassi" placeholder="9BW..." />
            <Field label="Renavam" placeholder="00000000000" />
            <Field label="KM atual" placeholder="20000" type="number" />
            <Field label="Cidade" placeholder="São Paulo" />
          </div>
        </Bloco>

        <Bloco titulo="Valores">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Diária (R$)" placeholder="120" type="number" />
            <Field label="Mensal (R$)" placeholder="2600" type="number" />
            <Field label="Caução (R$)" placeholder="1500" type="number" />
          </div>
        </Bloco>

        <Bloco titulo="Fotos">
          <div className="grid grid-cols-2 gap-2">
            {["Frente", "Traseira", "Lateral esq.", "Lateral dir.", "Interior", "Painel"].map((n) => (
              <UploadBox key={n} label={n} icon="camera" />
            ))}
          </div>
        </Bloco>

        <Bloco titulo="Documentos">
          <div className="grid grid-cols-2 gap-2">
            {["CRLV", "Seguro", "Licenciamento", "IPVA", "Manual", "Nota fiscal"].map((n) => (
              <UploadBox key={n} label={n} icon="file" />
            ))}
          </div>
        </Bloco>

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

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-street text-xs font-black uppercase tracking-wider text-muted-foreground">{titulo}</h2>
      <div className="rounded-2xl border border-border bg-card p-3 shadow-card">{children}</div>
    </section>
  );
}

function Field({ label, ...rest }: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input {...rest} />
    </div>
  );
}

function UploadBox({ label, icon }: { label: string; icon: "camera" | "file" }) {
  const Icon = icon === "camera" ? Camera : FileText;
  return (
    <button
      type="button"
      onClick={() => toast("Preview local — sem upload real")}
      className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}
