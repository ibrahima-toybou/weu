import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import Select from "../components/Select";
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
  const [historique, setHistorique] = useState([]);

  // Popup détail
  const [pointDetail, setPointDetail] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [nomEdit, setNomEdit] = useState("");
  const [adresseEdit, setAdresseEdit] = useState("");
  const [secteurEdit, setSecteurEdit] = useState("");
  const [successEdit, setSuccessEdit] = useState("");
  const [errorEdit, setErrorEdit] = useState("");
  const [menagesAssignes, setMenagesAssignes] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [pointsRes, pointagesRes, menagesRes, secteursRes, historiqueRes] =
      await Promise.all([
        supabase.from("point_collecte").select("*, secteur(nom)").order("nom"),
        supabase
          .from("pointage")
          .select("id_point, id_pointage")
          .eq("statut_sync", "synchronisé"),
        supabase.from("menage").select("id_point").eq("statut", "actif"),
        supabase.from("secteur").select("*").order("nom"),
        supabase
          .from("tournee_point")
          .select(
            "*, point_collecte(nom, secteur(nom)), tournee(date, statut, utilisateur:id_utilisateur(nom))",
          )
          .not("heure_vidage", "is", null)
          .order("heure_vidage", { ascending: false })
          .limit(20),
      ]);
    if (!pointsRes.error) setPoints(pointsRes.data);
    if (!pointagesRes.error) setPointages(pointagesRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!secteursRes.error) setSecteurs(secteursRes.data);
    if (!historiqueRes.error) setHistorique(historiqueRes.data);
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
      return (
        <span className={styles.badgePlein}>
          <ion-icon name="ellipse" style={{ fontSize: 8 }}></ion-icon> Plein
        </span>
      );
    if (statut === "moyen")
      return (
        <span className={styles.badgeMoyen}>
          <ion-icon name="ellipse" style={{ fontSize: 8 }}></ion-icon> En
          remplissage
        </span>
      );
    return (
      <span className={styles.badgeVide}>
        <ion-icon name="ellipse" style={{ fontSize: 8 }}></ion-icon> Vide
      </span>
    );
  }

  async function ouvrirDetail(p) {
    setPointDetail(p);
    setModeEdition(false);
    setNomEdit(p.nom);
    setAdresseEdit(p.adresse || "");
    setSecteurEdit(String(p.id_secteur));
    setSuccessEdit("");
    setErrorEdit("");
    setDetailLoading(true);

    const { data: menagesData } = await supabase
      .from("menage")
      .select("id_menage, nom, telephone, statut")
      .eq("id_point", p.id_point)
      .order("nom");

    setMenagesAssignes(menagesData || []);
    setDetailLoading(false);
  }

  function fermerDetail() {
    setPointDetail(null);
    setMenagesAssignes([]);
    setModeEdition(false);
  }

  async function confirmerVidage() {
    if (!pointAVider) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    const { data: tournee } = await supabase
      .from("tournee")
      .insert({
        date: new Date().toISOString().split("T")[0],
        id_utilisateur: utilisateur.id_utilisateur,
        cree_par: utilisateur.id_utilisateur,
        statut: "terminée",
        acceptee_par_agent: true,
        notes: `Vidage manuel du point ${pointAVider.nom}`,
      })
      .select()
      .single();

    if (tournee) {
      await supabase.from("tournee_point").insert({
        id_tournee: tournee.id_tournee,
        id_point: pointAVider.id_point,
        heure_vidage: new Date().toISOString(),
        nb_pointages_au_vidage: getNbPointages(pointAVider.id_point),
      });

      await supabase
        .from("pointage")
        .update({ statut_sync: "archivé" })
        .eq("id_point", pointAVider.id_point)
        .eq("statut_sync", "synchronisé");
    }

    setSuccessVidage(`Point ${pointAVider.nom} vidé avec succès !`);
    setPointAVider(null);
    fermerDetail();
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

  async function handleModifierPoint(e) {
    e.preventDefault();
    setErrorEdit("");
    setSuccessEdit("");

    if (!nomEdit || !secteurEdit) {
      setErrorEdit("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const { error } = await supabase
      .from("point_collecte")
      .update({
        nom: nomEdit,
        adresse: adresseEdit || "À définir",
        id_secteur: parseInt(secteurEdit),
      })
      .eq("id_point", pointDetail.id_point);

    if (error) {
      setErrorEdit("Erreur lors de la modification : " + error.message);
    } else {
      setSuccessEdit("Point modifié avec succès !");
      setModeEdition(false);
      fetchData();
      setPointDetail((prev) => ({
        ...prev,
        nom: nomEdit,
        adresse: adresseEdit,
        id_secteur: parseInt(secteurEdit),
      }));
    }
  }

  const pleins = points.filter((p) => getStatut(p.id_point) === "plein").length;
  const moyens = points.filter((p) => getStatut(p.id_point) === "moyen").length;
  const totalPointages = pointages.length;

  const detailNbPointages = pointDetail
    ? getNbPointages(pointDetail.id_point)
    : 0;
  const detailNbMenages = pointDetail ? getNbMenages(pointDetail.id_point) : 0;
  const detailPct =
    detailNbMenages > 0
      ? Math.round((detailNbPointages / detailNbMenages) * 100)
      : 0;
  const detailStatut = pointDetail ? getStatut(pointDetail.id_point) : "vide";

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.title}>Points de collecte</div>
          <div className={styles.sub}>État en temps réel · Quartier Madina</div>
        </div>

        {successVidage && (
          <div className={styles.alertSuccess} style={{ marginBottom: 16 }}>
            {successVidage}
          </div>
        )}

        <div className={styles.gridTop}>
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>
                Ajouter un point de collecte
              </span>
            </div>
            <form onSubmit={handleAjouterPoint}>
              {errorForm && (
                <div
                  className={styles.alertError}
                  style={{ margin: "14px 24px 0" }}
                >
                  {errorForm}
                </div>
              )}
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
                  <Select
                    value={secteurIdPoint}
                    onChange={(e) => setSecteurIdPoint(e.target.value)}
                    placeholder="Sélectionner un secteur..."
                    options={secteurs.map((s) => ({
                      value: String(s.id_secteur),
                      label: s.nom,
                    }))}
                  />
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
                    setErrorForm("");
                    setSuccessForm("");
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className={styles.btnGreen}>
                  <ion-icon name="add-outline"></ion-icon>
                  Ajouter le point
                </button>
              </div>
            </form>
          </div>

          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Vue d'ensemble</span>
            </div>
            <div className={styles.statsBox}>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(45,212,191,0.12)" }}
                  >
                    <ion-icon
                      name="location-outline"
                      style={{ color: "#2DD4BF", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Points actifs</div>
                    <div className={styles.statSub}>opérationnels</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#2DD4BF" }}>
                  {points.length}
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
                    <div className={styles.statLabel}>Points pleins</div>
                    <div className={styles.statSub}>à vider en priorité</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#FB7185" }}>
                  {pleins}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(251,191,36,0.12)" }}
                  >
                    <ion-icon
                      name="warning-outline"
                      style={{ color: "#FBBF24", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>En remplissage</div>
                    <div className={styles.statSub}>à surveiller</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#FBBF24" }}>
                  {moyens}
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(52,211,153,0.12)" }}
                  >
                    <ion-icon
                      name="hand-right-outline"
                      style={{ color: "#34D399", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Pointages actifs</div>
                    <div className={styles.statSub}>depuis dernier vidage</div>
                  </div>
                </div>
                <div className={styles.statVal} style={{ color: "#34D399" }}>
                  {totalPointages}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <div
                  key={p.id_point}
                  className={`${getCardClass(statut)} ${styles.pointCardClickable}`}
                  onClick={() => ouvrirDetail(p)}
                >
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
                    <ion-icon
                      name="people-outline"
                      style={{ fontSize: 14 }}
                    ></ion-icon>
                    <strong>{nbMenages}</strong> ménages affectés
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Historique des vidages</span>
            <span className={styles.cardCount}>
              {historique.length} vidage(s)
            </span>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Point</th>
                <th className={styles.th}>Secteur</th>
                <th className={styles.th}>Date vidage</th>
                <th className={styles.th}>Heure</th>
                <th className={styles.th}>Pointages au vidage</th>
              </tr>
            </thead>
            <tbody>
              {historique.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.tdEmpty}>
                    Aucun vidage enregistré
                  </td>
                </tr>
              ) : (
                historique.map((h, i) => (
                  <tr key={i}>
                    <td className={styles.tdBold}>
                      {h.point_collecte?.nom || "—"}
                    </td>
                    <td className={styles.td}>
                      {h.point_collecte?.secteur?.nom || "—"}
                    </td>
                    <td className={styles.td}>
                      {h.tournee?.date
                        ? new Date(h.tournee.date).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className={styles.td}>
                      {h.heure_vidage
                        ? new Date(h.heure_vidage).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className={styles.td}>{h.nb_pointages_au_vidage}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP CONFIRMATION VIDAGE */}
      {pointAVider && (
        <div className={styles.overlayTop} onClick={() => setPointAVider(null)}>
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
              <div className={styles.alertWarning}>
                <ion-icon name="warning-outline"></ion-icon>
                <strong>
                  {getNbPointages(pointAVider.id_point)} pointages
                </strong>{" "}
                seront archivés.
              </div>
              <button
                className={styles.btnConfirmerRed}
                onClick={confirmerVidage}
              >
                <ion-icon name="car-outline"></ion-icon>
                Confirmer le vidage
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

      {/* POPUP DÉTAIL POINT (2 colonnes) */}
      {pointDetail && (
        <div className={styles.overlay} onClick={fermerDetail}>
          <div
            className={styles.detailPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.detailHeader}>
              <div>
                <div className={styles.detailNom}>{pointDetail.nom}</div>
                <div className={styles.detailSub}>
                  Secteur {pointDetail.secteur?.nom}
                  <span style={{ marginLeft: 10 }}>
                    {getBadge(detailStatut)}
                  </span>
                </div>
              </div>
              <button className={styles.btnFermer} onClick={fermerDetail}>
                ✕
              </button>
            </div>

            {errorEdit && (
              <div
                className={styles.alertError}
                style={{ margin: "16px 24px 0" }}
              >
                {errorEdit}
              </div>
            )}
            {successEdit && (
              <div
                className={styles.alertSuccess}
                style={{ margin: "16px 24px 0" }}
              >
                {successEdit}
              </div>
            )}

            <div className={styles.detailBody}>
              <div className={styles.detailColumn}>
                {!modeEdition ? (
                  <>
                    <div className={styles.detailSection}>Informations</div>
                    <div className={styles.detailInfoGrid}>
                      <div className={styles.detailInfoItem}>
                        <div className={styles.detailInfoLabel}>Adresse</div>
                        <div className={styles.detailInfoVal}>
                          {pointDetail.adresse || "Non renseignée"}
                        </div>
                      </div>
                      <div className={styles.detailInfoItem}>
                        <div className={styles.detailInfoLabel}>Secteur</div>
                        <div className={styles.detailInfoVal}>
                          {pointDetail.secteur?.nom || "—"}
                        </div>
                      </div>
                      <div className={styles.detailInfoItem}>
                        <div className={styles.detailInfoLabel}>
                          Seuil d'alerte
                        </div>
                        <div className={styles.detailInfoVal}>
                          {pointDetail.seuil_alerte || 60}%
                        </div>
                      </div>
                      <div className={styles.detailInfoItem}>
                        <div className={styles.detailInfoLabel}>
                          Remplissage
                        </div>
                        <div className={styles.detailInfoVal}>{detailPct}%</div>
                      </div>
                    </div>

                    <div className={styles.detailSection}>Statistiques</div>
                    <div
                      className={styles.detailStatsRow}
                      style={{ gridTemplateColumns: "1fr 1fr" }}
                    >
                      <div className={styles.detailStatCard}>
                        <div
                          className={styles.detailStatVal}
                          style={{ color: "#2DD4BF" }}
                        >
                          {detailNbPointages}
                        </div>
                        <div className={styles.detailStatLabel}>
                          Pointages actuels
                        </div>
                      </div>
                      <div className={styles.detailStatCard}>
                        <div
                          className={styles.detailStatVal}
                          style={{ color: "#3B82F6" }}
                        >
                          {detailNbMenages}
                        </div>
                        <div className={styles.detailStatLabel}>
                          Ménages affectés
                        </div>
                      </div>
                    </div>

                    <button
                      className={styles.btnDetails}
                      style={{ marginTop: 20 }}
                      onClick={() => setModeEdition(true)}
                    >
                      <ion-icon name="create-outline"></ion-icon>
                      Modifier les informations
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.detailSection}>
                      Modifier le point
                    </div>
                    <form
                      onSubmit={handleModifierPoint}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Nom du point *</label>
                        <input
                          className={styles.input}
                          value={nomEdit}
                          onChange={(e) => setNomEdit(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Adresse</label>
                        <input
                          className={styles.input}
                          value={adresseEdit}
                          onChange={(e) => setAdresseEdit(e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Secteur *</label>
                        <Select
                          value={secteurEdit}
                          onChange={(e) => setSecteurEdit(e.target.value)}
                          options={secteurs.map((s) => ({
                            value: String(s.id_secteur),
                            label: s.nom,
                          }))}
                        />
                      </div>
                      <button type="submit" className={styles.btnConfirmer}>
                        <ion-icon name="checkmark-outline"></ion-icon>
                        Enregistrer les modifications
                      </button>
                      <button
                        type="button"
                        className={styles.btnAnnuler}
                        onClick={() => setModeEdition(false)}
                      >
                        Annuler
                      </button>
                    </form>
                  </>
                )}
              </div>

              <div className={styles.detailColumn}>
                <div className={styles.detailSection}>
                  Ménages assignés ({menagesAssignes.length})
                </div>
                {detailLoading ? (
                  <div className={styles.detailEmpty}>Chargement...</div>
                ) : menagesAssignes.length === 0 ? (
                  <div className={styles.detailEmpty}>
                    Aucun ménage assigné à ce point
                  </div>
                ) : (
                  <div
                    className={styles.detailList}
                    style={{ maxHeight: 260, overflowY: "auto" }}
                  >
                    {menagesAssignes.map((m) => (
                      <div key={m.id_menage} className={styles.detailListItem}>
                        <div className={styles.detailListLeft}>
                          <div className={styles.detailListTitle}>{m.nom}</div>
                          <div className={styles.detailListSub}>
                            {m.telephone || "Pas de téléphone"}
                          </div>
                        </div>
                        <span
                          className={
                            m.statut === "actif"
                              ? styles.badgeVide
                              : styles.badgeMoyen
                          }
                        >
                          {m.statut === "actif" ? "Actif" : m.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.detailSection}>Actions</div>
                <div className={styles.detailActions}>
                  {detailStatut === "plein" && (
                    <button
                      className={styles.btnVider}
                      onClick={() => setPointAVider(pointDetail)}
                    >
                      <ion-icon name="car-outline"></ion-icon>
                      Marquer comme vidé
                    </button>
                  )}
                  {detailStatut !== "plein" && (
                    <div className={styles.popupInfo} style={{ fontSize: 13 }}>
                      Ce point n'a pas besoin d'être vidé pour le moment (
                      {detailPct}% de remplissage).
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Points;
