import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import styles from "./Login.module.css";

function NewPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwFocus, setPwFocus] = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
      }
    });
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
      setError("Erreur lors de la mise à jour — " + updateError.message);
      setLoading(false);
      return;
    }

    // Vérifier le rôle pour rediriger correctement
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("role")
      .eq("auth_id", user.id)
      .single();

    setSuccess(true);

    if (utilisateur?.role === "super_admin") {
      // Admin → retour vers login admin
      setTimeout(() => navigate("/"), 2500);
    } else {
      // Habitant → page d'instructions app mobile
      setTimeout(() => navigate("/reset-confirm"), 2500);
    }

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
            <img
              src="/icon.png"
              alt="Weu"
              style={{ width: 46, height: 46, borderRadius: 14 }}
            />
            <span className={styles.logoText}>Weu</span>
          </div>
          <div className={styles.brandMiddle}>
            <div className={styles.brandSurtitle}>Espace administration</div>
            <h1 className={styles.brandTitle}>
              Créez votre nouveau mot de passe.
            </h1>
            <p className={styles.brandDesc}>
              Choisissez un mot de passe sécurisé d'au moins 8 caractères.
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
              <h2 className={styles.formTitle}>Mot de passe mis à jour !</h2>
              <p className={styles.formSub}>Vous allez être redirigé…</p>
            </div>
          ) : !sessionReady ? (
            <div style={{ textAlign: "center" }}>
              <h2 className={styles.formTitle}>Lien invalide</h2>
              <p className={styles.formSub} style={{ marginBottom: 32 }}>
                Ce lien est expiré ou déjà utilisé. Faites une nouvelle demande.
              </p>
              <button
                className={styles.submitBtn}
                onClick={() => navigate("/reset-password")}
              >
                Nouvelle demande
              </button>
            </div>
          ) : (
            <>
              <h2 className={styles.formTitle}>Nouveau mot de passe</h2>
              <p className={styles.formSub}>
                Choisissez un mot de passe sécurisé pour votre compte.
              </p>

              <form onSubmit={handleSubmit}>
                <label className={styles.fieldLabel}>
                  Nouveau mot de passe
                </label>
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
                  {loading ? "Mise à jour..." : "Enregistrer le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewPassword;
