// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Dashboard({ navigate }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [expressions, setExpressions] = useState([]);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("login");
      return;
    }
    api.myBookings().then(setBookings).catch(() => {});
    api.myPurchases().then(setPurchases).catch(() => {});
    api.myAttempts().then(setAttempts).catch(() => {});
    api.myExpressions().then(setExpressions).catch(() => {});
    api.correctionCredits().then((r) => setCredits(r.remaining)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;

  return (
    <div className="page-container">
      <h1>Mon espace</h1>

      <section className="dashboard-section">
        <h2>Mes résultats TCF</h2>
        {attempts.length === 0 ? (
          <p className="subtitle">Aucun test passé pour le moment. <button className="link" onClick={() => navigate("tcf")}>S'entraîner</button></p>
        ) : (
          <table className="table">
            <thead><tr><th>Section</th><th>Score</th><th>Niveau</th><th>Date</th></tr></thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.section}</td>
                  <td>{a.score_tcf}/699 ({a.nb_correct}/{a.nb_questions})</td>
                  <td>{a.niveau_clb}</td>
                  <td>{a.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Corrections IA ({credits} crédit(s) restant(s))</h2>
        {expressions.length === 0 ? (
          <p className="subtitle">Aucune soumission pour le moment.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Section</th><th>Statut</th><th>Résultat</th><th>Date</th></tr></thead>
            <tbody>
              {expressions.map((ex) => {
                let fb = null;
                try { fb = ex.feedback ? JSON.parse(ex.feedback) : null; } catch { fb = null; }
                return (
                  <tr key={ex.id}>
                    <td>{ex.section}</td>
                    <td>{ex.status === "en_attente" ? "En attente de correction" : "Corrigé"}</td>
                    <td>{fb && fb.score_sur_20 != null ? `${fb.score_sur_20}/20 — ${fb.niveau_cecr || "—"}` : "—"}</td>
                    <td>{ex.created_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Mes consultations</h2>
        {bookings.length === 0 ? (
          <p className="subtitle">Aucune consultation réservée. <button className="link" onClick={() => navigate("consultations")}>Réserver</button></p>
        ) : (
          <table className="table">
            <thead><tr><th>Programme</th><th>Date souhaitée</th><th>Statut</th><th>Paiement</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.program_interest}</td>
                  <td>{b.preferred_date || "—"}</td>
                  <td>{b.status}</td>
                  <td>{b.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Mes achats</h2>
        {purchases.length === 0 ? (
          <p className="subtitle">Aucun pack acheté. <button className="link" onClick={() => navigate("packs")}>Voir les packs</button></p>
        ) : (
          <table className="table">
            <thead><tr><th>Formule</th><th>Montant</th><th>Statut</th><th>Accès jusqu'au</th><th>Date d'achat</th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td>{p.pack_name}</td>
                  <td>{p.amount_mad} MAD</td>
                  <td>{p.status}</td>
                  <td>{p.expires_at}</td>
                  <td>{p.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
