import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Tournees.module.css";

function Tournees() {
  const [tournees, setTournees] = useState([]);
  const [points, setPoints] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [menages, setMenages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tourneeSelectionnee, setTourneeSelectionnee] = useState(null);
  const [detailsTournee, setDetailsTournee] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [tourneesRes, pointsRes, pointagesRes, menagesRes] =
      await Promise.all([
        supabase
          .from("tournee")
          .select("*, utilisateur(nom)")
          .order("date", { ascending: false }),
        supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
        supabase
          .from("pointage")
          .select("id_point")
          .eq("statut_sync", "synchronisé"),
        supabase.from("menage").select("id_point").eq("statut", "actif"),
      ]);

    if (!tourneesRes.error) setTournees(tourneesRes.data);
    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    setLoading(false);
  }

  async function ouvrirDetails(tournee) {
    setTourneeSelectionnee(tournee);
    setLoadingDetails(true);

    const { data } = await supabase
      .from("tournee_point")
      .select("*, point_collecte(nom, secteur(nom))")
      .eq("id_tournee", tournee.id_tournee)
      .order("heure_vidage");

    setDetailsTournee(data || []);
    setLoadingDetails(false);
  }

  function getNbPointages(idPoint) {
    return pointages.filter((p) => p.id_point === idPoint).length;
  }

  function getNbMenages(idPoint) {
    return menages.filter((m) => m.id_point === idPoint).length;
  }

  function getPct(idPoint) {
    const nb = getNbPointages(idPoint);
    const nbMenages = getNbMenages(idPoint);
    if (nbMenages === 0) return 0;
    return Math.min(Math.round((nb / nbMenages) * 100), 100);
  }

  function getStatut(idPoint) {
    const pct = getPct(idPoint);
    if (pct >= 100) return "plein";
    if (pct >= 60) return "moyen";
    return "vide";
  }

  // KPIs
  const moisActuel = new Date().toISOString().slice(0, 7);
  const tourneesComois = tournees.filter((t) => t.date?.startsWith(moisActuel));
  const derniereTournee = tournees[0];

  // Points recommandés pour une tournée
  const pointsUrgents = points.filter((p) => getStatut(p.id_point) === "plein");
  const pointsMoyens = points.filter((p) => getStatut(p.id_point) === "moyen");
  const pointsVides = points.filter((p) => getStatut(p.id_point) === "vide");

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.title}>Tournées</div>
        <div className={styles.sub}>
          Supervision des collectes — Quartier Madina
        </div>

        {/* KPIs */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Tournées ce mois</div>
            <div className={styles.kpiVal} style={{ color: "#1a8f69" }}>
              {tourneesComois.length}
            </div>
            <div className={styles.kpiSub}>tournées effectuées</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Total tournées</div>
            <div className={styles.kpiVal} style={{ color: "#0d6349" }}>
              {tournees.length}
            </div>
            <div className={styles.kpiSub}>depuis le début</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Dernière tournée</div>
            <div
              className={styles.kpiVal}
              style={{ fontSize: 16, marginTop: 8, color: "#1a5c99" }}
            >
              {derniereTournee
                ? new Date(derniereTournee.date).toLocaleDateString("fr-FR")
                : "—"}
            </div>
            <div className={styles.kpiSub}>
              {derniereTournee?.utilisateur?.nom || "—"}
            </div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Points urgents</div>
            <div className={styles.kpiVal} style={{ color: "#c0392b" }}>
              {pointsUrgents.length}
            </div>
            <div className={styles.kpiSub}>à vider maintenant</div>
          </div>
        </div>

        {/* Recommandation */}
        <div className={styles.recommandation}>
          <div className={styles.recommandationTitle}>
            🚛 État actuel des points de collecte
          </div>
          <div className={styles.recommandationGrid}>
            {points.map((p) => {
              const pct = getPct(p.id_point);
              const statut = getStatut(p.id_point);
              return (
                <div
                  key={p.id_point}
                  className={`${styles.recommandationItem} ${
                    statut === "plein"
                      ? styles.recommandationItemPlein
                      : statut === "moyen"
                        ? styles.recommandationItemMoyen
                        : styles.recommandationItemVide
                  }`}
                >
                  <div>
                    <div className={styles.recommandationNom}>{p.nom}</div>
                    <div className={styles.recommandationSecteur}>
                      {p.secteur?.nom}
                    </div>
                  </div>
                  <div>
                    <div
                      className={styles.recommandationPct}
                      style={{
                        color:
                          statut === "plein"
                            ? "#8b1a1a"
                            : statut === "moyen"
                              ? "#7a4a00"
                              : "#1a5c35",
                      }}
                    >
                      {pct}%
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {statut === "plein" && (
                        <span className={styles.badgePlein}>🔴 Plein</span>
                      )}
                      {statut === "moyen" && (
                        <span className={styles.badgeMoyen}>🟠 Bientôt</span>
                      )}
                      {statut === "vide" && (
                        <span className={styles.badgeVide}>🟢 OK</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pointsUrgents.length > 0 && (
            <div
              style={{
                marginTop: 14,
                background: "#fdecea",
                border: "1px solid #f5b3b3",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "#8b1a1a",
                fontWeight: 500,
              }}
            >
              🚨 {pointsUrgents.length} point(s) plein(s) —{" "}
              {pointsUrgents.map((p) => p.nom).join(", ")} — Tournée urgente
              recommandée
            </div>
          )}

          {pointsUrgents.length === 0 && pointsMoyens.length > 0 && (
            <div
              style={{
                marginTop: 14,
                background: "#fdf0e0",
                border: "1px solid #f5d4a0",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "#7a4a00",
                fontWeight: 500,
              }}
            >
              ⚠️ {pointsMoyens.length} point(s) en remplissage —{" "}
              {pointsMoyens.map((p) => p.nom).join(", ")} — À surveiller
            </div>
          )}

          {pointsUrgents.length === 0 && pointsMoyens.length === 0 && (
            <div
              style={{
                marginTop: 14,
                background: "#e6f5ec",
                border: "1px solid #b8ddc8",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "#1a5c35",
                fontWeight: 500,
              }}
            >
              ✅ Tous les points sont dans un état acceptable — Aucune tournée
              urgente
            </div>
          )}
        </div>

        {/* Historique des tournées */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Historique des tournées</span>
            <span className={styles.cardCount}>
              {tournees.length} tournée(s)
            </span>
          </div>
          {loading ? (
            <div className={styles.tdLoading}>Chargement...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Agent</th>
                  <th className={styles.th}>Notes</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tournees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className={styles.tdEmpty}>
                      Aucune tournée enregistrée
                    </td>
                  </tr>
                ) : (
                  tournees.map((t, i) => (
                    <tr
                      key={t.id_tournee}
                      style={{ background: i % 2 === 0 ? "#fff" : "#f9fdf9" }}
                    >
                      <td className={styles.tdBold}>
                        {new Date(t.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className={styles.td}>{t.utilisateur?.nom || "—"}</td>
                      <td className={styles.td}>{t.notes || "—"}</td>
                      <td className={styles.td}>
                        <button
                          className={styles.btnVoir}
                          onClick={() => ouvrirDetails(t)}
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* POPUP DETAILS TOURNEE */}
      {tourneeSelectionnee && (
        <div
          className={styles.overlay}
          onClick={() => setTourneeSelectionnee(null)}
        >
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHead}>
              <div>
                <div className={styles.popupTitle}>
                  Tournée du{" "}
                  {new Date(tourneeSelectionnee.date).toLocaleDateString(
                    "fr-FR",
                  )}
                </div>
                <div className={styles.popupSub}>
                  Agent : {tourneeSelectionnee.utilisateur?.nom || "—"}
                </div>
              </div>
              <button
                className={styles.btnFermer}
                onClick={() => setTourneeSelectionnee(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.popupBody}>
              {tourneeSelectionnee.notes && (
                <>
                  <div className={styles.popupSection}>Notes</div>
                  <div className={styles.popupInfo}>
                    {tourneeSelectionnee.notes}
                  </div>
                </>
              )}

              <div className={styles.popupSection}>Points vidés</div>
              {loadingDetails ? (
                <div
                  style={{ textAlign: "center", color: "#7a9c8a", padding: 16 }}
                >
                  Chargement...
                </div>
              ) : detailsTournee.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#7a9c8a",
                    fontSize: 13,
                  }}
                >
                  Aucun détail disponible
                </div>
              ) : (
                detailsTournee.map((d, i) => (
                  <div key={i} className={styles.popupItem}>
                    <div>
                      <div className={styles.popupItemNom}>
                        {d.point_collecte?.nom || "—"}
                      </div>
                      <div className={styles.popupItemSub}>
                        Secteur {d.point_collecte?.secteur?.nom || "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0d6349",
                        }}
                      >
                        {d.nb_pointages_au_vidage} pointages
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#7a9c8a", marginTop: 2 }}
                      >
                        {new Date(d.heure_vidage).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Tournees;
