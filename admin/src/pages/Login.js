import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("utilisateur")
      .select("role, nom")
      .eq("auth_id", authData.user.id)
      .single();

    if (userError || !userData) {
      setError("Compte non trouvé dans le système");
      setLoading(false);
      return;
    }

    if (userData.role === "super_admin") {
      navigate("/dashboard");
    } else {
      setError("Accès refusé — interface réservée aux administrateurs");
      await supabase.auth.signOut();
    }

    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* PANNEAU GAUCHE — MARQUE */}
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
              Pilotez la collecte
              <br />
              de votre quartier.
            </h1>
            <p className={styles.brandDesc}>
              Ménages, cotisations et points de collecte — tout au même endroit,
              en temps réel.
            </p>
          </div>

          <div className={styles.brandFooter}>
            <span className={styles.brandDot} />
            Quartier Madina · Plateforme Weu
          </div>
        </div>

        {/* PANNEAU DROIT — FORMULAIRE */}
        <div className={styles.form}>
          <h2 className={styles.formTitle}>Connexion</h2>
          <p className={styles.formSub}>
            Accédez à votre tableau de bord administrateur.
          </p>

          <form onSubmit={handleLogin}>
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

            <div className={styles.options}>
              <label
                className={styles.remember}
                onClick={() => setRememberMe(!rememberMe)}
              >
                <span
                  className={`${styles.checkbox} ${rememberMe ? styles.checkboxChecked : ""}`}
                >
                  {rememberMe && (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                Se souvenir de moi
              </label>
              <button type="button" className={styles.forgotBtn}>
                Mot de passe oublié ?
              </button>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className={styles.formFooter}>
            Besoin d'un accès ?{" "}
            <button type="button" className={styles.footerBtn}>
              Contactez l'administrateur
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
