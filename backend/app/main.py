from fastapi import FastAPI, Body
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
def optimize_routing(body: dict = Body(default={})):
    num_nodes = body.get('num_nodes', 5)
    edges_data = body.get('edges', [])
    start_node = body.get('start_node', 0)
    dest_node = body.get('dest_node', 4)
    
    results = run_optimization(num_nodes, edges_data, start_node, dest_node)
    return {"status": "success", "data": results}
