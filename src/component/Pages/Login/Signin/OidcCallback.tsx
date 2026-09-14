import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Box, CircularProgress, Typography } from "@mui/material";
import { sendOidcExchange } from "../../../../api/api.ts";
import { setHeadlessFrameLoading } from "../../../../redux/globalStateSlice.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { refreshUserSession } from "../../../../redux/thunks/session.ts";
import { useQuery } from "../../../../util/index.ts";
import PageTitle from "../../../../router/PageTitle.tsx";

// Landing page for the OIDC (Authentik) login redirect. The backend
// (routers/controllers/oidc.go, OidcCallback) sends the browser here
// with either ?code=<one-time exchange code> or ?error=<reason> after
// the Authentik round trip. This page's only job is to immediately
// redeem that code for a real session — it mirrors exactly what
// SignIn.tsx does on a successful password login (same LoginResponse
// shape, same refreshUserSession dispatch), so from here on an SSO
// login is indistinguishable from a password one.
const OidcCallback = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const query = useQuery();

  useEffect(() => {
    const code = query.get("code");
    const error = query.get("error");

    if (error) {
      enqueueSnackbar(t("login.oidcFailed", { defaultValue: "Single sign-on failed. Please try again." }), {
        variant: "error",
      });
      navigate("/session");
      return;
    }

    if (!code) {
      // Landed here with neither code nor error — not a valid entry
      // point (e.g. someone bookmarked/refreshed this URL after the
      // 60s exchange code already expired).
      navigate("/session");
      return;
    }

    dispatch(setHeadlessFrameLoading(true));
    dispatch(sendOidcExchange(code))
      .then((loginRes) => {
        dispatch(refreshUserSession(loginRes, query.get("redirect")));
      })
      .catch(() => {
        enqueueSnackbar(
          t("login.oidcExchangeFailed", {
            defaultValue: "Sign-in link expired or already used. Please try signing in again.",
          }),
          { variant: "error" },
        );
        navigate("/session");
      })
      .finally(() => {
        dispatch(setHeadlessFrameLoading(false));
      });
  }, []);

  return (
    <Box>
      <PageTitle title={t("login.signInTitle", { defaultValue: "Signing in..." })} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          py: 9,
        }}
      >
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          {t("login.completingSignIn", { defaultValue: "Completing sign-in…" })}
        </Typography>
      </Box>
    </Box>
  );
};

export default OidcCallback;
