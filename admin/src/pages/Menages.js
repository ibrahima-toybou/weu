import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import styles from "./Menages.module.css";
import Select from "../components/Select";

function Menages() {
  const [success, setSuccess] = useState("");
  const [menages, setMenages] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [points, setPoints] = useState([]);
  const [pointsFiltres, setPointsFiltres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [secteurId, setSecteurId] = useState("");
  const [pointId, setPointId] = useState("");
  const [email, setEmail] = useState("");

  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreSecteur, setFiltreSecteur] = useState("tous");
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (secteurId) {
      setPointsFiltres(
        points.filter((p) => p.id_secteur === parseInt(secteurId)),
      );
      setPointId("");
    } else {
      setPointsFiltres([]);
    }
  }, [secteurId, points]);

  async function fetchData() {
    setLoading(true);
    const [menagesRes, secteursRes, pointsRes] = await Promise.all([
      supabase
        .from("menage")
        .select("*, secteur(nom), point_collecte(nom)")
        .order("nom"),
      supabase.from("secteur").select("*").order("nom"),
      supabase.from("point_collecte").select("*").order("nom"),
    ]);
    if (!menagesRes.error) setMenages(menagesRes.data);
    if (!secteursRes.error) setSecteurs(secteursRes.data);
    if (!pointsRes.error) setPoints(pointsRes.data);
    setLoading(false);
  }

  async function handleCreer(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nom || !secteurId || !pointId || !email) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const motDePasseTemp =
      "Weu" + Math.random().toString(36).slice(2, 8).toUpperCase();

    const { data, error } = await supabase.functions.invoke("creer-menage", {
      body: {
        nom,
        telephone,
        id_secteur: parseInt(secteurId),
        id_point: parseInt(pointId),
        email,
        mot_de_passe: motDePasseTemp,
      },
    });

    if (error) {
      try {
        const errBody = await error.context?.json();
        const msgAnglais = errBody?.error || "";
        let msgFrancais = "Erreur lors de la création";
        if (msgAnglais.includes("already been registered"))
          msgFrancais = "Cet email est déjà utilisé par un autre ménage";
        else if (msgAnglais.includes("invalid email"))
          msgFrancais = "Adresse email invalide";
        else if (msgAnglais.includes("password"))
          msgFrancais = "Problème avec le mot de passe";
        setError(msgFrancais);
      } catch {
        setError("Erreur lors de la création");
      }
      return;
    }

    if (data?.error) {
      setError("Erreur : " + data.error);
      return;
    }

    setSuccess("Ménage créé avec succès !");
    setNom("");
    setTelephone("");
    setSecteurId("");
    setPointId("");
    setEmail("");
    fetchData();
  }

  async function toggleStatut(menage) {
    const nouveauStatut = menage.statut === "actif" ? "inactif" : "actif";
    const { error } = await supabase
      .from("menage")
      .update({ statut: nouveauStatut })
      .eq("id_menage", menage.id_menage);
    if (!error) fetchData();
  }

  const menagesFiltres = menages.filter((m) => {
    const matchStatut = filtreStatut === "tous" || m.statut === filtreStatut;
    const matchSecteur =
      filtreSecteur === "tous" || m.id_secteur === parseInt(filtreSecteur);
    const matchRecherche = m.nom
      .toLowerCase()
      .includes(recherche.toLowerCase());
    return matchStatut && matchSecteur && matchRecherche;
  });

  const total = menages.length;
  const actifs = menages.filter((m) => m.statut === "actif").length;
  const inactifs = menages.filter((m) => m.statut === "inactif").length;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.title}>Gestion des ménages</div>
          <div className={styles.sub}>
            Quartier Madina · {total} ménages inscrits
          </div>
        </div>

        {/* GRID HAUT : formulaire + stats */}
        <div className={styles.gridTop}>
          {/* Formulaire */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Créer un nouveau ménage</span>
            </div>
            <form onSubmit={handleCreer}>
              {error && <div className={styles.alertError}>{error}</div>}
              {success && <div className={styles.alertSuccess}>{success}</div>}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nom du ménage *</label>
                  <input
                    className={styles.input}
                    placeholder="ex: Famille Ahmed"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Téléphone</label>
                  <input
                    className={styles.input}
                    placeholder="+269 XX XX XX XX"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email *</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Secteur *</label>
                  <Select
                    value={secteurId}
                    onChange={(e) => setSecteurId(e.target.value)}
                    placeholder="Sélectionner un secteur..."
                    options={[
                      ...secteurs.map((s) => ({
                        value: String(s.id_secteur),
                        label: s.nom,
                      })),
                    ]}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Point de collecte *</label>
                  <Select
                    value={pointId}
                    onChange={(e) => setPointId(e.target.value)}
                    placeholder="Sélectionner un point..."
                    disabled={!secteurId}
                    options={[
                      ...pointsFiltres.map((p) => ({
                        value: String(p.id_point),
                        label: p.nom,
                      })),
                    ]}
                  />
                </div>
              </div>
              <div className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={() => {
                    setNom("");
                    setTelephone("");
                    setSecteurId("");
                    setPointId("");
                    setEmail("");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className={styles.btnGreen}>
                  Créer le ménage
                </button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Vue d'ensemble</span>
            </div>
            <div className={styles.statsBox}>
              <div className={styles.statItem}>
                <div>
                  <div className={styles.statLabel}>Total</div>
                  <div className={styles.statSub}>ménages inscrits</div>
                </div>
                <div className={styles.statVal} style={{ color: "#1B1F2B" }}>
                  {total}
                </div>
              </div>
              <div className={styles.statItem}>
                <div>
                  <div className={styles.statLabel}>Actifs</div>
                  <div className={styles.statSub}>participent au projet</div>
                </div>
                <div className={styles.statVal} style={{ color: "#2DD4BF" }}>
                  {actifs}
                </div>
              </div>
              <div className={styles.statItem}>
                <div>
                  <div className={styles.statLabel}>Inactifs</div>
                  <div className={styles.statSub}>désactivés</div>
                </div>
                <div className={styles.statVal} style={{ color: "#FB7185" }}>
                  {inactifs}
                </div>
              </div>
              <div className={styles.statItem}>
                <div>
                  <div className={styles.statLabel}>Secteurs</div>
                  <div className={styles.statSub}>zones couvertes</div>
                </div>
                <div className={styles.statVal} style={{ color: "#FBBF24" }}>
                  {secteurs.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des ménages */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Liste des ménages</span>
            <span className={styles.cardCount}>
              {menagesFiltres.length} résultat(s)
            </span>
          </div>
          <div className={styles.searchBar}>
            <input
              className={styles.searchInput}
              placeholder="Rechercher un ménage..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <Select
              value={filtreSecteur}
              onChange={(e) => setFiltreSecteur(e.target.value)}
              options={[
                { value: "tous", label: "Tous les secteurs" },
                ...secteurs.map((s) => ({
                  value: String(s.id_secteur),
                  label: s.nom,
                })),
              ]}
            />

            <Select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              options={[
                { value: "tous", label: "Tous les statuts" },
                { value: "actif", label: "Actifs" },
                { value: "inactif", label: "Inactifs" },
              ]}
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
                  <th className={styles.th}>Téléphone</th>
                  <th className={styles.th}>Inscription</th>
                  <th className={styles.th}>Statut</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {menagesFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.tdEmpty}>
                      Aucun ménage trouvé
                    </td>
                  </tr>
                ) : (
                  menagesFiltres.map((m) => (
                    <tr key={m.id_menage}>
                      <td className={styles.tdBold}>{m.nom}</td>
                      <td className={styles.td}>{m.secteur?.nom || "—"}</td>
                      <td className={styles.td}>
                        {m.point_collecte?.nom || "—"}
                      </td>
                      <td className={styles.td}>{m.telephone || "—"}</td>
                      <td className={styles.td}>
                        {new Date(m.date_inscription).toLocaleDateString(
                          "fr-FR",
                        )}
                      </td>
                      <td className={styles.td}>
                        <span
                          className={
                            m.statut === "actif"
                              ? styles.badgeActif
                              : styles.badgeInactif
                          }
                        >
                          {m.statut}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <button
                          onClick={() => toggleStatut(m)}
                          className={
                            m.statut === "actif"
                              ? styles.btnSmallRed
                              : styles.btnSmallGreen
                          }
                        >
                          {m.statut === "actif" ? "Désactiver" : "Activer"}
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
    </Layout>
  );
}

export default Menages;
