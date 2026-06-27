import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Parametres.module.css";

function Parametres() {
  const [utilisateur, setUtilisateur] = useState(null);
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [loading, setLoading] = useState(true);

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmMdp, setConfirmMdp] = useState("");
  const [errorMdp, setErrorMdp] = useState("");
  const [successMdp, setSuccessMdp] = useState("");
  const [loadingMdp, setLoadingMdp] = useState(false);

  const [errorProfil, setErrorProfil] = useState("");
  const [successProfil, setSuccessProfil] = useState("");
  const [loadingProfil, setLoadingProfil] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("weu-theme") === "dark",
  );

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const existing = document.getElementById("weu-dark-style");
    if (existing) existing.remove();

    if (darkMode) {
      const style = document.createElement("style");
      style.id = "weu-dark-style";
      style.innerHTML = `
        html, body {
          background: #0f172a !important;
          color: #f1f5f9 !important;
        }
        [class*="wrap"] {
          background: #0f172a !important;
        }
        [class*="page"] {
          background: #0f172a !important;
          background-image: none !important;
        }
        [class*="card"], [class*="Card"],
        [class*="kpiCard"], [class*="donutCard"], [class*="alertesCard"],
        [class*="popup"], [class*="resumeMois"], [class*="pointCard"],
        [class*="pointSelectCard"], [class*="moisSelector"] {
          background: #1e293b !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        [class*="sidebar"] {
          background: rgba(30,41,59,0.97) !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        [class*="header"] {
          background: rgba(15,23,42,0.95) !important;
          border-color: rgba(255,255,255,0.06) !important;
        }
        [class*="main"] {
          background: #0f172a !important;
        }
        input, textarea, select,
        [class*="input"], [class*="searchInput"], [class*="moisInput"], [class*="select"],
        [class*="trigger"] {
          background: #0f172a !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: #f1f5f9 !important;
        }
        input::placeholder { color: #475569 !important; }
        [class*="title"], [class*="cardTitle"], [class*="popupTitle"],
        [class*="ptNom"], [class*="pointNom"], [class*="tdBold"],
        [class*="kpiVal"], [class*="statVal"], [class*="donutPct"],
        [class*="alerteT"], [class*="toggleLabel"], [class*="infoVal"],
        [class*="logoName"], [class*="popupItemNom"], [class*="resumeVal"],
        [class*="histMois"], [class*="propositionTitre"], [class*="pointSelectNom"],
        h1, h2, h3, strong {
          color: #f1f5f9 !important;
        }
        [class*="sub"]:not([class*="submit"]), [class*="cardSub"], [class*="popupSub"],
        [class*="kpiSub"], [class*="statSub"], [class*="ptZone"],
        [class*="pointSecteur"], [class*="alerteB"], [class*="toggleSub"],
        [class*="infoLabel"], [class*="logoSub"], [class*="histMontant"],
        [class*="propositionDesc"], [class*="pointSelectSub"], p {
          color: #94a3b8 !important;
        }
        [class*="label"], [class*="th"], [class*="kpiLabel"],
        [class*="statLabel"], [class*="cardCount"], [class*="donutLabel"],
        [class*="resumeMoisLabel"], [class*="triggerPlaceholder"] {
          color: #64748b !important;
        }
        [class*="td"]:not([class*="tdBold"]) { color: #94a3b8 !important; }
        [class*="ptBarTrack"], [class*="barTrack"] {
          background: rgba(255,255,255,0.08) !important;
        }
        [class*="ptMenagesBadge"], [class*="cardBadge"] {
          background: rgba(255,255,255,0.06) !important;
          color: #f1f5f9 !important;
        }
        [class*="ptRow"]:hover, [class*="navBtn"]:hover,
        [class*="th"], [class*="ptHeader"] {
          background: rgba(255,255,255,0.03) !important;
        }
        [class*="navBtn"] { color: #94a3b8 !important; }
        [class*="navBtnActive"] {
          background: rgba(45,212,191,0.16) !important;
          color: #2DD4BF !important;
        }
        [class*="overlay"] { background: rgba(0,0,0,0.7) !important; }
        [class*="btnOutline"] {
          border-color: rgba(255,255,255,0.12) !important;
          color: #94a3b8 !important;
        }
        [class*="popupInfo"], [class*="resumeItem"], [class*="histItem"],
        [class*="popupStat"], [class*="popupItem"], [class*="sessionInfo"] {
          background: #0f172a !important;
          border-color: rgba(255,255,255,0.06) !important;
          color: #94a3b8 !important;
        }
        [class*="cardHead"], [class*="cardFooter"], [class*="formFooter"],
        [class*="popupHead"], [class*="popupFooter"], [class*="tabs"],
        [class*="searchBar"], [class*="footer"], [class*="statItem"],
        [class*="infoRow"], [class*="pointTop"], [class*="ptRow"] {
          border-color: rgba(255,255,255,0.06) !important;
        }
        [class*="dropdown"] {
          background: #1e293b !important;
          border-color: rgba(255,255,255,0.08) !important;
        }
        [class*="option"] { color: #94a3b8 !important; }
        [class*="option"]:hover {
          background: rgba(255,255,255,0.05) !important;
          color: #f1f5f9 !important;
        }
        [class*="kpiCardSolde"] {
          background: linear-gradient(160deg, #1a2744, #1e293b) !important;
        }
        [class*="themeLabel"] {
          background: #1e293b !important;
          color: #94a3b8 !important;
        }
      `;
      document.head.appendChild(style);
    }

    localStorage.setItem("weu-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  async function fetchUser() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setEmail(user?.email || "");
    const { data } = await supabase
      .from("utilisateur")
      .select("*")
      .eq("auth_id", user.id)
      .single();
    if (data) {
      setUtilisateur(data);
      setNom(data.nom || "");
    }
    setLoading(false);
  }

  async function handleSauvegarderProfil(e) {
    e.preventDefault();
    setErrorProfil("");
    setSuccessProfil("");
    if (!nom) {
      setErrorProfil("Le nom ne peut pas être vide");
      return;
    }
    setLoadingProfil(true);
    const { error } = await supabase
      .from("utilisateur")
      .update({ nom })
      .eq("id_utilisateur", utilisateur.id_utilisateur);
    if (error) {
      setErrorProfil("Erreur : " + error.message);
    } else {
      setSuccessProfil("Profil mis à jour avec succès !");
      fetchUser();
    }
    setLoadingProfil(false);
  }

  async function handleChangerMdp(e) {
    e.preventDefault();
    setErrorMdp("");
    setSuccessMdp("");
    if (!ancienMdp || !nouveauMdp || !confirmMdp) {
      setErrorMdp("Veuillez remplir tous les champs");
      return;
    }
    if (nouveauMdp !== confirmMdp) {
      setErrorMdp("Les mots de passe ne correspondent pas");
      return;
    }
    if (nouveauMdp.length < 8) {
      setErrorMdp("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoadingMdp(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: ancienMdp,
    });
    if (signInError) {
      setErrorMdp("Ancien mot de passe incorrect");
      setLoadingMdp(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    if (error) {
      setErrorMdp("Erreur : " + error.message);
    } else {
      setSuccessMdp("Mot de passe modifié avec succès !");
      setAncienMdp("");
      setNouveauMdp("");
      setConfirmMdp("");
    }
    setLoadingMdp(false);
  }

  async function handleDeconnexion() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading)
    return (
      <Layout>
        <div style={{ padding: 40, color: "#8A90A0" }}>Chargement...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.title}>Paramètres</div>
          <div className={styles.sub}>Gestion du compte et préférences</div>
        </div>

        <div className={styles.grid}>
          {/* Colonne gauche */}
          <div className={styles.leftCol}>
            {/* Profil */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardHeadLeft}>
                  <div
                    className={styles.cardIcon}
                    style={{ background: "rgba(45,212,191,0.12)" }}
                  >
                    <ion-icon
                      name="person-outline"
                      style={{ color: "#2DD4BF", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.cardTitle}>Profil</div>
                    <div className={styles.cardSub}>
                      Vos informations personnelles
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSauvegarderProfil}>
                {errorProfil && (
                  <div className={styles.alertError}>{errorProfil}</div>
                )}
                {successProfil && (
                  <div className={styles.alertSuccess}>{successProfil}</div>
                )}
                <div className={styles.formBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nom</label>
                    <input
                      className={styles.input}
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      className={`${styles.input} ${styles.inputDisabled}`}
                      value={email}
                      disabled
                    />
                    <span className={styles.inputHint}>
                      L'email ne peut pas être modifié
                    </span>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Rôle</label>
                    <input
                      className={`${styles.input} ${styles.inputDisabled}`}
                      value={utilisateur?.role || "super_admin"}
                      disabled
                    />
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <button
                    type="submit"
                    className={styles.btnTeal}
                    disabled={loadingProfil}
                  >
                    <ion-icon name="checkmark-outline"></ion-icon>
                    {loadingProfil ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </form>
            </div>

            {/* Mot de passe */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardHeadLeft}>
                  <div
                    className={styles.cardIcon}
                    style={{ background: "rgba(251,191,36,0.12)" }}
                  >
                    <ion-icon
                      name="lock-closed-outline"
                      style={{ color: "#FBBF24", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.cardTitle}>Mot de passe</div>
                    <div className={styles.cardSub}>
                      Modifier votre mot de passe
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleChangerMdp}>
                {errorMdp && (
                  <div className={styles.alertError}>{errorMdp}</div>
                )}
                {successMdp && (
                  <div className={styles.alertSuccess}>{successMdp}</div>
                )}
                <div className={styles.formBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ancien mot de passe</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={ancienMdp}
                      onChange={(e) => setAncienMdp(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nouveau mot de passe</label>
                    <input
                      className={styles.input}
                      type="password"
                      value={nouveauMdp}
                      onChange={(e) => setNouveauMdp(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Confirmer le mot de passe
                    </label>
                    <input
                      className={styles.input}
                      type="password"
                      value={confirmMdp}
                      onChange={(e) => setConfirmMdp(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <button
                    type="submit"
                    className={styles.btnTeal}
                    disabled={loadingMdp}
                  >
                    <ion-icon name="key-outline"></ion-icon>
                    {loadingMdp ? "Modification..." : "Changer le mot de passe"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Colonne droite */}
          <div className={styles.rightCol}>
            {/* Apparence */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardHeadLeft}>
                  <div
                    className={styles.cardIcon}
                    style={{ background: "rgba(147,51,234,0.12)" }}
                  >
                    <ion-icon
                      name="color-palette-outline"
                      style={{ color: "#9333ea", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.cardTitle}>Apparence</div>
                    <div className={styles.cardSub}>Thème de l'interface</div>
                  </div>
                </div>
              </div>
              <div className={styles.formBody}>
                <div className={styles.toggleRow}>
                  <div>
                    <div className={styles.toggleLabel}>Mode sombre</div>
                    <div className={styles.toggleSub}>
                      Adapte l'interface pour les environnements peu éclairés
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${styles.toggle} ${darkMode ? styles.toggleOn : ""}`}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    <span className={styles.toggleThumb}></span>
                  </button>
                </div>

                <div className={styles.themePreview}>
                  <div
                    className={`${styles.themeCard} ${!darkMode ? styles.themeCardActive : ""}`}
                    onClick={() => setDarkMode(false)}
                  >
                    <div className={styles.themePreviewLight}>
                      <div className={styles.themePreviewBar}></div>
                      <div className={styles.themePreviewContent}></div>
                    </div>
                    <div className={styles.themeLabel}>
                      {!darkMode && (
                        <ion-icon
                          name="checkmark-circle"
                          style={{ color: "#2DD4BF", fontSize: 14 }}
                        ></ion-icon>
                      )}
                      Clair
                    </div>
                  </div>
                  <div
                    className={`${styles.themeCard} ${darkMode ? styles.themeCardActive : ""}`}
                    onClick={() => setDarkMode(true)}
                  >
                    <div className={styles.themePreviewDark}>
                      <div className={styles.themePreviewBarDark}></div>
                      <div className={styles.themePreviewContentDark}></div>
                    </div>
                    <div className={styles.themeLabel}>
                      {darkMode && (
                        <ion-icon
                          name="checkmark-circle"
                          style={{ color: "#2DD4BF", fontSize: 14 }}
                        ></ion-icon>
                      )}
                      Sombre
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos quartier */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardHeadLeft}>
                  <div
                    className={styles.cardIcon}
                    style={{ background: "rgba(52,211,153,0.12)" }}
                  >
                    <ion-icon
                      name="map-outline"
                      style={{ color: "#34D399", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.cardTitle}>
                      Informations du quartier
                    </div>
                    <div className={styles.cardSub}>
                      Données de configuration
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.formBody}>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Quartier</div>
                  <div className={styles.infoVal}>Madina</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Cotisation mensuelle</div>
                  <div className={styles.infoVal}>3 000 FC</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Agent terrain</div>
                  <div className={styles.infoVal}>Hamidou</div>
                </div>
                <div className={styles.infoRow}>
                  <div className={styles.infoLabel}>Version</div>
                  <div className={styles.infoVal}>Weu v1.0</div>
                </div>
              </div>
            </div>

            {/* Déconnexion */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardHeadLeft}>
                  <div
                    className={styles.cardIcon}
                    style={{ background: "rgba(251,113,133,0.12)" }}
                  >
                    <ion-icon
                      name="log-out-outline"
                      style={{ color: "#FB7185", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.cardTitle}>Session</div>
                    <div className={styles.cardSub}>Gérer votre connexion</div>
                  </div>
                </div>
              </div>
              <div className={styles.formBody}>
                <div className={styles.sessionInfo}>
                  Connecté en tant que{" "}
                  <strong>{utilisateur?.nom || email}</strong>
                </div>
                <button className={styles.btnRouge} onClick={handleDeconnexion}>
                  <ion-icon name="log-out-outline"></ion-icon>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Parametres;
