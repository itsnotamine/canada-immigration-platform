// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function Register({ navigate }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2>Créer un compte</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Nom complet</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Création..." : "S'inscrire"}
        </button>
        <p className="auth-switch">
          Déjà un compte ? <button type="button" className="link" onClick={() => navigate("login")}>Se connecter</button>
        </p>
      </form>
    </div>
  );
}
