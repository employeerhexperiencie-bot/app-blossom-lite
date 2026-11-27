import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, ChevronRight, CalendarClock, Megaphone, Users, QrCode } from "lucide-react";
import {
  isValidCnpj,
  isValidCpf,
  isValidPhone,
  isValidPixKey,
} from "@brazilian-utils/brazilian-utils";
import { toast } from "sonner";
import { PageSection } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConect } from "@/lib/store";
import { useCarros, useProprietario } from "@/lib/store-proprietario";
import type { PerfilDono } from "@/lib/mock-proprietario";

export const Route = createFileRoute("/proprietario/perfil")({
  head: () => ({ meta: [{ title: "Perfil — Proprietário TCHI LÉVA" }] }),
  component: Perfil,
});

function validar(p: PerfilDono): Partial<Record<keyof PerfilDono, string>> {
  const erros: Partial<Record<keyof PerfilDono, string>> = {};
  if (!p.nome.trim()) erros.nome = "Informe o nome que vai no contrato";
  const doc = p.documento.replace(/\D/g, "");
  if (doc && !(isValidCpf(doc) || isValidCnpj(doc))) erros.documento = "CPF ou CNPJ inválido";
  if (p.telefone && !isValidPhone(p.telefone)) erros.telefone = "Telefone inválido";
  if (p.chavePix && !isValidPixKey(p.chavePix.trim()))
    erros.chavePix = "Chave Pix inválida (CPF, CNPJ, e-mail, celular com +55 ou chave aleatória)";
  return erros;
}

function Perfil() {
  const { nomeUsuario, logout } = useConect();
  const navigate = useNavigate();
  const carros = useCarros();
  const salvo = useProprietario((s) => s.perfil);
  const salvarPerfil = useProprietario((s) => s.salvarPerfil);
  const [form, setForm] = useState<PerfilDono>({ ...salvo, nome: salvo.nome || nomeUsuario });
  const [tentou, setTentou] = useState(false);
  const erros = validar(form);
  const nome = form.nome || "Proprietário";
  const set = (k: keyof PerfilDono, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function salvar() {
    setTentou(true);
    if (Object.keys(erros).length > 0) {
      toast.error("Confira os campos destacados");
      return;
    }
    salvarPerfil({ ...form, nome: form.nome.trim(), chavePix: form.chavePix.trim() });
    toast.success("Perfil salvo");
  }

  return (
    <PageSection>
      <div className="flex items-center gap-4 rounded-3xl gradient-warm p-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-glow">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-lg font-bold">{nome}</div>
          <div className="text-xs text-muted-foreground">
            Proprietário · {carros.length} carro{carros.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {!salvo.chavePix && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-3 text-xs">
          <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            <b>Cadastre sua chave Pix</b> para cobrar os aluguéis com QR Code direto pelo app.
          </p>
        </div>
      )}

      <section className="mt-5 space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="font-street text-xs font-black uppercase tracking-wider text-muted-foreground">
          Dados do proprietário
        </h2>
        <Campo label="Nome ou razão social" erro={tentou ? erros.nome : undefined}>
          <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        </Campo>
        <Campo label="CPF ou CNPJ" erro={erros.documento}>
          <Input
            value={form.documento}
            onChange={(e) => set("documento", e.target.value)}
            inputMode="numeric"
          />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Telefone" erro={erros.telefone}>
            <Input
              value={form.telefone}
              onChange={(e) => set("telefone", e.target.value)}
              placeholder="(11) 98765-4321"
            />
          </Campo>
          <Campo label="Cidade">
            <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
          </Campo>
        </div>
      </section>

      <section className="mt-3 space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="font-street text-xs font-black uppercase tracking-wider text-muted-foreground">
          Recebimento por Pix
        </h2>
        <Campo label="Chave Pix" erro={erros.chavePix}>
          <Input
            value={form.chavePix}
            onChange={(e) => set("chavePix", e.target.value)}
            placeholder="CPF, CNPJ, e-mail, +55 celular ou chave aleatória"
          />
        </Campo>
        <p className="text-[11px] text-muted-foreground">
          Usada para gerar o QR Code das cobranças. O app não movimenta dinheiro: você confirma cada
          recebimento.
        </p>
      </section>

      <Button
        className="mt-4 w-full rounded-xl gradient-primary text-primary-foreground shadow-glow"
        onClick={salvar}
      >
        Salvar perfil
      </Button>

      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        <Atalho to="/proprietario/frota/anuncios" icon={Megaphone} label="Meus anúncios" />
        <Atalho to="/proprietario/contratos/motoristas" icon={Users} label="Motoristas" />
        <Atalho to="/proprietario/agenda" icon={CalendarClock} label="Agenda da frota" />
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full rounded-xl"
        onClick={() => {
          logout();
          navigate({ to: "/" });
        }}
      >
        <LogOut className="mr-2 h-4 w-4" /> Sair
      </Button>
    </PageSection>
  );
}

function Campo({
  label,
  erro,
  children,
}: {
  label: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
      {erro && <p className="text-[11px] text-destructive">{erro}</p>}
    </div>
  );
}

function Atalho({
  to,
  icon: Icon,
  label,
}: {
  to:
    | "/proprietario/frota/anuncios"
    | "/proprietario/contratos/motoristas"
    | "/proprietario/agenda";
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5"
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-semibold">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
