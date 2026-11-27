import { Link } from "@tanstack/react-router";
import { Check, Copy, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fmtBRL, fmtData, type Pagamento } from "@/lib/mock-proprietario";
import { montarCobrancaPix, type CobrancaPix } from "@/lib/pix";
import { useProprietario } from "@/lib/store-proprietario";

type Props = {
  pagamento: Pagamento | null;
  motoristaNome: string;
  veiculo: string;
  onClose: () => void;
};

export function CobrancaPixDialog({ pagamento, motoristaNome, veiculo, onClose }: Props) {
  // Os dados de recebimento vêm do Perfil do dono (nome, cidade e chave Pix).
  const perfil = useProprietario((s) => s.perfil);
  const recebimento = useMemo(
    () =>
      perfil.chavePix
        ? { nome: perfil.nome, cidade: perfil.cidade, chavePix: perfil.chavePix }
        : null,
    [perfil.nome, perfil.cidade, perfil.chavePix],
  );
  const registrarPagamento = useProprietario((s) => s.registrarPagamento);
  const marcarCobrancaEnviada = useProprietario((s) => s.marcarCobrancaEnviada);
  const [pix, setPix] = useState<CobrancaPix | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setPix(null);
    setErro(null);
    if (!pagamento || !recebimento) return;
    let ativo = true;
    montarCobrancaPix({
      recebimento,
      valor: pagamento.valor,
      txid: pagamento.txid,
      descricao: `Aluguel ${veiculo}`,
    })
      .then((r) => ativo && setPix(r))
      .catch((e: Error) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [pagamento, recebimento, veiculo]);

  if (!pagamento) return null;

  const mensagem = pix
    ? `Olá, ${motoristaNome.split(" ")[0]}! Segue o Pix do aluguel do ${veiculo}: ${fmtBRL(pagamento.valor)}, vencimento ${fmtData(pagamento.data)}.\n\nPix copia e cola:\n${pix.brCode}`
    : "";

  async function copiar() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.brCode);
      toast.success("Código Pix copiado");
    } catch {
      toast.error("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  function enviarWhatsApp() {
    if (!pagamento) return;
    marcarCobrancaEnviada(pagamento.id);
    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, "_blank", "noopener");
  }

  function marcarPago() {
    if (!pagamento) return;
    registrarPagamento(pagamento.id);
    toast.success("Pagamento confirmado");
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-street uppercase">Cobrança Pix</DialogTitle>
          <DialogDescription>
            {fmtBRL(pagamento.valor)} · {motoristaNome} · vence {fmtData(pagamento.data)}
          </DialogDescription>
        </DialogHeader>

        {!recebimento ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
            <p>Cadastre sua chave Pix para gerar cobranças.</p>
            <Link to="/proprietario/perfil" onClick={onClose}>
              <Button className="w-full rounded-xl gradient-primary text-primary-foreground">
                Cadastrar chave Pix
              </Button>
            </Link>
          </div>
        ) : erro ? (
          <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </p>
        ) : !pix ? (
          <div className="grid h-56 place-items-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            <img
              src={pix.qrDataUrl}
              alt="QR Code Pix"
              className="mx-auto h-52 w-52 rounded-2xl bg-white p-2"
            />
            <div className="break-all rounded-xl border border-border bg-muted/40 p-2 font-mono text-[10px] leading-snug">
              {pix.brCode}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl" onClick={copiar}>
                <Copy className="mr-2 h-4 w-4" /> Copiar
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={enviarWhatsApp}>
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Recebimento em {recebimento.nome} · chave {recebimento.chavePix}. Confira o crédito no
              seu banco e confirme abaixo.
            </p>
            {pagamento.status !== "pago" && (
              <Button
                className="w-full rounded-xl gradient-primary text-primary-foreground"
                onClick={marcarPago}
              >
                <Check className="mr-2 h-4 w-4" /> Marcar como pago
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
