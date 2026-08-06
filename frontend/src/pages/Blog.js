// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
export default function Blog() {
  return (
    <div className="page-container">
      <h1>Blog</h1>
      <div className="card" style={{ textAlign: "center", padding: 50 }}>
        <span style={{ fontSize: "2rem" }}>✍️</span>
        <h2 style={{ marginTop: 14 }}>Contenu à venir prochainement</h2>
        <p className="subtitle">
          Nous préparons des articles utiles sur les examens de langue et l'immigration.
          Revenez bientôt !
        </p>
      </div>
    </div>
  );
}
