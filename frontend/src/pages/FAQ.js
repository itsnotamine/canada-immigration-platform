// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
const QUESTIONS = [
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement des formules d'accès et des consultations se fait directement sur la plateforme. À ce stade, il s'agit d'une implémentation de démonstration ; un vrai moyen de paiement (carte bancaire) sera branché prochainement.",
  },
  {
    q: "Combien de temps dure mon accès après l'achat d'une formule ?",
    a: "Chaque formule (5, 30 ou 60 jours) vous donne un accès complet à tout le contenu pendant la durée choisie, à partir du moment de l'achat. La date d'expiration est visible dans votre espace personnel.",
  },
  {
    q: "Le score estimé est-il fiable ?",
    a: "Le score affiché après chaque test est une estimation indicative basée sur vos réponses, pensée pour vous entraîner. Il ne remplace pas un test officiel et peut différer du résultat que vous obtiendriez en conditions réelles.",
  },
  {
    q: "Quelle est la différence entre la correction IA et une correction humaine ?",
    a: "La correction IA est immédiate et incluse dans les formules d'accès (score indicatif, niveau estimé, points forts et à améliorer). Pour un avis humain plus approfondi, vous pouvez réserver une consultation avec un conseiller.",
  },
  {
    q: "Puis-je me faire rembourser ?",
    a: "Nous n'avons pas encore finalisé de politique de remboursement formelle. Si vous rencontrez un problème avec un achat, contactez-nous via la page Contact et nous étudierons votre situation au cas par cas.",
  },
  {
    q: "Quels examens sont disponibles aujourd'hui ?",
    a: "Le TCF Canada (compréhension orale/écrite et expression écrite/orale) est disponible dès maintenant. D'autres examens de langue seront ajoutés progressivement.",
  },
  {
    q: "Dois-je créer un compte pour m'entraîner ?",
    a: "La création de compte est gratuite et nécessaire pour enregistrer vos résultats, acheter une formule d'accès ou soumettre une production pour correction.",
  },
];

export default function FAQ({ navigate }) {
  return (
    <div className="page-container">
      <h1>Foire aux questions</h1>
      <p className="subtitle">Les réponses aux questions les plus fréquentes sur GeneralPass.</p>

      <div className="card" style={{ padding: 0 }}>
        {QUESTIONS.map((item, i) => (
          <div
            key={i}
            style={{ padding: "20px 26px", borderBottom: i < QUESTIONS.length - 1 ? "1px solid var(--border)" : "none" }}
          >
            <h3 style={{ margin: "0 0 8px", color: "var(--navy)" }}>{item.q}</h3>
            <p style={{ margin: 0, color: "var(--gray)", lineHeight: 1.5 }}>{item.a}</p>
          </div>
        ))}
      </div>

      <p className="subtitle" style={{ marginTop: 24 }}>
        Vous ne trouvez pas de réponse à votre question ?{" "}
        <button className="link" onClick={() => navigate("contact")}>Contactez-nous</button>.
      </p>
    </div>
  );
}
