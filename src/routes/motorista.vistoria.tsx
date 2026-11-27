import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera } from "lucide-react";
import { PageSection } from "@/components/AppShell";
import { VistoriaForm, useSituacaoVistoria } from "@/components/proprietario/Vistoria";
import { MOTORISTA_LOGADO_ID } from "@/lib/mock-proprietario";
import { useCarro, useProprietario } from "@/lib/store-proprietario";

export const Route = createFileRoute("/motorista/vistoria")({
  head: () => ({ meta: [{ title: "Vistoria do carro — Motorista TCHI LÉVA" }] }),
  component: VistoriaMotorista,
});

/** O motorista com carro alugado pelo app envia a vistoria periódica com fotos tiradas na hora. */
function VistoriaMotorista() {
  const navigate = useNavigate();
  const contrato = useProprietario((s) =>
    s.contratos.find((c) => c.motoristaId === MOTORISTA_LOGADO_ID && c.status === "ativo"),
  );
  const carro = useCarro(contrato?.carroId);
  const situacao = useSituacaoVistoria(carro?.id ?? "", carro?.km ?? 0);

  return (
    <PageSection>
      <Link
        to="/motorista"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Início
      </Link>
      <h1 className="mt-3 font-display text-xl font-bold">Vistoria do carro</h1>

      {!carro ? (
        <p className="mt-3 text-sm text-muted-foreground">
          A vistoria é para quem está com um carro alugado pelo app. Veja os carros disponíveis em
          Aluguéis.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted-foreground">
            {carro.marca} {carro.modelo} · {carro.placa}. As fotos protegem você: elas mostram como
            o carro estava e garantem a devolução da caução.
          </p>
          <div
            className={`mt-3 flex items-center gap-2 rounded-2xl border p-3 text-xs ${situacao.pendente ? "border-warning/60 bg-warning/5" : "border-border bg-card"}`}
          >
            <Camera className="h-4 w-4 shrink-0 text-primary" />
            <span>
              {situacao.pendente ? <b>Vistoria pendente. </b> : null}
              {situacao.motivo}.
            </span>
          </div>
          <div className="mt-3">
            <VistoriaForm
              carroId={carro.id}
              kmAtual={carro.km}
              enviadaPor="motorista"
              onEnviada={() => navigate({ to: "/motorista" })}
            />
          </div>
        </>
      )}
    </PageSection>
  );
}
