import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../supabase";
import Select from "../components/Select";
import styles from "./Finances.module.css";

const CATEGORIES = [
  { value: "carburant", label: "Carburant" },
  { value: "salaire", label: "Salaire" },
  { value: "maintenance", label: "Maintenance" },
  { value: "autre", label: "Autre" },
];

function Finances() {
  const [depenses, setDepenses] = useState([]);
  const [cotisations, setCotisations] = useState([]);
  const [menages, setMenages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categorie, setCategorie] = useState("carburant");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");

  const [filtreMois, setFiltreMois] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [filtreCategorie, setFiltreCategorie] = useState("tous");

  const [depenseSelectionnee, setDepenseSelectionnee] = useState(null);
  const [editCategorie, setEditCategorie] = useState("");
  const [editMontant, setEditMontant] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [errorPopup, setErrorPopup] = useState("");
  const [successPopup, setSuccessPopup] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [depensesRes, cotisationsRes, menagesRes] = await Promise.all([
      supabase.from("depense").select("*").order("date", { ascending: false }),
      supabase
        .from("cotisation")
        .select("montant, periode, statut")
        .eq("statut", "payé"),
      supabase.from("menage").select("id_menage").eq("statut", "actif"),
    ]);
    if (!depensesRes.error) setDepenses(depensesRes.data);
    if (!cotisationsRes.error) setCotisations(cotisationsRes.data);
    if (!menagesRes.error) setMenages(menagesRes.data);
    setLoading(false);
  }

  async function handleAjouterDepense(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!montant || !date) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: utilisateur } = await supabase
      .from("utilisateur")
      .select("id_utilisateur")
      .eq("auth_id", user.id)
      .single();

    const { error } = await supabase.from("depense").insert({
      categorie,
      montant: parseFloat(montant),
      date,
      description,
      id_utilisateur: utilisateur.id_utilisateur,
    });

    if (error) {
      setError("Erreur lors de l'enregistrement : " + error.message);
    } else {
      setSuccess("Dépense enregistrée avec succès !");
      setMontant("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setCategorie("carburant");
      fetchData();
    }
  }

  function ouvrirModification(depense) {
    setDepenseSelectionnee(depense);
    setEditCategorie(depense.categorie);
    setEditMontant(depense.montant);
    setEditDate(depense.date);
    setEditDescription(depense.description || "");
    setErrorPopup("");
    setSuccessPopup("");
  }

  async function handleModifier(e) {
    e.preventDefault();
    setErrorPopup("");
    setSuccessPopup("");

    const { error } = await supabase
      .from("depense")
      .update({
        categorie: editCategorie,
        montant: parseFloat(editMontant),
        date: editDate,
        description: editDescription,
      })
      .eq("id_depense", depenseSelectionnee.id_depense);

    if (error) {
      setErrorPopup("Erreur : " + error.message);
    } else {
      setSuccessPopup("Dépense modifiée avec succès !");
      fetchData();
      setTimeout(() => setDepenseSelectionnee(null), 1500);
    }
  }

  async function handleSupprimer(idDepense) {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?"))
      return;
    const { error } = await supabase
      .from("depense")
      .delete()
      .eq("id_depense", idDepense);
    if (!error) {
      fetchData();
      setDepenseSelectionnee(null);
    }
  }

  function getBadgeCategorie(cat) {
    if (cat === "carburant") return styles.badgeCarburant;
    if (cat === "salaire") return styles.badgeSalaire;
    if (cat === "maintenance") return styles.badgeMaintenance;
    return styles.badgeAutre;
  }

  function getCatLabel(cat) {
    return CATEGORIES.find((c) => c.value === cat)?.label || cat;
  }

  const moisActuel = new Date().toISOString().slice(0, 7);
  const cotisationsMoisActuel = cotisations.filter((c) =>
    c.periode?.startsWith(moisActuel),
  );
  const totalCotisations = cotisationsMoisActuel.reduce(
    (sum, c) => sum + parseFloat(c.montant || 0),
    0,
  );
  const depensesMoisActuel = depenses.filter((d) =>
    d.date?.startsWith(moisActuel),
  );
  const totalDepenses = depensesMoisActuel.reduce(
    (sum, d) => sum + parseFloat(d.montant || 0),
    0,
  );
  const solde = totalCotisations - totalDepenses;
  const totalMenages = menages.length;
  const tauxRecouvrement =
    totalMenages > 0
      ? Math.round((cotisationsMoisActuel.length / totalMenages) * 100)
      : 0;

  const depensesFiltrees = depenses.filter((d) => {
    return (
      d.date?.startsWith(filtreMois) &&
      (filtreCategorie === "tous" || d.categorie === filtreCategorie)
    );
  });

  const totalFiltre = depensesFiltrees.reduce(
    (sum, d) => sum + parseFloat(d.montant || 0),
    0,
  );

  const derniersMois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  }).reverse();

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.title}>Finances</div>
          <div className={styles.sub}>Suivi financier · Quartier Madina</div>
        </div>

        <div className={styles.gridTop}>
          {/* Formulaire + Résumé 6 mois */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Enregistrer une dépense</span>
            </div>
            <form onSubmit={handleAjouterDepense}>
              {error && <div className={styles.alertError}>{error}</div>}
              {success && <div className={styles.alertSuccess}>{success}</div>}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Catégorie *</label>
                  <Select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                    options={CATEGORIES}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Montant (FC) *</label>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder="ex: 25000"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Date *</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Description</label>
                  <input
                    className={styles.input}
                    placeholder="ex: Plein d'essence du camion"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.btnOutline}
                  onClick={() => {
                    setMontant("");
                    setDescription("");
                    setDate(new Date().toISOString().split("T")[0]);
                    setCategorie("carburant");
                    setError("");
                    setSuccess("");
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className={styles.btnGreen}>
                  <ion-icon name="add-outline"></ion-icon>
                  Enregistrer la dépense
                </button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className={styles.cardNoMargin}>
            <div className={styles.cardHead}>
              <span className={styles.cardTitle}>Ce mois</span>
            </div>
            <div className={styles.statsBox}>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(52,211,153,0.12)" }}
                  >
                    <ion-icon
                      name="arrow-up-outline"
                      style={{ color: "#34D399", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Cotisations</div>
                    <div className={styles.statSub}>recettes collectées</div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "Space Grotesk",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#34D399",
                  }}
                >
                  +{totalCotisations.toLocaleString("fr-FR")} FC
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(251,113,133,0.12)" }}
                  >
                    <ion-icon
                      name="arrow-down-outline"
                      style={{ color: "#FB7185", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Dépenses</div>
                    <div className={styles.statSub}>dépenses engagées</div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "Space Grotesk",
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#FB7185",
                  }}
                >
                  -{totalDepenses.toLocaleString("fr-FR")} FC
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{
                      background:
                        solde >= 0
                          ? "rgba(52,211,153,0.12)"
                          : "rgba(251,113,133,0.12)",
                    }}
                  >
                    <ion-icon
                      name="wallet-outline"
                      style={{
                        color: solde >= 0 ? "#34D399" : "#FB7185",
                        fontSize: 18,
                      }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Solde</div>
                    <div className={styles.statSub}>
                      {solde >= 0 ? "Excédent" : "Déficit"}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "Space Grotesk",
                    fontWeight: 700,
                    fontSize: 16,
                    color: solde >= 0 ? "#34D399" : "#FB7185",
                  }}
                >
                  {solde >= 0 ? "+" : ""}
                  {solde.toLocaleString("fr-FR")} FC
                </div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statLeft}>
                  <div
                    className={styles.statIconWrap}
                    style={{ background: "rgba(45,212,191,0.12)" }}
                  >
                    <ion-icon
                      name="stats-chart-outline"
                      style={{ color: "#2DD4BF", fontSize: 18 }}
                    ></ion-icon>
                  </div>
                  <div>
                    <div className={styles.statLabel}>Recouvrement</div>
                    <div className={styles.statSub}>ménages ayant payé</div>
                  </div>
                </div>
                <div
                  className={styles.statVal}
                  style={{
                    color: tauxRecouvrement >= 70 ? "#34D399" : "#FBBF24",
                  }}
                >
                  {tauxRecouvrement}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé 6 mois */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Résumé des 6 derniers mois</span>
          </div>
          <div className={styles.resumeGrid}>
            {derniersMois.map((mois) => {
              const recettes = cotisations
                .filter((c) => c.periode?.startsWith(mois))
                .reduce((sum, c) => sum + parseFloat(c.montant || 0), 0);
              const deps = depenses
                .filter((d) => d.date?.startsWith(mois))
                .reduce((sum, d) => sum + parseFloat(d.montant || 0), 0);
              const sol = recettes - deps;
              const moisLabel = new Date(mois + "-01").toLocaleDateString(
                "fr-FR",
                { month: "short", year: "2-digit" },
              );
              return (
                <div key={mois} className={styles.resumeMois}>
                  <div className={styles.resumeMoisLabel}>{moisLabel}</div>
                  <div className={styles.resumeMoisRecette}>
                    +{recettes.toLocaleString("fr-FR")}
                  </div>
                  <div className={styles.resumeMoisDepense}>
                    -{deps.toLocaleString("fr-FR")}
                  </div>
                  <div
                    className={styles.resumeMoisSolde}
                    style={{ color: sol >= 0 ? "#34D399" : "#FB7185" }}
                  >
                    {sol >= 0 ? "+" : ""}
                    {sol.toLocaleString("fr-FR")} FC
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historique dépenses */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.cardTitle}>Historique des dépenses</span>
            <span className={styles.cardCount}>
              Total : {totalFiltre.toLocaleString("fr-FR")} FC
            </span>
          </div>
          <div className={styles.searchBar}>
            <input
              type="month"
              className={styles.select}
              value={filtreMois}
              onChange={(e) => setFiltreMois(e.target.value)}
            />
            <Select
              value={filtreCategorie}
              onChange={(e) => setFiltreCategorie(e.target.value)}
              options={[
                { value: "tous", label: "Toutes catégories" },
                ...CATEGORIES,
              ]}
            />
          </div>
          {loading ? (
            <div className={styles.tdLoading}>Chargement...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Catégorie</th>
                  <th className={styles.th}>Montant</th>
                  <th className={styles.th}>Description</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {depensesFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.tdEmpty}>
                      Aucune dépense trouvée
                    </td>
                  </tr>
                ) : (
                  depensesFiltrees.map((d) => (
                    <tr key={d.id_depense}>
                      <td className={styles.tdBold}>
                        {new Date(d.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className={styles.td}>
                        <span className={getBadgeCategorie(d.categorie)}>
                          {getCatLabel(d.categorie)}
                        </span>
                      </td>
                      <td
                        className={styles.td}
                        style={{ color: "#FB7185", fontWeight: 600 }}
                      >
                        -{parseFloat(d.montant).toLocaleString("fr-FR")} FC
                      </td>
                      <td className={styles.td}>{d.description || "—"}</td>
                      <td className={styles.td}>
                        <div className={styles.btnActions}>
                          <button
                            className={`${styles.btnIcon} ${styles.btnIconEdit}`}
                            onClick={() => ouvrirModification(d)}
                            title="Modifier"
                          >
                            <ion-icon name="create-outline"></ion-icon>
                          </button>
                          <button
                            className={`${styles.btnIcon} ${styles.btnIconDelete}`}
                            onClick={() => handleSupprimer(d.id_depense)}
                            title="Supprimer"
                          >
                            <ion-icon name="trash-outline"></ion-icon>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* POPUP MODIFICATION */}
      {depenseSelectionnee && (
        <div
          className={styles.overlay}
          onClick={() => setDepenseSelectionnee(null)}
        >
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHead}>
              <div className={styles.popupTitle}>Modifier la dépense</div>
              <button
                className={styles.btnFermer}
                onClick={() => setDepenseSelectionnee(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.popupBody}>
              {errorPopup && (
                <div className={styles.alertError}>{errorPopup}</div>
              )}
              {successPopup && (
                <div className={styles.alertSuccess}>{successPopup}</div>
              )}
              <form onSubmit={handleModifier}>
                <div className={styles.popupFormGrid}>
                  <div className={styles.popupFormGroup}>
                    <label className={styles.label}>Catégorie</label>
                    <Select
                      value={editCategorie}
                      onChange={(e) => setEditCategorie(e.target.value)}
                      options={CATEGORIES}
                    />
                  </div>
                  <div className={styles.popupFormGroup}>
                    <label className={styles.label}>Montant (FC)</label>
                    <input
                      className={styles.input}
                      type="number"
                      value={editMontant}
                      onChange={(e) => setEditMontant(e.target.value)}
                    />
                  </div>
                  <div className={styles.popupFormGroup}>
                    <label className={styles.label}>Date</label>
                    <input
                      className={styles.input}
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className={styles.popupFormGroup}>
                    <label className={styles.label}>Description</label>
                    <input
                      className={styles.input}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.popupFooter}>
                  <button
                    type="button"
                    className={styles.btnRouge}
                    onClick={() =>
                      handleSupprimer(depenseSelectionnee.id_depense)
                    }
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                    Supprimer
                  </button>
                  <button
                    type="button"
                    className={styles.btnOutline}
                    onClick={() => setDepenseSelectionnee(null)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className={styles.btnGreen}>
                    <ion-icon name="checkmark-outline"></ion-icon>
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Finances;
