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

  // Popup
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

    // Récupérer tous les ménages actifs
    const { data: menagesData } = await supabase
      .from("menage")
      .select("id_menage, nom, secteur(nom), point_collecte(nom)")
      .eq("statut", "actif")
      .order("nom");

    // Récupérer les cotisations du mois sélectionné
    const { data: cotisationsData } = await supabase
      .from("cotisation")
      .select("*")
      .eq("periode", periodeDebut);

    setMenages(menagesData || []);
    setCotisations(cotisationsData || []);
    setLoading(false);
  }

  function getCotisationMenage(idMenage) {
    return cotisations.find((c) => c.id_menage === idMenage) || null;
  }

  async function ouvrirPopup(menage) {
    setMenageSelectionne(menage);
    setErrorPopup("");
    setSuccessPopup("");
    setLoadingPopup(true);

    // Récupérer les 6 derniers mois de cotisations
    const { data: historique } = await supabase
      .from("cotisation")
      .select("*")
      .eq("id_menage", menage.id_menage)
      .order("periode", { ascending: false })
      .limit(6);

    // Récupérer la date d'inscription du ménage
    const { data: menageData } = await supabase
      .from("menage")
      .select("date_inscription")
      .eq("id_menage", menage.id_menage)
      .single();

    setHistoriquePopup(historique || []);
    setMenageDetail(menageData || null);
    setLoadingPopup(false);
  }

  function fermerPopup() {
    setMenageSelectionne(null);
    setHistoriquePopup([]);
    setErrorPopup("");
    setSuccessPopup("");
  }

  async function enregistrerPaiement() {
    setErrorPopup("");
    setSuccessPopup("");

    const cotisation = getCotisationMenage(menageSelectionne.id_menage);
    const periodeDebut = moisSelectionne + "-01";

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    if (cotisation) {
      // Mettre à jour la cotisation existante
      const { error } = await supabase
        .from("cotisation")
        .update({
          statut: "payé",
          date_paiement: new Date().toISOString().split("T")[0],
          mode_paiement: "cash",
          montant: 3000,
          id_utilisateur: utilisateur.id_utilisateur,
        })
        .eq("id_cotisation", cotisation.id_cotisation);

      if (error) {
        setErrorPopup("Erreur lors de l'enregistrement");
        return;
      }
    } else {
      // Créer une nouvelle cotisation
      const { error } = await supabase.from("cotisation").insert({
        id_menage: menageSelectionne.id_menage,
        periode: periodeDebut,
        montant: 3000,
        statut: "payé",
        date_paiement: new Date().toISOString().split("T")[0],
        mode_paiement: "cash",
        id_utilisateur: utilisateur.id_utilisateur,
      });

      if (error) {
        setErrorPopup("Erreur lors de l'enregistrement");
        return;
      }
    }

    setSuccessPopup("Paiement de 3 000 FC enregistré avec succès !");
    fetchData();
    ouvrirPopup(menageSelectionne);
  }

  async function exonerer() {
    setErrorPopup("");
    setSuccessPopup("");

    const cotisation = getCotisationMenage(menageSelectionne.id_menage);
    const periodeDebut = moisSelectionne + "-01";

    if (cotisation) {
      const { error } = await supabase
        .from("cotisation")
        .update({ statut: "exonéré", date_paiement: null, montant: 0 })
        .eq("id_cotisation", cotisation.id_cotisation);

      if (error) {
        setErrorPopup("Erreur lors de l'exonération");
        return;
      }
    } else {
      const { error } = await supabase.from("cotisation").insert({
        id_menage: menageSelectionne.id_menage,
        periode: periodeDebut,
        montant: 0,
        statut: "exonéré",
        date_paiement: null,
        mode_paiement: null,
        id_utilisateur: null,
      });

      if (error) {
        setErrorPopup("Erreur lors de l'exonération");
        return;
      }
    }

    setSuccessPopup("Ménage exonéré pour ce mois.");
    fetchData();
    ouvrirPopup(menageSelectionne);
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

    if (cotisation) {
      await supabase
        .from("cotisation")
        .update({
          statut,
          date_paiement:
            statut === "payé" ? new Date().toISOString().split("T")[0] : null,
          montant: statut === "exonéré" ? 0 : 3000,
          mode_paiement: statut === "payé" ? "cash" : null,
          id_utilisateur: utilisateur.id_utilisateur,
        })
        .eq("id_cotisation", cotisation.id_cotisation);
    } else {
      await supabase.from("cotisation").insert({
        id_menage: popupModifier.id_menage,
        periode: periodeDebut,
        montant: statut === "exonéré" ? 0 : 3000,
        statut,
        date_paiement:
          statut === "payé" ? new Date().toISOString().split("T")[0] : null,
        mode_paiement: statut === "payé" ? "cash" : null,
        id_utilisateur: utilisateur.id_utilisateur,
      });
    }

    setPopupModifier(null);
    fetchData();
  }

  function getPeriodeLabel(periode) {
    if (!periode) return "—";
    const date = new Date(periode);
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  function getBadge(statut) {
    if (statut === "payé") return styles.badgePaye;
    if (statut === "en_retard") return styles.badgeRetard;
    return styles.badgeExonere;
  }

  // Données filtrées
  const menagesFiltres = menages.filter((m) => {
    const cotisation = getCotisationMenage(m.id_menage);
    const statut = cotisation?.statut || "en_retard";
    const matchOnglet = onglet === "tous" || statut === onglet;
    const matchRecherche = m.nom
      .toLowerCase()
      .includes(recherche.toLowerCase());
    return matchOnglet && matchRecherche;
  });

  // KPIs
  const payes = menages.filter(
    (m) => getCotisationMenage(m.id_menage)?.statut === "payé",
  ).length;
  const retard = menages.filter((m) => {
    const c = getCotisationMenage(m.id_menage);
    return !c || c.statut === "en_retard";
  }).length;
  const exoneres = menages.filter(
    (m) => getCotisationMenage(m.id_menage)?.statut === "exonéré",
  ).length;
  const totalCollecte = cotisations
    .filter((c) => c.statut === "payé")
    .reduce((sum, c) => sum + parseFloat(c.montant || 0), 0);

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.title}>Gestion des cotisations</div>
        <div className={styles.sub}>Suivi des paiements — Quartier Madina</div>

        {/* Sélecteur de mois */}
        <div className={styles.moisSelector}>
          <span className={styles.moisLabel}>Mois sélectionné :</span>
          <input
            className={styles.moisInput}
            type="month"
            value={moisSelectionne}
            onChange={(e) => setMoisSelectionne(e.target.value)}
          />
          <span style={{ fontSize: 13, color: "#7a9c8a" }}>
            {getPeriodeLabel(moisSelectionne + "-01")}
          </span>
        </div>

        {/* KPIs */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Payés</div>
            <div className={styles.kpiVal} style={{ color: "#1a8f69" }}>
              {payes}
            </div>
            <div className={styles.kpiSub}>ménages à jour</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>En retard</div>
            <div className={styles.kpiVal} style={{ color: "#c0392b" }}>
              {retard}
            </div>
            <div className={styles.kpiSub}>ménages en retard</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Exonérés</div>
            <div className={styles.kpiVal} style={{ color: "#7a9c8a" }}>
              {exoneres}
            </div>
            <div className={styles.kpiSub}>cas particuliers</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Collecté</div>
            <div
              className={styles.kpiVal}
              style={{ color: "#0d6349", fontSize: 20, marginTop: 8 }}
            >
              {totalCollecte.toLocaleString("fr-FR")} FC
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>
              Ménages — {getPeriodeLabel(moisSelectionne + "-01")}
            </span>
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
                  <th className={styles.th}>Action</th>
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
                          <span className={getBadge(statut)}>{statut}</span>
                        </td>
                        <td className={styles.td}>
                          {cotisation?.date_paiement
                            ? new Date(
                                cotisation.date_paiement,
                              ).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td className={styles.td}>
                          <button
                            className={styles.btnDetails}
                            onClick={() => ouvrirPopup(m)}
                          >
                            Voir détails
                          </button>
                          <button
                            className={styles.btnModifier}
                            onClick={() => setPopupModifier(m)}
                          >
                            Modifier
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
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
              {/* Résumé */}
              {!loadingPopup && (
                <>
                  <div className={styles.popupSection}>Résumé</div>
                  <div className={styles.resumeGrid}>
                    <div className={styles.resumeItem}>
                      <div className={styles.resumeVal}>
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
                        style={{ color: "#c0392b" }}
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
                        style={{ color: "#0d6349" }}
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
                        style={{ fontSize: 13, marginTop: 4 }}
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

                  {/* Badge bon/mauvais payeur */}
                  {(() => {
                    const total = historiquePopup.length;
                    const payes = historiquePopup.filter(
                      (h) => h.statut === "payé",
                    ).length;
                    const taux = total > 0 ? (payes / total) * 100 : 0;
                    if (taux >= 80)
                      return (
                        <div className={styles.payeurBon}>
                          ⭐ Bon payeur — {Math.round(taux)}% de paiements à
                          jour
                        </div>
                      );
                    if (taux >= 50)
                      return (
                        <div className={styles.payeurMoyen}>
                          ⚠️ Payeur irrégulier — {Math.round(taux)}% de
                          paiements à jour
                        </div>
                      );
                    return (
                      <div className={styles.payeurMauvais}>
                        ❌ Mauvais payeur — {Math.round(taux)}% de paiements à
                        jour
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Historique */}
              <div className={styles.popupSection} style={{ marginTop: 20 }}>
                Historique des 6 derniers mois
              </div>
              {loadingPopup ? (
                <div
                  style={{ textAlign: "center", color: "#7a9c8a", padding: 16 }}
                >
                  Chargement...
                </div>
              ) : historiquePopup.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#7a9c8a",
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
                    <span className={getBadge(h.statut)}>{h.statut}</span>
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
                  ✅ Marquer comme payé — 3 000 FC
                </button>
                <button
                  className={styles.btnExonerer}
                  onClick={() => modifierStatut("exonéré")}
                >
                  🔘 Marquer comme exonéré
                </button>
                <button
                  className={styles.btnRetard}
                  onClick={() => modifierStatut("en_retard")}
                >
                  ❌ Marquer comme en retard
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
