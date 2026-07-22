import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, FileText, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/proprietario/frota/novo")({
  head: () => ({ meta: [{ title: "Cadastrar carro — TCHI LÉVA" }] }),
  component: Novo,
});

type Passo = 1 | 2 | 3 | 4;

function Novo() {
  const navigate = useNavigate();
  const criarVeiculo = useProprietario((s) => s.criarVeiculo);
  const [passo, setPasso] = useState<Passo>(1);
  const [form, setForm] = useState({
    marca: "", modelo: "", ano: 2024, placa: "", cor: "", combustivel: "Flex",
    chassi: "", renavam: "", km: 0, cidade: "São Paulo",
    diaria: 120, mensal: 2600, caucao: 1500,
    seguro: true, observacoes: "",
    fotos: [] as string[], docs: [] as string[],
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  function submit() {
    if (!form.marca || !form.modelo || !form.placa) {
      toast.error("Preencha marca, modelo e placa");
      setPasso(1);
      return;
    }
    const id = criarVeiculo({
      marca: form.marca, modelo: form.modelo, ano: form.ano, placa: form.placa,
      diaria: form.diaria, mensal: form.mensal, caucao: form.caucao,
      km: form.km, cidade: form.cidade, seguro: form.seguro,
      proprietario: "Você",
      status: "disponivel",
      foto: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop",
    });
    toast.success("Passaporte digital criado ✨");
    navigate({ to: "/proprietario/frota/$carroId", params: { carroId: id } });
  }

  return (
    <div className="mx-auto min-h-screen max-w-screen-sm bg-background px-5 py-5">
      <Link to="/proprietario/frota" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mt-4 font-street text-2xl font-black uppercase">Cadastrar carro</h1>
      <p className="text-sm text-muted-foreground">Passo {passo} de 4</p>

      <Stepper passo={passo} />

      <div className="mt-6 space-y-5">
        {passo === 1 && (
          <Bloco titulo="Dados básicos">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marca" value={form.marca} onChange={(v) => set("marca", v)} placeholder="Chevrolet" />
              <Field label="Modelo" value={form.modelo} onChange={(v) => set("modelo", v)} placeholder="Onix" />
              <Field label="Ano" type="number" value={String(form.ano)} onChange={(v) => set("ano", +v)} />
              <Field label="Cor" value={form.cor} onChange={(v) => set("cor", v)} placeholder="Preto" />
              <Field label="Placa" value={form.placa} onChange={(v) => set("placa", v.toUpperCase())} placeholder="ABC-1D23" />
              <Field label="Combustível" value={form.combustivel} onChange={(v) => set("combustivel", v)} />
              <Field label="Chassi" value={form.chassi} onChange={(v) => set("chassi", v)} placeholder="9BW..." />
              <Field label="Renavam" value={form.renavam} onChange={(v) => set("renavam", v)} />
              <Field label="KM atual" type="number" value={String(form.km)} onChange={(v) => set("km", +v)} />
              <Field label="Cidade" value={form.cidade} onChange={(v) => set("cidade", v)} />
              <Field label="Diária (R$)" type="number" value={String(form.diaria)} onChange={(v) => set("diaria", +v)} />
              <Field label="Mensal (R$)" type="number" value={String(form.mensal)} onChange={(v) => set("mensal", +v)} />
              <Field label="Caução (R$)" type="number" value={String(form.caucao)} onChange={(v) => set("caucao", +v)} />
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input id="seg" type="checkbox" checked={form.seguro} onChange={(e) => set("seguro", e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="seg" className="text-xs">Veículo com seguro ativo</Label>
              </div>
            </div>
          </Bloco>
        )}

        {passo === 2 && (
          <Bloco titulo="Documentação">
            <p className="mb-3 text-xs text-muted-foreground">Envie os documentos (preview local — sem upload real).</p>
            <div className="grid grid-cols-2 gap-2">
              {["CRLV", "Seguro", "Licenciamento", "IPVA", "Manual", "Nota fiscal"].map((n) => (
                <UploadBox key={n} label={n} icon="file" />
              ))}
            </div>
          </Bloco>
        )}

        {passo === 3 && (
          <Bloco titulo="Fotos do veículo">
            <p className="mb-3 text-xs text-muted-foreground">Fotos ajudam o motorista a decidir mais rápido.</p>
            <div className="grid grid-cols-2 gap-2">
              {["Frente", "Traseira", "Lateral esq.", "Lateral dir.", "Interior", "Painel"].map((n) => (
                <UploadBox key={n} label={n} icon="camera" />
              ))}
            </div>
          </Bloco>
        )}

        {passo === 4 && (
          <Bloco titulo="Revisão">
            <div className="space-y-2 text-sm">
              <Row k="Veículo" v={`${form.marca || "—"} ${form.modelo || ""}`} />
              <Row k="Ano / Placa" v={`${form.ano} · ${form.placa || "—"}`} />
              <Row k="Cidade" v={form.cidade} />
              <Row k="KM" v={form.km.toLocaleString("pt-BR")} />
              <Row k="Diária / Mensal" v={`R$ ${form.diaria} · R$ ${form.mensal}`} />
              <Row k="Caução" v={`R$ ${form.caucao}`} />
              <Row k="Seguro" v={form.seguro ? "Ativo" : "Sem seguro"} />
            </div>
            <div className="mt-3 space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} placeholder="Ex: revisão em dia, IPVA pago..." />
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 text-xs">
              Ao salvar, criaremos automaticamente o <b>Passaporte Digital</b> do veículo com Linha do tempo, Agenda, Plano de manutenção e status <b>Disponível</b>.
            </div>
          </Bloco>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {passo > 1 && (
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPasso((p) => (p - 1) as Passo)}>
            Voltar
          </Button>
        )}
        {passo < 4 && (
          <Button className="flex-1 rounded-xl gradient-primary text-primary-foreground shadow-glow" onClick={() => setPasso((p) => (p + 1) as Passo)}>
            Continuar
          </Button>
        )}
        {passo === 4 && (
          <Button className="flex-1 rounded-xl gradient-primary text-primary-foreground shadow-glow" onClick={submit}>
            <Check className="mr-2 h-4 w-4" /> Criar passaporte
          </Button>
        )}
      </div>
    </div>
  );
}

function Stepper({ passo }: { passo: Passo }) {
  const labels = ["Básico", "Docs", "Fotos", "Revisão"];
  return (
    <div className="mt-4 flex items-center gap-1">
      {labels.map((l, i) => {
        const n = (i + 1) as Passo;
        const ativo = n === passo;
        const feito = n < passo;
        return (
          <div key={l} className="flex flex-1 items-center gap-1">
            <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
              feito ? "bg-success text-success-foreground" :
              ativo ? "bg-primary text-primary-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {feito ? "✓" : n}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`truncate text-[10px] font-semibold uppercase ${ativo ? "text-foreground" : "text-muted-foreground"}`}>{l}</div>
              <div className={`h-0.5 w-full rounded ${feito ? "bg-success" : ativo ? "bg-primary" : "bg-muted"}`} />
            </div>
          </div>
        );
      })}
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

function Field({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-1 text-xs last:border-b-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

function UploadBox({ label, icon }: { label: string; icon: "camera" | "file" }) {
  const Icon = icon === "camera" ? Camera : FileText;
  const [feito, setFeito] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { setFeito(true); toast(`${label} adicionado (mock)`); }}
      className={`flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary/50 hover:text-primary ${
        feito ? "border-success bg-success/5 text-success" : "border-border bg-background"
      }`}
    >
      {feito ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  );
}
