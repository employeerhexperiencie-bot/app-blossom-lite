import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useConect, checkinCompleto, checkinValido } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOTORISTA_LOGADO_ID } from "@/lib/mock-proprietario";
import { useCarro, useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/motorista/checkin")({
  head: () => ({ meta: [{ title: "Check-in diário — Motorista | TCHI LÉVA" }] }),
  component: Checkin,
});

const passos = [
  { key: "selfie" as const, titulo: "Selfie facial", desc: "Confirma que é você ao volante" },
  { key: "fotoFrontal" as const, titulo: "Foto frontal do carro", desc: "Para conferir lataria" },
  { key: "fotoTraseira" as const, titulo: "Foto traseira do carro", desc: "Inclua a placa" },
  { key: "fotoInterna" as const, titulo: "Foto interna", desc: "Banco e painel" },
];

function Checkin() {
  const navigate = useNavigate();
  const checkin = useConect((s) => s.checkin);
  const iniciar = useConect((s) => s.iniciarCheckin);
  const marcar = useConect((s) => s.marcarFoto);
  const finalizarCheckin = useConect((s) => s.finalizarCheckin);
  // Com carro alugado pelo app, o km do painel informado no check-in atualiza o Passaporte do carro do dono.
  const contratoAtivo = useProprietario((s) =>
    s.contratos.find((c) => c.motoristaId === MOTORISTA_LOGADO_ID && c.status === "ativo"),
  );
  const carroAlugado = useCarro(contratoAtivo?.carroId);
  const atualizarKm = useProprietario((s) => s.atualizarKm);
  const [km, setKm] = useState("");
  const kmNumero = Number(km);
  const kmInvalido =
    !!km && (!Number.isFinite(kmNumero) || (!!carroAlugado && kmNumero < carroAlugado.km));
  function finalizar() {
    if (carroAlugado && km && !kmInvalido && kmNumero > carroAlugado.km) {
      atualizarKm(carroAlugado.id, kmNumero, "foto");
    }
    finalizarCheckin();
  }

  useEffect(() => {
    iniciar();
  }, [iniciar]);

  const completo = checkinCompleto(checkin);
  const valido = checkinValido(checkin);

  useEffect(() => {
    if (valido) {
      const t = setTimeout(() => navigate({ to: "/motorista" }), 1200);
      return () => clearTimeout(t);
    }
  }, [valido, navigate]);

  return (
    <>
      <PageSection>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">Check-in do dia</h1>
              <p className="text-xs text-muted-foreground">
                Obrigatório para receber corridas hoje.
              </p>
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-0">
        <div className="flex flex-col gap-2.5">
          {passos.map((p) => {
            const feito = checkin?.[p.key] === true;
            return (
              <button
                key={p.key}
                onClick={() => marcar(p.key)}
                disabled={feito || checkin?.iaStatus === "analisando" || valido}
                className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-4 text-left shadow-card transition-all ${
                  feito
                    ? "border-success/40 bg-success/5"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl ${feito ? "bg-success/15 text-success" : "bg-accent text-accent-foreground"}`}
                >
                  {feito ? <CheckCircle2 className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{p.titulo}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
                <span
                  className={`text-xs font-semibold ${feito ? "text-success" : "text-primary"}`}
                >
                  {feito ? "Pronto" : "Tirar"}
                </span>
              </button>
            );
          })}
        </div>
      </PageSection>

      <PageSection className="pt-0">
        {checkin?.iaStatus === "analisando" && (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="text-sm">
              <div className="font-semibold">Validando com IA…</div>
              <div className="text-xs text-muted-foreground">
                Verificando limpeza, danos e consistência.
              </div>
            </div>
          </div>
        )}
        {valido && (
          <div className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success/10 p-4">
            <Sparkles className="h-5 w-5 text-success" />
            <div className="text-sm">
              <div className="font-semibold text-success">Aprovado! Liberado para rodar.</div>
              <div className="text-xs text-muted-foreground">Redirecionando…</div>
            </div>
          </div>
        )}
        {checkin?.iaStatus === "pendente" && carroAlugado && (
          <div className="mb-3 rounded-2xl border border-border bg-card p-3">
            <Label className="text-xs">
              Km no painel do {carroAlugado.marca} {carroAlugado.modelo}
            </Label>
            <Input
              className="mt-1"
              type="number"
              inputMode="numeric"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder={`Último registrado: ${carroAlugado.km.toLocaleString("pt-BR")} km`}
            />
            {kmInvalido ? (
              <p className="mt-1 text-[11px] text-destructive">
                O km não pode ser menor que o último registrado.
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Vai para o proprietário e mantém a manutenção do carro em dia.
              </p>
            )}
          </div>
        )}
        {checkin?.iaStatus === "pendente" && (
          <Button
            onClick={finalizar}
            disabled={!completo || kmInvalido}
            size="lg"
            className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
          >
            {completo ? "Enviar para validação" : "Complete as 4 fotos"}
          </Button>
        )}
      </PageSection>
    </>
  );
}
