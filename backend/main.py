from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from seed_data import seed_if_empty
from routers import auth, consultations, packs, tcf, payments

app = FastAPI(title="Canada Immigration Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL du frontend React (npm start)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    seed_if_empty()


@app.get("/")
def root():
    return {"message": "Canada Immigration API running"}


app.include_router(auth.router)
app.include_router(consultations.router)
app.include_router(packs.router)
app.include_router(tcf.router)
app.include_router(payments.router)
