import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { useLanguage } from "../LanguageContext";

export default function Navbar({ navigate, page }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const link = (target, label) => (
    <button
      className={`nav-link ${page === target ? "active" : ""}`}
      onClick={() => navigate(target)}
    >
      {label}
    </button>
  );

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("home")}>
        <img src="/logo.svg" alt="GeneralPass" style={{ height: 36 }} />
      </div>
      <div className="navbar-links">
        {link("home", t("nav.home"))}
        {link("tcf", t("nav.exams"))}
        {link("fonctionnalites", t("nav.features"))}
        {link("packs", t("nav.pricing"))}
        {link("blog", t("nav.blog"))}
        {link("faq", t("nav.faq"))}
        {link("contact", t("nav.contact"))}
        {user && link("dashboard", t("nav.dashboard"))}
      </div>
      <div className="navbar-auth">
        <button
          className="lang-toggle"
          onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          aria-label="Changer de langue / Change language"
          title={language === "fr" ? "Switch to English" : "Passer en français"}
        >
          {language === "fr" ? "FR" : "EN"}
        </button>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Changer de thème"
          title={theme === "light" ? "Passer en mode sombre" : "Passer en mode clair"}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user ? (
          <>
            <span className="navbar-user">{t("nav.hello", { name: user.full_name.split(" ")[0] })}</span>
            <button className="btn btn-outline" onClick={() => { logout(); navigate("home"); }}>
              {t("nav.logout")}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={() => navigate("login")}>{t("nav.login")}</button>
            <button className="btn btn-primary" onClick={() => navigate("register")}>{t("nav.signup")}</button>
          </>
        )}
      </div>
    </nav>
  );
}
