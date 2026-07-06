import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listTransactions from "./tools/list-transactions";
import createTransaction from "./tools/create-transaction";
import listCategories from "./tools/list-categories";
import listAccounts from "./tools/list-accounts";
import listCards from "./tools/list-cards";
import listGoals from "./tools/list-goals";
import cycleSummary from "./tools/cycle-summary";

// The OAuth issuer must be the direct Supabase host (built from the project ref),
// never the .lovable.cloud proxy — mcp-js verifies the discovery document.
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "plenna-mcp",
  title: "Plenna Finanças",
  version: "0.1.0",
  instructions:
    "Ferramentas para consultar e registrar dados financeiros do usuário no Plenna: lançamentos, categorias, contas bancárias, cartões de crédito, metas & reservas e resumo do ciclo atual. Despesas são armazenadas com valor negativo. O ciclo financeiro do usuário começa no dia definido em preferências (padrão 25).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listTransactions,
    createTransaction,
    listCategories,
    listAccounts,
    listCards,
    listGoals,
    cycleSummary,
  ],
});