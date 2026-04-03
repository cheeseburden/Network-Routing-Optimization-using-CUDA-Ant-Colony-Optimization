# Network Routing Optimization using Python/Numba CUDA

A comprehensive project for calculating optimal networking routes through graph traversal using a CUDA-accelerated Ant Colony Optimization algorithm, built directly in Python and orchestrated by a FastAPI server, visualized in a React dashboard.

## No C++ Environment Needed!
By pivoting our architecture, we successfully bypassed Microsoft Visual Studio and CMake requirements. The system compiles the GPU calculations on-the-fly (`JIT` compilation) using the simple Python `numba` library! 

**Mock Mode**
Even without the NVIDIA drivers/GPU properly installed, the backend server will automatically catch any compilation errors and return realistic mock routing data so that you can view the dashboard and see the visualization.

## Instructions to Run (PowerShell Compatible)

We have two components. You can run them in separate PowerShell tabs.

### 1. Run the Backend API Server & CUDA Engine
This acts as both the engine compiler and the API router.

Open a PowerShell terminal and run:
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```
This will start the API at `http://127.0.0.1:8000`.

### 2. Run the Frontend Dashboard
This is the modern corporate-styled visualization UI.

Open a new, separate PowerShell terminal and run:
```powershell
cd frontend
npm run dev
```
Navigate your browser to `http://localhost:5173/` to see the application!

## Application Explanation
This dashboard visualizes **Ant Colony Optimization (ACO)**. 
- Nodes (circles) represent servers/routers in a network.
- Edges (lines) represent the network cables connecting them, where `C: X` denotes the distance or latency cost.
- As the algorithm runs, simulated "ants" traverse paths on the network.
- The more optimal a path is, the more "Pheromone" is deposited by ants.
- Over time, the most optimal route will light up vividly with thicker, more opaque lines, while sub-optimal routes fade away due to evaporation.
