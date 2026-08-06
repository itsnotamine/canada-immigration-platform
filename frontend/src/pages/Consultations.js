// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Consultations() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    program_interest: "Entrée express (résidence permanente)",
    preferred_date: "",
    message: "",
  });
  const [step, setStep] = useState("form"); // form | paying | done
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setStep("paying");
    try {
      const booking = await api.createBooking(form);
      await api.checkoutConsultation(booking.id);
      setStep("done");
    } catch (err) {
      setError(err.message);
      setStep("form");
    }
  };

  if (step === "done") {
    return (
      <div className="page-container">
        <div className="alert alert-success">
          Votre consultation (550 MAD) est confirmée et payée. Un conseiller vous contactera
          sous 48h à l'adresse {form.email}.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Réserver une consultation</h1>
      <p className="subtitle">
        30 minutes avec un conseiller en immigration — 550 MAD, paiement sécurisé.
      </p>
      <form className="card form" onSubmit={submit}>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Nom complet</label>
        <input value={form.full_name} onChange={update("full_name")} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={update("email")} required />
        <label>Téléphone</label>
        <input value={form.phone} onChange={update("phone")} />
        <label>Programme visé</label>
        <select value={form.program_interest} onChange={update("program_interest")}>
          <option>Entrée express (résidence permanente)</option>
          <option>Programme des candidats des provinces (PCP)</option>
          <option>Permis d'études</option>
          <option>Permis vacances-travail (PVT)</option>
          <option>Parrainage familial</option>
          <option>Autre</option>
        </select>
        <label>Date souhaitée</label>
        <input type="date" value={form.preferred_date} onChange={update("preferred_date")} />
        <label>Message (optionnel)</label>
        <textarea value={form.message} onChange={update("message")} rows={4} />
        <button className="btn btn-primary" type="submit" disabled={step === "paying"}>
          {step === "paying" ? "Traitement du paiement..." : "Réserver et payer — 550 MAD"}
        </button>
      </form>
    </div>
  );
}
