// TODO i18n : page pas encore migrée vers LanguageContext/t() — textes en dur en français.
import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext";

const SECTION_LABELS = {
  comprehension_orale: "Compréhension orale",
  comprehension_ecrite: "Compréhension écrite",
  expression_ecrite: "Expression écrite",
  expression_orale: "Expression orale",
};

export default function TCFTest({ navigate }) {
  const { user } = useAuth();
  const [section, setSection] = useState("comprehension_ecrite");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [expressionPrompt, setExpressionPrompt] = useState(null);
  const [expressionContent, setExpressionContent] = useState("");
  const [expressionResult, setExpressionResult] = useState(null);

  const isExpression = section === "expression_ecrite" || section === "expression_orale";

  useEffect(() => {
    setResult(null);
    setAnswers({});
    setError("");
    setExpressionContent("");
    setExpressionResult(null);
    setExpressionPrompt(null);
    if (!isExpression) {
      api.getTcfQuestions(section).then(setQuestions).catch((e) => setError(e.message));
    } else {
      api.getExpressionPrompt(section).then(setExpressionPrompt).catch((e) => setError(e.message));
    }
  }, [section, isExpression]);

  const selectAnswer = (questionId, option) => setAnswers({ ...answers, [questionId]: option });

  const submitQuiz = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("login");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        section,
        answers: Object.entries(answers).map(([question_id, selected_option]) => ({
          question_id: Number(question_id),
          selected_option,
        })),
      };
      const res = await api.submitTcfTest(payload);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitExpression = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("login");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.submitExpression({
        section,
        prompt: expressionPrompt?.prompt_text || "",
        content: expressionContent,
      });
      setExpressionResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>S'entraîner au TCF Canada</h1>
      <div className="tabs">
        {Object.entries(SECTION_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`tab ${section === key ? "active" : ""}`}
            onClick={() => setSection(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!isExpression && !result && (
        <form className="card" onSubmit={submitQuiz}>
          <p className="subtitle">
            {questions.length} question(s) — score TCF estimé (100-699) à la fin.
          </p>
          {questions.map((q, idx) => (
            <div className="question-block" key={q.id}>
              <p className="question-meta">Niveau indicatif : {q.niveau}</p>
              {q.passage_or_audio_desc && <p className="question-passage">{q.passage_or_audio_desc}</p>}
              <p className="question-text"><strong>{idx + 1}. {q.question_text}</strong></p>
              {["a", "b", "c", "d"].map((opt) => (
                <label className="option-row" key={opt}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === opt}
                    onChange={() => selectAnswer(q.id, opt)}
                  />
                  {q[`option_${opt}`]}
                </label>
              ))}
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading || questions.length === 0}>
            {loading ? "Correction en cours..." : "Valider mes réponses"}
          </button>
          {!user && <p className="subtitle">Connecte-toi pour enregistrer ton score.</p>}
        </form>
      )}

      {!isExpression && result && (
        <div className="card result-card">
          <h2>Résultat — {SECTION_LABELS[section]}</h2>
          <div className="score-big">{result.score_tcf}<span>/699</span></div>
          <p>{result.nb_correct} / {result.nb_questions} bonnes réponses</p>
          <p>Niveau estimé : <strong>{result.niveau_clb}</strong></p>
          <p className="disclaimer">
            ⚠️ Estimation indicative à but d'entraînement, ne remplace pas un test TCF Canada officiel.
          </p>
          <button className="btn btn-outline" onClick={() => setResult(null)}>Refaire un test</button>
          <button className="btn btn-primary" onClick={() => navigate("packs")}>Voir les packs pour plus de tests</button>
        </div>
      )}

      {isExpression && !expressionResult && (
        <form className="card" onSubmit={submitExpression}>
          <p className="question-passage">
            {expressionPrompt ? expressionPrompt.prompt_text : "Chargement du sujet..."}
          </p>
          <textarea
            rows={8}
            value={expressionContent}
            onChange={(e) => setExpressionContent(e.target.value)}
            placeholder="Rédigez votre réponse ici..."
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !expressionPrompt}>
            {loading ? "Correction IA en cours..." : "Envoyer pour correction IA"}
          </button>
          <p className="subtitle">
            Nécessite un crédit de correction IA inclus dans les formules d'accès.
          </p>
        </form>
      )}

      {isExpression && expressionResult && (
        <ExpressionFeedback result={expressionResult} navigate={navigate} />
      )}
    </div>
  );
}

function ExpressionFeedback({ result, navigate }) {
  let feedback = null;
  try {
    feedback = result.feedback ? JSON.parse(result.feedback) : null;
  } catch {
    feedback = null;
  }

  return (
    <div className="card result-card">
      <h2>Correction IA</h2>
      {feedback && feedback.score_sur_20 != null ? (
        <>
          <div className="score-big">{feedback.score_sur_20}<span>/20</span></div>
          <p>Niveau CECR estimé : <strong>{feedback.niveau_cecr || "—"}</strong></p>
          <div style={{ textAlign: "left", maxWidth: 560, margin: "20px auto 0" }}>
            <h3>Points forts</h3>
            <ul>
              {(feedback.points_forts || []).map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
            <h3>Points à améliorer</h3>
            <ul>
              {(feedback.points_a_ameliorer || []).map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
          </div>
        </>
      ) : (
        <p>{(feedback && feedback.raw) || "Correction reçue."}</p>
      )}
      <p className="disclaimer">
        ⚠️ Correction générée par IA à but d'entraînement, ne remplace pas une évaluation officielle.
      </p>
      <p className="subtitle">{result.human_correction_hint}</p>
      <button className="btn btn-outline" onClick={() => window.location.reload()}>Nouvelle production</button>
      <button className="btn btn-primary" onClick={() => navigate("consultations")}>
        Demander une correction humaine approfondie
      </button>
    </div>
  );
}
