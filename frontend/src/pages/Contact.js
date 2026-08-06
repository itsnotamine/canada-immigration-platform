// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    // Pas encore de backend pour ce formulaire — confirmation locale uniquement.
    setSent(true);
  };

  return (
    <div className="page-container">
      <h1>Contact</h1>
      <p className="subtitle">Une question, un problème ? Écrivez-nous.</p>

      {sent ? (
        <div className="alert alert-success">
          Merci {form.name || ""}, votre message a bien été enregistré. Nous vous répondrons
          dès que possible à {form.email}.
        </div>
      ) : (
        <form className="card form" onSubmit={submit}>
          <label>Nom</label>
          <input type="text" value={form.name} onChange={update("name")} required />

          <label>Email</label>
          <input type="email" value={form.email} onChange={update("email")} required />

          <label>Message</label>
          <textarea rows={6} value={form.message} onChange={update("message")} required />

          <button className="btn btn-primary" type="submit">Envoyer</button>
        </form>
      )}
    </div>
  );
}
