import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Cotisations.module.css";

function Cotisations() {
  const [menages, setMenages] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [moisSelectionne, setMoisSelectionne] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const [menageSelectionne, setMenageSelectionne] = useState(null);
  const [historiquePopup, setHistoriquePopup] = useState([]);
  const [loadingPopup, setLoadingPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState("");
  const [successPopup, setSuccessPopup] = useState("");
  const [popupModifier, setPopupModifier] = useState(null);
  const [menageDetail, setMenageDetail] = useState(null);

  useEffect(() => {
    fetchData();
  }, [moisSelectionne]);

  async function fetchData() {
    setLoading(true);
    const periodeDebut = moisSelectionne + "-01";
    const [menagesRes, cotisationsRes] = await Promise.all([
      supabase
        .from("menage")
        .select(
          "id_menage, nom, date_inscription, secteur(nom), point_collecte(nom)",
        )
        .eq("statut", "actif")
        .order("nom"),
      supabase.from("cotisation").select("*").eq("periode", periodeDebut),
    ]);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!cotisationsRes.error) setCotisations(cotisationsRes.data);
    setLoading(false);
  }

  function estInscritAuMois(menage) {
    if (!menage.date_inscription) return false;
    const inscription = new Date(menage.date_inscription);
    const debutCotisation = new Date(
      inscription.getFullYear(),
      inscription.getMonth() + 1,
      1,
    );
    const moisCible = new Date(moisSelectionne + "-01");
    return debutCotisation <= moisCible;
  }

  function getCotisationMenage(idMenage) {
    return cotisations.find((c) => c.id_menage === idMenage) || null;
  }

  async function ouvrirPopup(menage) {
    setMenageSelectionne(menage);
    setErrorPopup("");
    setSuccessPopup("");
    setLoadingPopup(true);
    const [historiqueRes, menageRes] = await Promise.all([
      supabase
        .from("cotisation")
        .select("*")
        .eq("id_menage", menage.id_menage)
        .order("periode", { ascending: false })
        .limit(6),
      supabase
        .from("menage")
        .select("date_inscription")
        .eq("id_menage", menage.id_menage)
        .single(),
    ]);
    setHistoriquePopup(historiqueRes.data || []);
    setMenageDetail(menageRes.data || null);
    setLoadingPopup(false);
  }

  function fermerPopup() {
    setMenageSelectionne(null);
    setHistoriquePopup([]);
    setErrorPopup("");
    setSuccessPopup("");
  }

  async function modifierStatut(statut) {
    const cotisation = getCotisationMenage(popupModifier.id_menage);
    const periodeDebut = moisSelectionne + "-01";
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    const datePaiement =
      statut === "payé" ? new Date().toISOString().split("T")[0] : null;

    const payload = {
      statut,
      date_paiement: datePaiement,
      montant: statut === "exonéré" ? 0 : 3000,
      mode_paiement: statut === "payé" ? "cash" : null,
      id_utilisateur: utilisateur.id_utilisateur,
    };

    if (cotisation) {
      await supabase
        .from("cotisation")
        .update(payload)
        .eq("id_cotisation", cotisation.id_cotisation);
    } else {
      await supabase.from("cotisation").insert({
        id_menage: popupModifier.id_menage,
        periode: periodeDebut,
        ...payload,
      });
    }

    // Envoyer le reçu par email si payé
    if (statut === "payé") {
      const { data: menageData } = await supabase
        .from("menage")
        .select("nom, point_collecte(nom), secteur(nom)")
        .eq("id_menage", popupModifier.id_menage)
        .single();

      const { data: emailData } = await supabase
        .from("utilisateur")
        .select("email")
        .eq("id_menage", popupModifier.id_menage)
        .single();

      if (emailData?.email) {
        await supabase.functions.invoke("envoyer-facture", {
          body: {
            nom_menage: menageData?.nom || popupModifier.nom,
            email: emailData.email,
            periode: periodeDebut,
            montant: 3000,
            date_paiement: datePaiement,
            mode_paiement: "cash",
            point_collecte: menageData?.point_collecte?.nom || "",
            secteur: menageData?.secteur?.nom || "",
          },
        });
      }
    }

    setPopupModifier(null);
    fetchData();
  }

  function getPeriodeLabel(periode) {
    if (!periode) return "—";
    return new Date(periode).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }

  function getBadge(statut) {
    if (statut === "payé") return styles.badgePaye;
    if (statut === "en_retard") return styles.badgeRetard;
    return styles.badgeExonere;
  }

  function getBadgeLabel(statut) {
    if (statut === "payé") return "● Payé";
    if (statut === "en_retard") return "● En retard";
    return "● Exonéré";
  }

  const menagesActifsAuMois = menages.filter(estInscritAuMois);

  const menagesFiltres = menagesActifsAuMois.filter((m) => {
    const statut = getCotisationMenage(m.id_menage)?.statut || "en_retard";
    return (
      (onglet === "tous" || statut === onglet) &&
      m.nom.toLowerCase().includes(recherche.toLowerCase())
    );
  });

  const payes = menagesActifsAuMois.filter(
    (m) => getCotisationMenage(m.id_menage)?.statut === "payé",
  ).length;

  const retard = menagesActifsAuMois.filter((m) => {
    const c = getCotisationMenage(m.id_menage);
    return !c || c.statut === "en_retard";
  }).length;

  const exoneres = menagesActifsAuMois.filter(
    (m) => getCotisationMenage(m.id_menage)?.statut === "exonéré",
  ).length;

  const totalCollecte = cotisations
    .filter((c) => c.statut === "payé")
    .reduce((sum, c) => sum + parseFloat(c.montant || 0), 0);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.title}>Gestion des cotisations</div>
            <div className={styles.sub}>
              Suivi des paiements · Quartier Madina
            </div>
          </div>
          <div className={styles.moisSelector}>
            <span className={styles.moisLabel}>Mois :</span>
            <input
              className={styles.moisInput}
              type="month"
              value={moisSelectionne}
              onChange={(e) => setMoisSelectionne(e.target.value)}
            />
            <span style={{ fontSize: 13, color: "#6B7185" }}>
              {getPeriodeLabel(moisSelectionne + "-01")}
            </span>
          </div>
        </div>

        {/* GRID HAUT */}
        <div className={styles.gridTop}>
          {/* Tableau */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitle}>
                Ménages · {getPeriodeLabel(moisSelectionne + "-01")}
              </div>
              <span className={styles.cardCount}>
                {menagesFiltres.length} résultat(s)
              </span>
            </div>

            <div className={styles.tabs}>
              {[
                { key: "tous", label: "Tous" },
                { key: "payé", label: "Payés" },
                { key: "en_retard", label: "En retard" },
                { key: "exonéré", label: "Exonérés" },
              ].map((o) => (
                <button
                  key={o.key}
                  className={onglet === o.key ? styles.tabActive : styles.tab}
                  onClick={() => setOnglet(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className={styles.searchBar}>
              <input
                className={styles.searchInput}
                placeholder="Rechercher un ménage..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>

            {loading ? (
              <div className={styles.tdLoading}>Chargement...</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Ménage</th>
                    <th className={styles.th}>Secteur</th>
                    <th className={styles.th}>Point de collecte</th>
                    <th className={styles.th}>Statut</th>
                    <th className={styles.th}>Date paiement</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menagesFiltres.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.tdEmpty}>
                        Aucun ménage trouvé
                      </td>
                    </tr>
                  ) : (
                    menagesFiltres.map((m) => {
                      const cotisation = getCotisationMenage(m.id_menage);
                      const statut = cotisation?.statut || "en_retard";
                      return (
                        <tr key={m.id_menage}>
                          <td className={styles.tdBold}>{m.nom}</td>
                          <td className={styles.td}>{m.secteur?.nom || "—"}</td>
                          <td className={styles.td}>
                            {m.point_collecte?.nom || "—"}
                          </td>
                          <td className={styles.td}>
                            <span className={getBadge(statut)}>
                              {getBadgeLabel(statut)}
                            </span>
                          </td>
                          <td className={styles.td}>
                            {cotisation?.date_paiement
                              ? new Date(
                                  cotisation.date_paiement,
                                ).toLocaleDateString("fr-FR")
                              : "—"}
                          </td>
                          <td className={styles.td}>
                            <div className={styles.btnActions}>
                              <button
                                className={`${styles.btnIcon} ${styles.btnIconDetails}`}
                                onClick={() => ouvrirPopup(m)}
                                title="Voir détails"
                              >
                                <ion-icon name="eye-outline"></ion-icon>
                              </button>
                              <button
                                className={`${styles.btnIcon} ${styles.btnIconModifier}`}
                                onClick={() => setPopupModifier(m)}
                                title="Modifier"
                              >
                                <ion-icon name="create-outline"></ion-icon>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Stats */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Vue d'ensemble</span>
            </div>
            <div className={styles.statsBox}>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(52,211,153,0.12)" }}
                  >
                    <ion-icon
                      name="checkmark-circle-outline"
                      style={{ color: "#34D399", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Payés</div>
                    <div className={styles.statSub}>ménages à jour</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#34D399" }}>
                  {payes}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(251,113,133,0.12)" }}
                  >
                    <ion-icon
                      name="alert-circle-outline"
                      style={{ color: "#FB7185", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>En retard</div>
                    <div className={styles.statSub}>ménages en retard</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#FB7185" }}>
                  {retard}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(15,23,42,0.06)" }}
                  >
                    <ion-icon
                      name="remove-circle-outline"
                      style={{ color: "#8A90A0", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Exonérés</div>
                    <div className={styles.statSub}>cas particuliers</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#8A90A0" }}>
                  {exoneres}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(45,212,191,0.12)" }}
                  >
                    <ion-icon
                      name="wallet-outline"
                      style={{ color: "#2DD4BF", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Collecté</div>
                    <div className={styles.statSub}>ce mois</div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "Space Grotesk",
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#2DD4BF",
                  }}
                >
                  {totalCollecte.toLocaleString("fr-FR")} FC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP DETAILS */}
      {menageSelectionne && (
        <div className={styles.overlay} onClick={fermerPopup}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHead}>
              <div>
                <div className={styles.popupTitle}>{menageSelectionne.nom}</div>
                <div className={styles.popupSub}>
                  {menageSelectionne.point_collecte?.nom} ·{" "}
                  {menageSelectionne.secteur?.nom}
                </div>
              </div>
              <button className={styles.btnFermer} onClick={fermerPopup}>
                ✕
              </button>
            </div>
            <div className={styles.popupBody}>
              {!loadingPopup && (
                <>
                  <div className={styles.popupSection}>Résumé</div>
                  <div className={styles.resumeGrid}>
                    <div className={styles.resumeItem}>
                      <div
                        className={styles.resumeVal}
                        style={{ color: "#34D399" }}
                      >
                        {
                          historiquePopup.filter((h) => h.statut === "payé")
                            .length
                        }
                      </div>
                      <div className={styles.resumeLabel}>Mois payés</div>
                    </div>
                    <div className={styles.resumeItem}>
                      <div
                        className={styles.resumeVal}
                        style={{ color: "#FB7185" }}
                      >
                        {
                          historiquePopup.filter(
                            (h) => h.statut === "en_retard",
                          ).length
                        }
                      </div>
                      <div className={styles.resumeLabel}>Mois en retard</div>
                    </div>
                    <div className={styles.resumeItem}>
                      <div
                        className={styles.resumeVal}
                        style={{ color: "#2DD4BF" }}
                      >
                        {historiquePopup
                          .filter((h) => h.statut === "payé")
                          .reduce(
                            (sum, h) => sum + parseFloat(h.montant || 0),
                            0,
                          )
                          .toLocaleString("fr-FR")}{" "}
                        FC
                      </div>
                      <div className={styles.resumeLabel}>Total payé</div>
                    </div>
                    <div className={styles.resumeItem}>
                      <div
                        className={styles.resumeVal}
                        style={{ fontSize: 14, marginTop: 4 }}
                      >
                        {menageDetail?.date_inscription
                          ? new Date(
                              menageDetail.date_inscription,
                            ).toLocaleDateString("fr-FR")
                          : "—"}
                      </div>
                      <div className={styles.resumeLabel}>Inscrit le</div>
                    </div>
                  </div>

                  {(() => {
                    const total = historiquePopup.length;
                    const payes = historiquePopup.filter(
                      (h) => h.statut === "payé",
                    ).length;
                    const taux = total > 0 ? (payes / total) * 100 : 0;
                    if (taux >= 80)
                      return (
                        <div className={styles.payeurBon}>
                          <ion-icon name="star-outline"></ion-icon> Bon payeur{" "}
                          {Math.round(taux)}% de paiements à jour
                        </div>
                      );
                    if (taux >= 50)
                      return (
                        <div className={styles.payeurMoyen}>
                          <ion-icon name="warning-outline"></ion-icon> Payeur
                          irrégulier {Math.round(taux)}% de paiements à jour
                        </div>
                      );
                    return (
                      <div className={styles.payeurMauvais}>
                        <ion-icon name="close-outline"></ion-icon> Mauvais
                        payeur {Math.round(taux)}% de paiements à jour
                      </div>
                    );
                  })()}
                </>
              )}

              <div className={styles.popupSection} style={{ marginTop: 20 }}>
                Historique des 6 derniers mois
              </div>
              {loadingPopup ? (
                <div
                  style={{ textAlign: "center", color: "#8A90A0", padding: 16 }}
                >
                  Chargement...
                </div>
              ) : historiquePopup.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#8A90A0",
                    fontSize: 13,
                    padding: 16,
                  }}
                >
                  Aucun historique disponible
                </div>
              ) : (
                historiquePopup.map((h) => (
                  <div key={h.id_cotisation} className={styles.histItem}>
                    <span className={styles.histMois}>
                      {getPeriodeLabel(h.periode)}
                    </span>
                    <span className={styles.histMontant}>
                      {parseFloat(h.montant || 0).toLocaleString("fr-FR")} FC
                    </span>
                    <span className={getBadge(h.statut)}>
                      {getBadgeLabel(h.statut)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODIFIER */}
      {popupModifier && (
        <div className={styles.overlay} onClick={() => setPopupModifier(null)}>
          <div
            className={styles.popupModifier}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.popupHead}>
              <div>
                <div className={styles.popupTitle}>Modifier le statut</div>
                <div className={styles.popupSub}>
                  {popupModifier.nom} ·{" "}
                  {getPeriodeLabel(moisSelectionne + "-01")}
                </div>
              </div>
              <button
                className={styles.btnFermer}
                onClick={() => setPopupModifier(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.popupBody}>
              <div className={styles.popupSection}>
                Choisir le nouveau statut
              </div>
              <div className={styles.popupActions}>
                <button
                  className={styles.btnPayer}
                  onClick={() => modifierStatut("payé")}
                >
                  <ion-icon name="checkmark-circle-outline"></ion-icon> Marquer
                  comme payé — 3 000 FC
                </button>
                <button
                  className={styles.btnExonerer}
                  onClick={() => modifierStatut("exonéré")}
                >
                  <ion-icon name="remove-circle-outline"></ion-icon> Marquer
                  comme exonéré
                </button>
                <button
                  className={styles.btnRetard}
                  onClick={() => modifierStatut("en_retard")}
                >
                  <ion-icon name="close-circle-outline"></ion-icon> Marquer
                  comme en retard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Cotisations;
