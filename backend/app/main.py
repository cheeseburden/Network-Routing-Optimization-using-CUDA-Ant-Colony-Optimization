from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .runner import run_optimization

app = FastAPI(title="CUDA ACO Routing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

@app.post("/optimize")
def optimize_routing():
    # Will call the actual runner which executes the CUDA binary
    results = run_optimization()
    return {"status": "success", "data": results}
