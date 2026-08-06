import { useLanguage } from "../LanguageContext";

export default function Home({ navigate }) {
  const { t } = useLanguage();
  return (
    <div>
      <section className="hero">
        <span className="eyebrow" style={{ color: "var(--gold)" }}>{t("home.eyebrow")}</span>
        <h1>{t("home.title")}</h1>
        <p>{t("home.subtitle")}</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate("packs")}>
            {t("home.cta.pricing")}
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate("consultations")} style={{ background: "transparent", color: "white", borderColor: "rgba(255,255,255,0.35)" }}>
            {t("home.cta.consultation")}
          </button>
        </div>
        <div className="hero-trust">
          <span>{t("home.trust.payment")}</span>
          <span>{t("home.trust.access")}</span>
          <span>{t("home.trust.correction")}</span>
        </div>
      </section>

      <div className="section-heading" style={{ marginTop: 56 }}>
        <span className="eyebrow">{t("home.how.eyebrow")}</span>
        <h2>{t("home.how.title")}</h2>
      </div>

      <section className="steps">
        <div className="step-card">
          <span className="badge-free">{t("home.step1.badge")}</span>
          <h3>{t("home.step1.title")}</h3>
          <p>{t("home.step1.text")}</p>
        </div>
        <div className="step-card">
          <span className="badge-complete">{t("home.step2.badge")}</span>
          <h3>{t("home.step2.title")}</h3>
          <p>{t("home.step2.text")}</p>
        </div>
        <div className="step-card">
          <span className="badge-premium">{t("home.step3.badge")}</span>
          <h3>{t("home.step3.title")}</h3>
          <p>{t("home.step3.text")}</p>
        </div>
      </section>

      <div className="section-heading" style={{ marginTop: 56 }}>
        <span className="eyebrow">{t("home.why.eyebrow")}</span>
        <h2>{t("home.why.title")}</h2>
      </div>

      <section className="page-container" style={{ maxWidth: 820 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th></th>
                <th>{t("home.table.us")}</th>
                <th>{t("home.table.them")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{t("home.table.row1")}</td>
                <td className="yes">✓</td>
                <td className="no">—</td>
              </tr>
              <tr>
                <td>{t("home.table.row2")}</td>
                <td className="yes">✓</td>
                <td className="no">—</td>
              </tr>
              <tr>
                <td>{t("home.table.row3")}</td>
                <td className="yes">✓</td>
                <td className="no">—</td>
              </tr>
              <tr>
                <td>{t("home.table.row4")}</td>
                <td className="yes">✓</td>
                <td className="no">—</td>
              </tr>
              <tr>
                <td>{t("home.table.row5")}</td>
                <td className="yes">✓</td>
                <td className="no">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-item">
          <div className="stat-number">12</div>
          <p>{t("home.stat1")}</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">100-699</div>
          <p>{t("home.stat2")}</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">&lt; 1 min</div>
          <p>{t("home.stat3")}</p>
        </div>
      </section>

      <div className="benefits">
        <div className="benefit-item"><span className="check">✓</span><p>{t("home.benefit1")}</p></div>
        <div className="benefit-item"><span className="check">✓</span><p>{t("home.benefit2")}</p></div>
        <div className="benefit-item"><span className="check">✓</span><p>{t("home.benefit3")}</p></div>
        <div className="benefit-item"><span className="check">✓</span><p>{t("home.benefit4")}</p></div>
      </div>

      <section className="cta-band">
        <h2>{t("home.cta2.title")}</h2>
        <p>{t("home.cta2.text")}</p>
        <button className="btn btn-gold btn-lg" onClick={() => navigate("packs")}>
          {t("home.cta2.button")}
        </button>
      </section>
    </div>
  );
}
