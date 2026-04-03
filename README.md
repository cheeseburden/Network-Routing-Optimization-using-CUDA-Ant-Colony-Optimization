# Network Routing Optimization using CUDA ACO

A comprehensive project for calculating optimal networking routes through graph traversal using a CUDA-accelerated Ant Colony Optimization algorithm, orchestrated by a FastAPI server, and visualized in a React dashboard.

## Important Note on the C++ Build

The initial `cmake` steps will fail if you do not have the **NVIDIA CUDA Toolkit** properly installed and added to your system `PATH`. Without the toolkit, the local environment cannot compile `.cu` (CUDA C++) code. 

**However, the software is designed to run in Mock Mode!**
If the compiled executable is absent, the backend server will automatically return realistic mock routing data so that you can view the dashboard and see the visualization.

## Instructions to Run (PowerShell Compatible)

We have three components. You can run them in separate PowerShell tabs.

### 1. Compile the Compute Engine (Only if CUDA is installed)
*Skip this step if you just want to view the dashboard using mock data.*

Open a PowerShell terminal and run:
```powershell
cd compute
mkdir build
cd build
cmake ..
cmake --build . --config Release
```

### 2. Run the Backend API Server
This handles requests from the dashboard and runs the executable (or returns mock data if the executable isn't compiled).

Open a new PowerShell terminal and run:
```powershell
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```
This will start the API at `http://127.0.0.1:8000`.

### 3. Run the Frontend Dashboard
This is the modern corporate-styled visualization UI.

Open a third, separate PowerShell terminal and run:
```powershell
cd frontend
npm install
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
