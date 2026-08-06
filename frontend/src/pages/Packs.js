import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../LanguageContext";

export default function Packs({ navigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    api.listPacks().then(setPacks).catch((e) => setError(e.message));
  }, []);

  const buy = async (pack) => {
    if (!user) {
      navigate("login");
      return;
    }
    setError("");
    setBuyingId(pack.id);
    try {
      await api.checkoutPack(pack.id);
      setSuccessMsg(t("packs.success", { name: pack.name }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBuyingId(null);
    }
  };

  const savings = (pack) =>
    pack.original_price_mad ? Math.round(pack.original_price_mad - pack.price_mad) : 0;

  return (
    <div className="page-container">
      <h1>{t("packs.title")}</h1>
      <p className="subtitle">{t("packs.subtitle")}</p>

      <div className="promo-banner">{t("packs.promo")}</div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="packs-grid">
        {packs.map((pack) => (
          <div className={`pack-card ${pack.is_popular ? "popular" : ""}`} key={pack.id}>
            {pack.is_popular && <div className="popular-badge">{t("packs.popular")}</div>}
            <h3>{pack.name}</h3>
            <div className="pack-price-row">
              <div className="pack-price">{pack.price_mad} MAD</div>
              {pack.original_price_mad && (
                <div className="pack-price-original">{pack.original_price_mad} MAD</div>
              )}
            </div>
            {savings(pack) > 0 && (
              <div className="pack-savings">{t("packs.savings", { amount: savings(pack) })}</div>
            )}
            <p className="pack-desc">{pack.description}</p>
            <ul>
              <li>{t("packs.access", { days: pack.duration_days })}</li>
              <li>{t("packs.aiCredits", { count: pack.ai_correction_credits })}</li>
            </ul>
            <button
              className={`btn ${pack.is_popular ? "btn-primary" : "btn-outline"} btn-block`}
              onClick={() => buy(pack)}
              disabled={buyingId === pack.id}
            >
              {buyingId === pack.id ? t("packs.buying") : t("packs.buy")}
            </button>
          </div>
        ))}
      </div>

      <div className="guarantee-row">
        <span>{t("packs.guarantee.payment")}</span>
        <span>{t("packs.guarantee.access")}</span>
        <span>{t("packs.guarantee.ai")}</span>
      </div>
    </div>
  );
}
