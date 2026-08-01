import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageSection } from "@/components/AppShell";
import { ItemForm, itemVazio } from "@/components/ItemForm";
import { useParceiro } from "@/lib/store-parceiro";
import { toast } from "sonner";

export const Route = createFileRoute("/loja/catalogo/novo")({
  head: () => ({
    meta: [
      { title: "Novo item — Catálogo TCHI LÉVA" },
      { name: "description", content: "Cadastre um novo produto ou serviço no catálogo da sua loja parceira." },
      { property: "og:title", content: "Novo item — Catálogo TCHI LÉVA" },
      { property: "og:description", content: "Cadastro de produto ou serviço no catálogo do parceiro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NovoItem,
});

function NovoItem() {
  const addItem = useParceiro((s) => s.addItem);
  const navigate = useNavigate();
  return (
    <PageSection>
      <ItemForm
        inicial={itemVazio}
        textoBotao="Publicar item"
        onSubmit={(v) => {
          addItem(v);
          toast.success("Item publicado no catálogo!");
          navigate({ to: "/loja/catalogo" });
        }}
      />
    </PageSection>
  );
}
