// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
export default function Fonctionnalites({ navigate }) {
  return (
    <div className="page-container">
      <h1>Fonctionnalités</h1>
      <p className="subtitle">Tout ce que propose GeneralPass pour préparer vos examens de langue et votre immigration.</p>

      <div className="features" style={{ padding: "20px 0" }}>
        <div className="feature-card">
          <span className="icon">🎧</span>
          <h3>Tests blancs</h3>
          <p>
            Compréhension orale et écrite en conditions réelles, avec un score estimé
            et une équivalence de niveau (CLB pour le TCF Canada) après chaque test.
            Accès illimité pendant toute la durée de votre formule.
          </p>
        </div>
        <div className="feature-card">
          <span className="icon">🤖</span>
          <h3>Correction IA</h3>
          <p>
            Soumettez vos productions écrites ou orales (transcrites) et recevez en
            quelques secondes un score indicatif, un niveau CECR estimé, ainsi que
            vos points forts et points à améliorer.
          </p>
        </div>
        <div className="feature-card">
          <span className="icon">📋</span>
          <h3>Consultation</h3>
          <p>
            Échangez avec un conseiller en immigration pour évaluer votre profil,
            choisir le bon programme et préparer votre dossier — ou pour obtenir une
            correction humaine approfondie de vos productions.
          </p>
        </div>
        <div className="feature-card">
          <span className="icon">📈</span>
          <h3>Suivi de progression</h3>
          <p>
            Retrouvez dans votre espace personnel l'historique de tous vos tests,
            vos corrections IA et vos consultations, pour suivre votre évolution
            dans le temps.
          </p>
        </div>
      </div>

      <div className="cta-band" style={{ marginTop: 20, borderRadius: 16 }}>
        <h2>Prêt à commencer ?</h2>
        <p>Créez votre compte gratuitement et passez votre premier test dès aujourd'hui.</p>
        <button className="btn btn-gold btn-lg" onClick={() => navigate("register")}>
          Commencer gratuitement
        </button>
      </div>
    </div>
  );
}
