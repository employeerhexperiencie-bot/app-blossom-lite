import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileLabels, type ProfileKey } from "@/lib/mock-data";
import { useConect } from "@/lib/store";

type Search = { perfil?: ProfileKey };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    perfil: (s.perfil as ProfileKey) || "motorista",
  }),
  head: () => ({ meta: [{ title: "Entrar — TCHI LÉVA" }] }),
  component: AuthPage,
});

const homeByPerfil: Record<ProfileKey, string> = {
  motorista: "/motorista",
  proprietario: "/proprietario",
  oficina: "/oficina",
  passageiro: "/passageiro",
  loja: "/loja",
};

function AuthPage() {
  const search = Route.useSearch();
  const perfil: ProfileKey = (search.perfil ?? "motorista") as ProfileKey;
  const setPerfil = useConect((s) => s.setPerfil);
  const setNome = useConect((s) => s.setNome);
  const navigate = useNavigate();
  const [nome, setNomeLocal] = useState("");
  const p = profileLabels[perfil];

  function handle(e: React.FormEvent) {
    e.preventDefault();
    setPerfil(perfil);
    setNome(nome || p.title);
    navigate({ to: homeByPerfil[perfil] });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-col bg-background px-6 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Trocar perfil
      </Link>

      <div className="mt-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <span>{p.emoji}</span> Entrando como {p.title}
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold">Bem-vindo</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesse para continuar. (protótipo — qualquer dado entra)</p>
      </div>

      <form onSubmit={handle} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(e) => setNomeLocal(e.target.value)} placeholder="Seu nome" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tel">Telefone</Label>
          <Input id="tel" type="tel" placeholder="(11) 9 0000-0000" />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-xl gradient-primary text-primary-foreground shadow-glow">
          Entrar
        </Button>
        <button type="button" className="w-full text-center text-xs text-muted-foreground underline">
          Criar nova conta
        </button>
      </form>
    </div>
  );
}
