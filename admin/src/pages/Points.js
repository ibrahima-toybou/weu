import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Points.module.css";

function Points() {
  const [points, setPoints] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pointAVider, setPointAVider] = useState(null);
  const [successVidage, setSuccessVidage] = useState("");
  const [menages, setMenages] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [nomPoint, setNomPoint] = useState("");
  const [adressePoint, setAdressePoint] = useState("");
  const [secteurIdPoint, setSecteurIdPoint] = useState("");
  const [seuilPoint, setSeuilPoint] = useState(60);
  const [errorForm, setErrorForm] = useState("");
  const [successForm, setSuccessForm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const [pointsRes, pointagesRes, menagesRes, secteursRes] =
      await Promise.all([
        supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
        supabase
          .from("pointage")
          .select("id_point, id_pointage")
          .eq("statut_sync", "synchronisé"),
        supabase.from("menage").select("id_point").eq("statut", "actif"),
        supabase.from("secteur").select("*").order("nom"),
      ]);

    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!secteursRes.error) setSecteurs(secteursRes.data);
    setLoading(false);
  }
  function getNbMenages(idPoint) {
    return menages.filter((m) => m.id_point === idPoint).length;
  }

  function getNbPointages(idPoint) {
    return pointages.filter((p) => p.id_point === idPoint).length;
  }

  function getStatut(idPoint) {
    const nb = getNbPointages(idPoint);
    const nbMenages = getNbMenages(idPoint);
    if (nbMenages === 0) return "vide";
    const taux = (nb / nbMenages) * 100;
    if (taux >= 100) return "plein";
    if (taux >= 60) return "moyen";
    return "vide";
  }

  function getBarClass(statut) {
    if (statut === "plein") return styles.barPlein;
    if (statut === "moyen") return styles.barMoyen;
    return styles.barVide;
  }

  function getCardClass(statut) {
    if (statut === "plein")
      return `${styles.pointCard} ${styles.pointCardPlein}`;
    if (statut === "moyen")
      return `${styles.pointCard} ${styles.pointCardMoyen}`;
    return `${styles.pointCard} ${styles.pointCardVide}`;
  }

  function getBadge(statut) {
    if (statut === "plein")
      return <span className={styles.badgePlein}>🔴 Plein</span>;
    if (statut === "moyen")
      return <span className={styles.badgeMoyen}>🟠 En remplissage</span>;
    return <span className={styles.badgeVide}>🟢 Vide</span>;
  }

  async function confirmerVidage() {
    if (!pointAVider) return;

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    // Créer une tournée
    const { data: tournee } = await supabase
      .from("tournee")
      .insert({
        date: new Date().toISOString().split("T")[0],
        id_utilisateur: utilisateur.id_utilisateur,
        notes: `Vidage manuel du point ${pointAVider.nom}`,
      })
      .select()
      .single();

    if (tournee) {
      // Enregistrer le point vidé
      await supabase.from("tournee_point").insert({
        id_tournee: tournee.id_tournee,
        id_point: pointAVider.id_point,
        heure_vidage: new Date().toISOString(),
        nb_pointages_au_vidage: getNbPointages(pointAVider.id_point),
      });

      // Remettre les pointages à zéro en les marquant comme archivés
      await supabase
        .from("pointage")
        .update({ statut_sync: "archivé" })
        .eq("id_point", pointAVider.id_point)
        .eq("statut_sync", "synchronisé");
    }

    setSuccessVidage(`Point ${pointAVider.nom} vidé avec succès !`);
    setPointAVider(null);
    fetchData();

    setTimeout(() => setSuccessVidage(""), 4000);
  }

  async function handleAjouterPoint(e) {
    e.preventDefault();
    setErrorForm("");
    setSuccessForm("");

    if (!nomPoint || !secteurIdPoint) {
      setErrorForm("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const { error } = await supabase.from("point_collecte").insert({
      nom: nomPoint,
      adresse: adressePoint || "À définir",
      id_secteur: parseInt(secteurIdPoint),
      seuil_alerte: parseInt(seuilPoint),
    });

    if (error) {
      setErrorForm("Erreur lors de la création : " + error.message);
    } else {
      setSuccessForm("Point de collecte créé avec succès !");
      setNomPoint("");
      setAdressePoint("");
      setSecteurIdPoint("");
      setSeuilPoint(60);
      fetchData();
    }
  }

  // KPIs
  const nbMenagesParPoint = (idPoint) => {
    return points.find((p) => p.id_point === idPoint)?.nb_menages || 0;
  };

  const pleins = points.filter((p) => {
    const nb = getNbPointages(p.id_point);
    return nb >= 10;
  }).length;

  const totalPointages = pointages.length;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.title}>Points de collecte</div>
        <div className={styles.sub}>État en temps réel — Quartier Madina</div>

        {successVidage && (
          <div className={styles.alertSuccess} style={{ marginBottom: 20 }}>
            {successVidage}
          </div>
        )}

        {/* KPIs */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Points actifs</div>
            <div className={styles.kpiVal} style={{ color: "#1a8f69" }}>
              {points.length}
            </div>
            <div className={styles.kpiSub}>
              sur {points.length} opérationnels
            </div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Points pleins</div>
            <div className={styles.kpiVal} style={{ color: "#c0392b" }}>
              {pleins}
            </div>
            <div className={styles.kpiSub}>à vider en priorité</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Pointages totaux</div>
            <div className={styles.kpiVal} style={{ color: "#0d6349" }}>
              {totalPointages}
            </div>
            <div className={styles.kpiSub}>depuis le dernier vidage</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Seuil d'alerte</div>
            <div
              className={styles.kpiVal}
              style={{ color: "#e8a020", fontSize: 20, marginTop: 8 }}
            >
              60%
            </div>
            <div className={styles.kpiSub}>des ménages affectés</div>
          </div>
        </div>
        {/* Formulaire ajout point */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>
              Ajouter un point de collecte
            </span>
          </div>
          <form onSubmit={handleAjouterPoint}>
            {errorForm && <div className={styles.alertError}>{errorForm}</div>}
            {successForm && (
              <div className={styles.alertSuccessForm}>{successForm}</div>
            )}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nom du point *</label>
                <input
                  className={styles.input}
                  placeholder="ex: Place du marché"
                  value={nomPoint}
                  onChange={(e) => setNomPoint(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Adresse</label>
                <input
                  className={styles.input}
                  placeholder="ex: Rue principale"
                  value={adressePoint}
                  onChange={(e) => setAdressePoint(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Secteur *</label>
                <select
                  className={styles.input}
                  value={secteurIdPoint}
                  onChange={(e) => setSecteurIdPoint(e.target.value)}
                >
                  <option value="">Sélectionner un secteur...</option>
                  {secteurs.map((s) => (
                    <option key={s.id_secteur} value={s.id_secteur}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.formFooter}>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={() => {
                  setNomPoint("");
                  setAdressePoint("");
                  setSecteurIdPoint("");
                  setSeuilPoint(60);
                  setErrorForm("");
                  setSuccessForm("");
                }}
              >
                Annuler
              </button>
              <button type="submit" className={styles.btnGreen}>
                ✓ Ajouter le point
              </button>
            </div>
          </form>
        </div>
        {/* Grille des points */}
        {loading ? (
          <div className={styles.tdLoading}>Chargement...</div>
        ) : (
          <div className={styles.pointsGrid}>
            {points.map((p) => {
              const nb = getNbPointages(p.id_point);
              const nbMenages = getNbMenages(p.id_point);
              const statut = getStatut(p.id_point);
              const pct =
                nbMenages > 0 ? Math.min((nb / nbMenages) * 100, 100) : 0;
              return (
                <div key={p.id_point} className={getCardClass(statut)}>
                  <div className={styles.pointTop}>
                    <div>
                      <div className={styles.pointNom}>{p.nom}</div>
                      <div className={styles.pointSecteur}>
                        Secteur {p.secteur?.nom}
                      </div>
                    </div>
                    {getBadge(statut)}
                  </div>

                  <div className={styles.barWrap}>
                    <div className={styles.barLabel}>
                      <span>Remplissage</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div
                        className={`${styles.barFill} ${getBarClass(statut)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className={styles.pointCount}>
                    <strong>{nb}</strong> pointages depuis le dernier vidage
                  </div>
                  <div className={styles.pointMenages}>
                    👥 <strong>{nbMenages}</strong> ménages affectés
                  </div>

                  {statut === "plein" && (
                    <button
                      className={styles.btnVider}
                      onClick={() => setPointAVider(p)}
                    >
                      🚛 Marquer comme vidé
                    </button>
                  )}
                  {statut === "moyen" && (
                    <button className={styles.btnSurveiller}>
                      ⏳ À surveiller
                    </button>
                  )}
                  {statut === "vide" && (
                    <button className={styles.btnOk}>✓ Pas urgent</button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Historique des vidages */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Historique des vidages</span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Point</th>
                <th className={styles.th}>Secteur</th>
                <th className={styles.th}>Date vidage</th>
                <th className={styles.th}>Nb pointages au vidage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className={styles.tdEmpty}>
                  Aucun vidage enregistré pour l'instant
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP CONFIRMATION VIDAGE */}
      {pointAVider && (
        <div className={styles.overlay} onClick={() => setPointAVider(null)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHead}>
              <div>
                <div className={styles.popupTitle}>Confirmer le vidage</div>
                <div className={styles.popupSub}>
                  {pointAVider.nom} · Secteur {pointAVider.secteur?.nom}
                </div>
              </div>
              <button
                className={styles.btnFermer}
                onClick={() => setPointAVider(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.popupBody}>
              <div className={styles.popupInfo}>
                Vous êtes sur le point de marquer le point{" "}
                <strong>{pointAVider.nom}</strong> comme vidé. Cette action va
                remettre le compteur à zéro et enregistrer une tournée
                automatiquement.
              </div>
              <div
                className={styles.popupInfo}
                style={{
                  background: "#fdf0e0",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #f5d4a0",
                }}
              >
                ⚠️{" "}
                <strong>
                  {getNbPointages(pointAVider.id_point)} pointages
                </strong>{" "}
                seront archivés.
              </div>
              <button className={styles.btnConfirmer} onClick={confirmerVidage}>
                ✓ Confirmer le vidage
              </button>
              <button
                className={styles.btnAnnuler}
                onClick={() => setPointAVider(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Points;
