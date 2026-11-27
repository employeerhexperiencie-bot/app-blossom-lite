import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { recebimentosMensais } from "@/lib/mock-data";
import { receitaPlataforma, totalReceitaPlataforma } from "@/lib/monetizacao";
import { fmtBRL } from "@/lib/mock-parceiro";
import { comissaoOS, comissaoPedido } from "@/lib/monetizacao";
import { useCarros, useProprietario } from "@/lib/store-proprietario";
import { useOficina } from "@/lib/store-oficina";
import { useParceiro } from "@/lib/store-parceiro";
import { mensalidadePlanoFrota } from "@/lib/regras-proprietario";

export const Route = createFileRoute("/admin/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Admin | TCHI LÉVA" }] }),
  component: Financeiro,
});

function Financeiro() {
  const total = recebimentosMensais.reduce((s, m) => s + m.valor, 0);
  const totalReceita = totalReceitaPlataforma();
  const max = Math.max(...recebimentosMensais.map((m) => m.valor));
  return (
    <>
      <PageSection>
        <h1 className="font-display text-xl font-extrabold">Financeiro</h1>
        <p className="text-xs text-muted-foreground">Repasses, taxas e comissões</p>
      </PageSection>

      <PageSection className="pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Box
            icon={Wallet}
            label="Comissão acumulada"
            value={`R$ ${(total * 0.18).toFixed(0)}`}
            delta="+12%"
            up
          />
          <Box
            icon={TrendingUp}
            label="GMV semestre"
            value={`R$ ${total.toLocaleString("pt-BR")}`}
            delta="+9%"
            up
          />
          <Box icon={ArrowUpRight} label="A repassar" value="R$ 12.480" delta="—" up />
          <Box icon={ArrowDownRight} label="Em atraso" value="R$ 2.140" delta="-3%" />
        </div>
      </PageSection>

      <ReceitaDoApp />

      <PageSection className="pt-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Recebimentos por mês
          </h2>
          <div className="mt-4 grid grid-cols-6 items-end gap-2 h-32">
            {recebimentosMensais.map((m) => (
              <div key={m.mes} className="flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md gradient-primary"
                  style={{ height: `${(m.valor / max) * 100}%` }}
                />
                <span className="text-[10px] font-semibold text-muted-foreground">{m.mes}</span>
              </div>
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection className="pt-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Receita da plataforma por fonte
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {receitaPlataforma.map((f) => (
              <div key={f.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{f.label}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{f.descricao}</div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full gradient-primary"
                      style={{ width: `${(f.valor / totalReceita) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="font-display text-sm font-black">{fmtBRL(f.valor)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold">Total mês</span>
            <span className="font-display text-xl font-black text-primary">
              {fmtBRL(totalReceita)}
            </span>
          </div>
        </div>
      </PageSection>
    </>
  );
}

function Box({
  icon: Icon,
  label,
  value,
  delta,
  up,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  delta: string;
  up?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className={`text-xs font-semibold ${up ? "text-success" : "text-destructive"}`}>
          {delta}
        </span>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-extrabold">{value}</div>
    </div>
  );
}

/** Receita gerada pelo uso real do protótipo (registrada neste navegador), separada por quem paga. */
function ReceitaDoApp() {
  const carros = useCarros();
  const plano = useProprietario((s) => s.planoFrota);
  const lancamentos = useProprietario((s) => s.lancamentosPlataforma);
  const ordens = useOficina((s) => s.ordens);
  const pedidos = useParceiro((s) => s.pedidos);
  const soma = (tipo: string) =>
    lancamentos.filter((l) => l.tipo === tipo).reduce((a, l) => a + l.valor, 0);
  const osDonos = ordens.filter(
    (o) => o.status === "concluido" && o.clienteTipo === "proprietario",
  );
  const pedidosFrota = pedidos.filter(
    (p) =>
      p.clientePerfil === "proprietario" && p.origem === "oportunidade" && p.status !== "recusado",
  );
  const linhas = [
    {
      label: "Plano Frota (mensal)",
      quem: "Proprietários",
      valor: plano.ativo ? mensalidadePlanoFrota(carros.length) : 0,
      detalhe: plano.ativo ? `${carros.length} carros na frota` : "Nenhum assinante ainda",
    },
    {
      label: "Destaque de anúncios",
      quem: "Proprietários",
      valor: soma("destaque"),
      detalhe: `${lancamentos.filter((l) => l.tipo === "destaque").length} destaques comprados`,
    },
    {
      label: "Comissão de serviços da frota",
      quem: "Oficinas",
      valor: osDonos.reduce((a, o) => a + comissaoOS(o), 0),
      detalhe: `${osDonos.length} OS de proprietários concluídas`,
    },
    {
      label: "Comissão de pedidos da frota",
      quem: "Lojas",
      valor: pedidosFrota.reduce((a, p) => a + comissaoPedido(p).comissao, 0),
      detalhe: `${pedidosFrota.length} pedidos vindos dos alertas de manutenção`,
    },
    {
      label: "Leads da frota",
      quem: "Lojas",
      valor: soma("lead_loja"),
      detalhe: `${lancamentos.filter((l) => l.tipo === "lead_loja").length} leads entregues`,
    },
  ];
  const total = linhas.reduce((a, l) => a + l.valor, 0);

  return (
    <PageSection className="pt-2">
      <div className="rounded-2xl border border-primary/40 bg-card p-4 shadow-card">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Receita gerada pela jornada do proprietário
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Ao vivo, com o que foi feito no app neste aparelho (sem banco de dados).
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {linhas.map((l) => (
            <div key={l.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{l.label}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {l.quem} · {l.detalhe}
                </div>
              </div>
              <span className="font-display text-sm font-black">{fmtBRL(l.valor)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-semibold">Total</span>
          <span className="font-display text-xl font-black text-primary">{fmtBRL(total)}</span>
        </div>
      </div>
    </PageSection>
  );
}
