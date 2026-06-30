import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import styles from "./Login.module.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez entrer votre email");
      return;
    }
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/new-password`,
      },
    );

    if (resetError) {
      setError("Erreur lors de l'envoi — vérifiez l'email saisi");
    } else {
      setSuccess(true);
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
            <div className={styles.brandSurtitle}>Espace administration</div>
            <h1 className={styles.brandTitle}>
              Réinitialisez votre mot de passe.
            </h1>
            <p className={styles.brandDesc}>
              Un lien vous sera envoyé par email pour créer un nouveau mot de
              passe.
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
              <h2 className={styles.formTitle}>Email envoyé !</h2>
              <p className={styles.formSub} style={{ marginBottom: 32 }}>
                Consultez votre boîte mail et cliquez sur le lien pour
                réinitialiser votre mot de passe.
              </p>
              <button
                className={styles.submitBtn}
                onClick={() => navigate("/")}
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h2 className={styles.formTitle}>Mot de passe oublié</h2>
              <p className={styles.formSub}>
                Entrez votre email et nous vous enverrons un lien de
                réinitialisation.
              </p>

              <form onSubmit={handleSubmit}>
                <label className={styles.fieldLabel}>Email</label>
                <div
                  className={`${styles.fieldWrap} ${emailFocus ? styles.fieldWrapFocus : ""}`}
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
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="M4 7l8 5 8-5" />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className={styles.input}
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
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
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>

              <p className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.footerBtn}
                  onClick={() => navigate("/")}
                >
                  ← Retour à la connexion
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
