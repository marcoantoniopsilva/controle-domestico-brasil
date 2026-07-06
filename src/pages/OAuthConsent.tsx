import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string; logo_uri?: string };
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};

// Narrow local shim for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (
    id: string
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Solicitação de autorização inválida (authorization_id ausente).");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/login?next=" + encodeURIComponent(next);
        return;
      }
      const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("O servidor de autorização não devolveu um redirect.");
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Conectar aplicativo ao Plenna</CardTitle>
          <CardDescription>
            {details?.client?.name
              ? `${details.client.name} está pedindo acesso aos seus dados no Plenna.`
              : "Um aplicativo está pedindo acesso aos seus dados no Plenna."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!error && !details && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {details && (
            <>
              <p className="text-sm text-muted-foreground">
                Ao aprovar, este aplicativo poderá usar as ferramentas do Plenna em seu nome
                (ler lançamentos, categorias, contas, cartões e metas, e criar novos lançamentos).
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  Aprovar
                </Button>
                <Button className="flex-1" variant="outline" disabled={busy} onClick={() => decide(false)}>
                  Negar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}