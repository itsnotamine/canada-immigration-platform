# GeneralPass — Plateforme d'immigration au Canada

Plateforme avec deux sources de revenus :
1. **Consultation payante** (550 MAD) avec un conseiller en immigration.
2. **Packs de préparation au TCF Canada** : tests blancs (compréhension orale/écrite)
   avec score TCF estimé (100-699) + équivalence CLB, et correction experte des
   productions écrites/orales (packs Intensif/Premium).

## Stack

- **Backend** : FastAPI + SQLite (via le module standard `sqlite3`, sans ORM externe).
  Auth "maison" (hash de mot de passe + jeton signé HMAC), volontairement sans
  dépendance externe (`passlib`/`python-jose`) pour rester léger.
- **Frontend** : React (create-react-app par défaut) avec un routage simple par état
  (pas de `react-router` pour éviter une install supplémentaire), et `fetch` natif
  (pas d'`axios`).
- **Paiement** : implémentation "mock" qui valide la transaction instantanément
  (aucune clé API requise), prête à être remplacée par une vraie intégration
  Stripe — voir les commentaires dans `backend/routers/payments.py`.

## Lancer le projet en local

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optionnel mais recommandé
pip install -r requirements.txt
cp .env.example .env   # puis modifie APP_SECRET_KEY
uvicorn main:app --reload --port 8000
```

L'API tourne sur `http://localhost:8000`. La base SQLite (`backend/app.db`) et les
données de démo (packs + questions TCF) sont créées automatiquement au démarrage.

### Frontend

```bash
cd frontend
npm install
npm start
```

Le site tourne sur `http://localhost:3000` et appelle l'API sur `http://localhost:8000`
(CORS déjà configuré côté backend).

## Fonctionnalités déjà en place

- Inscription / connexion (compte utilisateur).
- Réservation + paiement d'une consultation individuelle.
- Catalogue de packs TCF + achat.
- Tests blancs TCF (compréhension orale et écrite) avec correction automatique
  et score TCF estimé (100-699) + niveau CLB approximatif.
- Soumission de productions écrites/orales pour correction experte, débloquée
  par des crédits inclus dans les packs.
- Espace personnel ("Mon espace") : historique des scores, consultations, achats
  et corrections.

## Prochaines étapes suggérées

- Brancher un vrai processeur de paiement (Stripe recommandé — voir
  `backend/routers/payments.py` pour le plan d'intégration).
- Ajouter un back-office pour que le conseiller/expert traite les demandes de
  consultation et les corrections (`is_admin` existe déjà dans la table `users`,
  il suffit de le passer à `1` en base pour un compte donné).
- Étoffer la banque de questions TCF (actuellement 12 questions de démonstration).
- Ajouter l'enregistrement/upload audio pour l'expression orale (actuellement
  soumission sous forme de texte/transcription).
- Déployer (ex. Render/Railway pour le backend, Vercel/Netlify pour le frontend)
  et migrer de SQLite vers PostgreSQL si le volume augmente.
