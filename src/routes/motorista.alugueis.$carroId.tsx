import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Gauge,
  Calendar,
  MapPin,
  Clock,
  Check,
  X,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { carros } from "@/lib/mock-data";
import {
  fmtBRL,
  fmtData,
  MOTORISTA_LOGADO_ID,
  type Contrato,
  type Pagamento,
} from "@/lib/mock-proprietario";
import { useCarro, useProprietario, usePagamentosDoContrato } from "@/lib/store-proprietario";
import { PixCobranca } from "@/components/proprietario/PixCobranca";
import { useCandidatoMotorista } from "@/lib/motorista-perfil";
import { caucaoPorNivel } from "@/lib/cobrancas";
import { atendeRequisitos, descreverRequisitos } from "@/lib/requisitos";

export const Route = createFileRoute("/motorista/alugueis/$carroId")({
  loader: ({ params }) => {
    const c = carros.find((x) => x.id === params.carroId);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.marca} ${loaderData.modelo} — TCHI LÉVA` : "Carro" },
    ],
  }),
  component: CarroDetalhe,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Carro não encontrado.</div>
  ),
});

const periodicidadeLabel: Record<Contrato["periodicidade"], string> = {
  diaria: "por dia",
  semanal: "por semana",
  mensal: "por mês",
};

function CarroDetalhe() {
  const base = Route.useLoaderData();
  // Lê o carro pela store do proprietário, para refletir status e km atualizados por ele.
  const c = useCarro(base.id) ?? base;
  const candidato = useCandidatoMotorista();
  const anuncio = useProprietario((s) => s.anuncios[c.id]);
  // Condições do anúncio do dono; sem anúncio, os valores de referência do carro.
  const minhaCaucao = caucaoPorNivel(anuncio?.caucao ?? c.caucao, candidato.nivel);
  const elegibilidade = anuncio ? atendeRequisitos(anuncio, candidato) : { ok: true, motivos: [] };
  const enviarProposta = useProprietario((s) => s.enviarProposta);
  const aceitarContrato = useProprietario((s) => s.motoristaAceitarContrato);
  const recusarContrato = useProprietario((s) => s.motoristaRecusarContrato);
  const proposta = useProprietario((s) =>
    s.solicitacoes.find(
      (x) => x.carroId === c.id && x.motoristaId === MOTORISTA_LOGADO_ID && x.status === "pendente",
    ),
  );
  const contrato = useProprietario((s) =>
    s.contratos.find(
      (x) =>
        x.carroId === c.id &&
        x.motoristaId === MOTORISTA_LOGADO_ID &&
        (x.status === "aguardando_aceite" || x.status === "ativo"),
    ),
  );

  const [open, setOpen] = useState(false);
  const [pagando, setPagando] = useState<Pagamento | null>(null);
  const pagamentosContrato = usePagamentosDoContrato(contrato?.id ?? "");
  const abertos = pagamentosContrato
    .filter((p) => p.status !== "pago")
    .sort((a, b) => ((a.vencimento ?? a.data) < (b.vencimento ?? b.data) ? -1 : 1));
  const [valor, setValor] = useState(String(anuncio?.valor ?? c.diaria));
  const [periodicidade, setPeriodicidade] = useState<Contrato["periodicidade"]>(
    anuncio?.periodicidade ?? "diaria",
  );
  const [duracao, setDuracao] = useState("");
  const [mensagem, setMensagem] = useState("");

  function enviar() {
    const v = Number(valor);
    if (!v || v <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    enviarProposta({
      carroId: c.id,
      candidato,
      valor: v,
      periodicidade,
      duracao: duracao.trim() || undefined,
      mensagem: mensagem.trim() || undefined,
    });
    setOpen(false);
    toast.success("Proposta enviada ao proprietário!");
  }

  return (
    <div className="pb-4">
      <div className="relative h-64">
        <img src={c.foto} alt={c.modelo} className="h-full w-full object-cover" />
        <Link
          to="/motorista/alugueis"
          className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-card/90 shadow-soft backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-5 pt-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">{c.marca}</div>
        <h1 className="mt-1 font-display text-2xl font-bold">
          {c.modelo} {c.ano}
        </h1>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {anuncio ? (
            <>
              <Spec
                label={anuncio.periodicidade === "diaria" ? "Diária" : "Mensal"}
                value={fmtBRL(anuncio.valor)}
                highlight
              />
              <Spec label="Requisitos" value={descreverRequisitos(anuncio)} />
            </>
          ) : (
            <>
              <Spec label="Diária" value={`R$ ${c.diaria}`} highlight />
              <Spec label="Mensal" value={`R$ ${c.mensal}`} />
            </>
          )}
          <Spec
            label={minhaCaucao.desconto > 0 ? `Sua caução · ${candidato.nivel}` : "Caução"}
            value={`R$ ${minhaCaucao.valor}`}
          />
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <Row icon={MapPin}>{c.cidade}</Row>
          <Row icon={Gauge}>{c.km.toLocaleString("pt-BR")} km</Row>
          <Row icon={Calendar}>Placa {c.placa}</Row>
          <Row icon={Shield}>{c.seguro ? "Com seguro incluso" : "Sem seguro incluso"}</Row>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-accent/40 p-4">
          <div className="text-xs text-muted-foreground">Proprietário</div>
          <div className="font-semibold">{c.proprietario}</div>
        </div>

        {contrato?.status === "aguardando_aceite" ? (
          <div className="mt-6 rounded-2xl border border-primary/40 bg-primary/5 p-4">
            <div className="font-display text-base font-bold">Contrato para você aceitar</div>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                {fmtBRL(contrato.valor)} {periodicidadeLabel[contrato.periodicidade]} · caução{" "}
                {fmtBRL(contrato.caucao)}
              </p>
              {contrato.observacoes && (
                <p className="text-muted-foreground">Regras: {contrato.observacoes}</p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  recusarContrato(contrato.id);
                  toast("Contrato recusado");
                }}
              >
                <X className="mr-2 h-4 w-4" /> Recusar
              </Button>
              <Button
                className="rounded-xl gradient-primary text-primary-foreground"
                onClick={() => {
                  aceitarContrato(contrato.id);
                  toast.success("Contrato aceito! Combine a retirada com o proprietário.");
                }}
              >
                <Check className="mr-2 h-4 w-4" /> Aceitar
              </Button>
            </div>
          </div>
        ) : contrato?.status === "ativo" ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <p>
                <b>Este carro está alugado com você.</b> {fmtBRL(contrato.valor)}{" "}
                {periodicidadeLabel[contrato.periodicidade]}.
              </p>
            </div>
            {abertos.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 text-sm font-semibold">Aluguel a pagar</div>
                <div className="flex flex-col gap-2">
                  {abertos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                      <div>
                        <div className="font-semibold">{fmtBRL(p.valor)}</div>
                        <div
                          className={`text-xs ${p.status === "atrasado" ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {p.status === "atrasado" ? "Atrasado · " : ""}vence em{" "}
                          {fmtData(p.vencimento ?? p.data)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => setPagando(p)}
                      >
                        Pagar com Pix
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : proposta ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-primary" /> Proposta enviada
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {fmtBRL(proposta.valorProposto ?? 0)}{" "}
              {periodicidadeLabel[proposta.periodicidade ?? "diaria"]}. Aguardando o proprietário
              responder.
            </p>
            <Button
              variant="outline"
              className="mt-3 w-full rounded-xl"
              onClick={() => setOpen(true)}
            >
              Alterar proposta
            </Button>
          </div>
        ) : c.status !== "disponivel" || !anuncio?.publicado ? (
          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Este carro não está disponível no momento.
          </div>
        ) : !elegibilidade.ok ? (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <div className="font-semibold">Você ainda não atende aos requisitos deste anúncio</div>
            <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
              {elegibilidade.motivos.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <Link
              to="/motorista/clube"
              className="mt-2 inline-block text-xs font-semibold text-primary underline"
            >
              Ver como subir de nível
            </Link>
          </div>
        ) : c.status !== "disponivel" ? (
          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Este carro não está disponível no momento.
          </div>
        ) : (
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="mt-6 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
          >
            Enviar proposta
          </Button>
        )}
      </div>

      {pagando && contrato && (
        <PixCobranca
          aberto
          paraMotorista
          onFechar={() => setPagando(null)}
          valor={pagando.valor}
          identificador={pagando.id}
          descricao={`Aluguel do ${c.marca} ${c.modelo}`}
          vencimento={pagando.vencimento ?? pagando.data}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Sua proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valor (R$)</Label>
                <Input value={valor} onChange={(e) => setValor(e.target.value)} type="number" />
              </div>
              <div>
                <Label>Periodicidade</Label>
                <select
                  value={periodicidade}
                  onChange={(e) => setPeriodicidade(e.target.value as Contrato["periodicidade"])}
                  className="h-10 w-full rounded-lg border border-border bg-background px-2 text-sm"
                >
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Duração</Label>
              <Input
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                placeholder="ex: 30 dias"
              />
            </div>
            <div>
              <Label>Mensagem ao proprietário</Label>
              <Textarea
                rows={2}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              O proprietário vê seu nível no Clube, suas viagens e sua avaliação junto com a
              proposta.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="gradient-primary text-primary-foreground" onClick={enviar}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Spec({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-3 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-base font-bold ${highlight ? "text-primary" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  );
}
