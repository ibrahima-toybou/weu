import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import styles from "./Login.module.css";

function Activate() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwFocus, setPwFocus] = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const accessToken =
      hashParams.get("access_token") || urlParams.get("access_token");
    const refreshToken =
      hashParams.get("refresh_token") || urlParams.get("refresh_token");
    const urlError = urlParams.get("error") || hashParams.get("error");

    console.log("URL complète:", window.location.href);
    console.log("Tokens:", { accessToken, refreshToken, urlError });

    if (urlError) {
      console.log("Erreur URL:", urlError);
      return;
    }

    if (accessToken) {
      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        })
        .then(({ data, error }) => {
          console.log("setSession result:", data, error);
          if (data?.session) {
            setSessionReady(true);
            setEmail(data.session.user.email || "");
          }
        });
    } else {
      // Vérifier session existante
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSessionReady(true);
          setEmail(session.user.email || "");
        }
      });

      supabase.auth.onAuthStateChange((event, session) => {
        console.log("Event:", event, "Session:", session);
        if (session && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
          setSessionReady(true);
          setEmail(session.user.email || "");
        }
      });
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Erreur : " + updateError.message);
      setLoading(false);
      return;
    }

    // Activer le ménage et l'utilisateur
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("utilisateur")
        .update({ actif: true })
        .eq("auth_id", user.id);

      const { data: utilisateur } = await supabase
        .from("utilisateur")
        .select("id_menage")
        .eq("auth_id", user.id)
        .single();

      if (utilisateur?.id_menage) {
        await supabase
          .from("menage")
          .update({ statut: "actif" })
          .eq("id_menage", utilisateur.id_menage);
      }
    }

    // Déconnecter — l'habitant doit se connecter depuis l'app mobile
    await supabase.auth.signOut();

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* PANNEAU MARQUE */}
        <div className={styles.brand}>
          <div className={styles.brandBubble1} />
          <div className={styles.brandBubble2} />
          <div className={styles.brandTop}>
            <div className={styles.logoTile}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20C7 20 4 17 4 13c0-1.6.5-3 1.3-4.2C8 12 11 13 12 16c0-4 2-7 6-9.5C18.6 8 19 10 19 12c0 4.5-3.5 8-8 8z" />
              </svg>
            </div>
            <span className={styles.logoText}>Weu</span>
          </div>
          <div className={styles.brandMiddle}>
            <div className={styles.brandSurtitle}>Bienvenue sur Weu</div>
            <h1 className={styles.brandTitle}>
              Créez votre mot de passe pour accéder à votre espace.
            </h1>
            <p className={styles.brandDesc}>
              Choisissez un mot de passe sécurisé d'au moins 8 caractères pour
              protéger votre compte.
            </p>
          </div>
          <div className={styles.brandFooter}>
            <span className={styles.brandDot} />
            Quartier Madina · Plateforme Weu
          </div>
        </div>

        {/* PANNEAU FORMULAIRE */}
        <div className={styles.form}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: "rgba(45,212,191,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className={styles.formTitle}>Compte activé !</h2>
              <p className={styles.formSub}>
                Votre compte Weu est maintenant actif. Téléchargez l'application
                pour accéder à votre espace habitant.
              </p>
              <div
                style={{
                  background: "#F4F5F8",
                  borderRadius: 14,
                  padding: "20px",
                  border: "1px solid rgba(15,23,42,0.07)",
                  marginTop: 24,
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1B1F2B",
                  }}
                >
                  Comment accéder à votre espace ?
                </p>
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: 13,
                    color: "#6B7185",
                    lineHeight: 1.6,
                  }}
                >
                  Téléchargez l'application <strong>Weu</strong> sur Google Play
                  ou l'App Store et connectez-vous avec :
                </p>
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 10,
                    padding: "12px 16px",
                    border: "1px solid rgba(15,23,42,0.07)",
                    marginBottom: 8,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, color: "#6B7185" }}>
                    Email
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1B1F2B",
                    }}
                  >
                    {email}
                  </p>
                </div>
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 10,
                    padding: "12px 16px",
                    border: "1px solid rgba(15,23,42,0.07)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, color: "#6B7185" }}>
                    Mot de passe
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1B1F2B",
                    }}
                  >
                    Le mot de passe que vous venez de créer
                  </p>
                </div>
              </div>
            </div>
          ) : !sessionReady ? (
            <div style={{ textAlign: "center" }}>
              <h2 className={styles.formTitle}>Lien invalide</h2>
              <p className={styles.formSub} style={{ marginBottom: 32 }}>
                Ce lien d'invitation est expiré ou déjà utilisé. Contactez
                l'administrateur du quartier.
              </p>
              <button
                className={styles.submitBtn}
                onClick={() => navigate("/")}
              >
                Retour à l'accueil
              </button>
            </div>
          ) : (
            <>
              <h2 className={styles.formTitle}>Créer mon mot de passe</h2>
              <p className={styles.formSub}>
                Choisissez un mot de passe pour sécuriser votre compte Weu.
              </p>

              <form onSubmit={handleSubmit}>
                <label className={styles.fieldLabel}>Mot de passe</label>
                <div
                  className={`${styles.fieldWrap} ${pwFocus ? styles.fieldWrapFocus : ""}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9AA0B0"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={styles.input}
                    onFocus={() => setPwFocus(true)}
                    onBlur={() => setPwFocus(false)}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                        <circle cx="12" cy="12" r="2.8" />
                      </svg>
                    )}
                  </button>
                </div>

                <label className={styles.fieldLabel}>
                  Confirmer le mot de passe
                </label>
                <div
                  className={`${styles.fieldWrap} ${confirmFocus ? styles.fieldWrapFocus : ""}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9AA0B0"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={styles.input}
                    onFocus={() => setConfirmFocus(true)}
                    onBlur={() => setConfirmFocus(false)}
                  />
                </div>

                {error && (
                  <div className={styles.errorBox} style={{ marginTop: 16 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitBtn}
                  style={{ marginTop: 26 }}
                >
                  {loading ? "Activation..." : "Activer mon compte"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Activate;
