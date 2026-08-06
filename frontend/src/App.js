import { useState } from "react";
import "./App.css";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import { LanguageProvider } from "./LanguageContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Consultations from "./pages/Consultations";
import Packs from "./pages/Packs";
import TCFTest from "./pages/TCFTest";
import Dashboard from "./pages/Dashboard";
import Fonctionnalites from "./pages/Fonctionnalites";
import Blog from "./pages/Blog";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";

// Routage simple par état local (pas de react-router pour éviter une install npm).
const PAGES = {
  home: Home,
  login: Login,
  register: Register,
  consultations: Consultations,
  packs: Packs,
  tcf: TCFTest,
  dashboard: Dashboard,
  fonctionnalites: Fonctionnalites,
  blog: Blog,
  faq: FAQ,
  contact: Contact,
};

function AppShell() {
  const [page, setPage] = useState("home");
  const navigate = (target) => {
    setPage(target in PAGES ? target : "home");
    window.scrollTo(0, 0);
  };

  const Page = PAGES[page] || Home;

  return (
    <div className="App">
      <Navbar navigate={navigate} page={page} />
      <main>
        <Page navigate={navigate} />
      </main>
      <footer className="footer">
        <p>GeneralPass — Préparation aux examens de langue &amp; accompagnement immigration.</p>
        <p className="disclaimer">
          Plateforme indépendante, non affiliée à IRCC ni à France Éducation international.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
