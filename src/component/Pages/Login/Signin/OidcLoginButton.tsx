import { Button, ButtonProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import LockClosedKey from "../../../Icons/LockClosedKey.tsx";

// Unlike PasskeyLoginButton, this needs no click handler or API call —
// /api/v4/session/oidc/login is a plain server-side redirect to
// Authentik (see routers/controllers/oidc.go, OidcLogin). The full
// round trip (Authentik login -> backend callback -> exchange code ->
// OidcCallback.tsx) happens entirely outside this component.
export default function OidcLoginButton(props: ButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      href="/api/v4/session/oidc/login"
      variant={"outlined"}
      startIcon={<LockClosedKey />}
      fullWidth
      {...props}
    >
      {t("login.useSSO", { defaultValue: "Continue with SSO" })}
    </Button>
  );
}
