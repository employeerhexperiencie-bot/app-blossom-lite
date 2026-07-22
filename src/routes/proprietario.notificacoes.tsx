import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Check, Banknote, Wrench, FileWarning, AlertTriangle, FileText, Gauge, ChevronRight } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useProprietario } from "@/lib/store-proprietario";
import type { Notificacao } from "@/lib/mock-proprietario";

export const Route = createFileRoute("/proprietario/notificacoes")({
  head: () => ({ meta: [{ title: "Notificações — TCHI LÉVA" }] }),
  component: Notificacoes,
});

function Notificacoes() {
  const notificacoes = useProprietario((s) => s.notificacoes);
  const lidas = useProprietario((s) => s.notificacoesLidas);
  const marcarLida = useProprietario((s) => s.marcarLida);
  const marcarTodas = useProprietario((s) => s.marcarTodasLidas);

  return (
    <PageSection>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h1 className="font-street text-lg font-black uppercase">Notificações</h1>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={marcarTodas}>
          <Check className="mr-1 h-3.5 w-3.5" /> Marcar todas
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {notificacoes.map((n) => {
          const lida = lidas.includes(n.id);
          const className = `grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border p-3 text-left shadow-card ${
            lida ? "bg-card/60 opacity-70" : "bg-card"
          }`;
          const hasLink = !!(n.solicitacaoId || n.contratoId || n.carroId);
          const body = (
            <>
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneOf(n.urgencia)}`}>{iconOf(n.tipo)}</span>
              <div className="min-w-0">
                <div className="truncate font-semibold">{n.titulo}</div>
                <div className="truncate text-xs text-muted-foreground">{n.descricao}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase text-muted-foreground">{n.data}</span>
                {hasLink && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </>
          );

          if (n.solicitacaoId) {
            return (
              <Link key={n.id} to="/proprietario/solicitacoes/$id" params={{ id: n.solicitacaoId }} onClick={() => marcarLida(n.id)} className={className}>
                {body}
              </Link>
            );
          }
          if (n.contratoId) {
            return (
              <Link key={n.id} to="/proprietario/contratos/$id" params={{ id: n.contratoId }} onClick={() => marcarLida(n.id)} className={className}>
                {body}
              </Link>
            );
          }
          if (n.carroId) {
            return (
              <Link key={n.id} to="/proprietario/frota/$carroId" params={{ carroId: n.carroId }} onClick={() => marcarLida(n.id)} className={className}>
                {body}
              </Link>
            );
          }
          return (
            <button key={n.id} onClick={() => marcarLida(n.id)} className={className}>
              {body}
            </button>
          );
        })}
      </div>
    </PageSection>
  );
}

function iconOf(t: Notificacao["tipo"]) {
  if (t === "pagamento") return <Banknote className="h-4 w-4" />;
  if (t === "manutencao") return <Wrench className="h-4 w-4" />;
  if (t === "documento") return <FileWarning className="h-4 w-4" />;
  if (t === "contrato") return <FileText className="h-4 w-4" />;
  if (t === "solicitacao") return <FileText className="h-4 w-4" />;
  if (t === "km") return <Gauge className="h-4 w-4" />;
  return <AlertTriangle className="h-4 w-4" />;
}

function toneOf(u: Notificacao["urgencia"]) {
  if (u === "alta") return "bg-destructive/15 text-destructive";
  if (u === "media") return "bg-warning/20 text-warning-foreground";
  return "bg-muted text-muted-foreground";
}
