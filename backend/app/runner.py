import os
import sys

if hasattr(os, 'add_dll_directory'):
    try:
        os.add_dll_directory(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\nvvm\bin\x64")
        os.add_dll_directory(r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\bin")
    except Exception:
        pass
        
os.environ["NUMBAPRO_NVVM"] = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\nvvm\bin\x64\nvvm64_40_0.dll"
os.environ["NUMBAPRO_LIBDEVICE"] = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2\nvvm\libdevice"
os.environ['CUDA_HOME'] = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.2"

from numba import cuda, float32, int32
import numpy as np
import random
import copy

# Constants for ACO
ALPHA = 1.0
BETA = 2.0
EVAPORATION_RATE = 0.5
Q = 100.0

@cuda.jit
def construct_solutions(num_nodes, num_ants, start_node, dest_node, 
                        distances, pheromones, 
                        paths, path_lengths, path_costs):
    ant_id = cuda.grid(1)
    if ant_id >= num_ants:
        return
        
    current_node = start_node
    paths[ant_id, 0] = current_node
    
    # Local memory allocation per thread
    visited = cuda.local.array(1024, dtype=int32)
    for i in range(num_nodes):
        visited[i] = 0
        
    visited[current_node] = 1
    length = 1
    cost = 0.0
    
    while current_node != dest_node and length < num_nodes:
        total_prob = 0.0
        probs = cuda.local.array(1024, dtype=float32)
        valid_neighbors = 0
        
        for j in range(num_nodes):
            probs[j] = 0.0
            dist = distances[current_node, j]
            if dist > 0.0 and visited[j] == 0:
                tau = pheromones[current_node, j]
                eta = 1.0 / dist
                p = (tau ** ALPHA) * (eta ** BETA)
                probs[j] = p
                total_prob += p
                valid_neighbors += 1
                
        if valid_neighbors == 0 or total_prob == 0.0:
            cost = -1.0
            break
            
        # Roulette selection
        rand_val = random.random() * total_prob
        cumulative = 0.0
        next_node = dest_node
        
        for j in range(num_nodes):
            if probs[j] > 0.0:
                cumulative += probs[j]
                if cumulative >= rand_val:
                    next_node = j
                    break
                    
        cost += distances[current_node, next_node]
        current_node = next_node
        paths[ant_id, length] = current_node
        visited[current_node] = 1
        length += 1
        
    if current_node != dest_node:
        cost = -1.0
        
    path_lengths[ant_id] = length
    path_costs[ant_id] = cost

@cuda.jit
def update_pheromones(num_nodes, num_ants, pheromones, paths, path_lengths, path_costs):
    # 2D Grid mapping to NxN pheromone matrix
    x, y = cuda.grid(2)
    if x >= num_nodes or y >= num_nodes:
        return
        
    # Evaporate
    current_pheromone = pheromones[x, y]
    pheromones[x, y] = current_pheromone * (1.0 - EVAPORATION_RATE)
    
    # Deposit
    deposit = 0.0
    for k in range(num_ants):
        if path_costs[k] > 0.0:
            length = path_lengths[k]
            dt = Q / path_costs[k]
            for i in range(length - 1):
                if paths[k, i] == x and paths[k, i+1] == y:
                    deposit += dt
                    
    cuda.atomic.add(pheromones, (x,y), deposit)

def format_edges(distances, pheromone_matrix, num_nodes):
    edges = []
    for i in range(num_nodes):
        for j in range(num_nodes):
            if distances[i, j] > 0:
                edges.append({
                    "from": i, 
                    "to": j, 
                    "pheromone": float(pheromone_matrix[i, j]), 
                    "weight": float(distances[i, j])
                })
    return edges

def run_optimization():
    num_nodes = 5
    num_ants = 32
    iterations = 100
    start_node = 0
    dest_node = 4
    
    # Dense distance matrix setup
    distances = np.full((num_nodes, num_nodes), -1.0, dtype=np.float32)
    distances[0, 1] = 10.0
    distances[0, 2] = 5.0
    distances[1, 3] = 10.0
    distances[2, 3] = 20.0
    distances[2, 1] = 2.0
    distances[3, 4] = 5.0

    try:
        # Remove explicit cuda.is_available() check which can give false negatives
        # Just try to allocate memory and run the kernel
            
        pheromones = np.full((num_nodes, num_nodes), 0.1, dtype=np.float32)
        
        # Allocate device memory
        d_distances = cuda.to_device(distances)
        d_pheromones = cuda.to_device(pheromones)
        
        d_paths = cuda.device_array((num_ants, num_nodes), dtype=np.int32)
        d_path_lengths = cuda.device_array(num_ants, dtype=np.int32)
        d_path_costs = cuda.device_array(num_ants, dtype=np.float32)
        
        threads_per_block = 256
        blocks_per_grid = (num_ants + threads_per_block - 1) // threads_per_block
        
        phero_threads = (16, 16)
        phero_blocks = (
            (num_nodes + phero_threads[0] - 1) // phero_threads[0],
            (num_nodes + phero_threads[1] - 1) // phero_threads[1]
        )
        
        snapshots = []
        # Save initial state
        snapshots.append(format_edges(distances, pheromones, num_nodes))

        for iter_count in range(1, iterations + 1):
            construct_solutions[blocks_per_grid, threads_per_block](
                num_nodes, num_ants, start_node, dest_node,
                d_distances, d_pheromones, d_paths, d_path_lengths, d_path_costs
            )
            update_pheromones[phero_blocks, phero_threads](
                num_nodes, num_ants, d_pheromones, d_paths, d_path_lengths, d_path_costs
            )
            
            # Extract snapshot every 10 iterations to show progression
            if iter_count % 10 == 0:
                current_pheromones = d_pheromones.copy_to_host()
                snapshots.append(format_edges(distances, current_pheromones, num_nodes))
                    
        return {"mocked": False, "message": "Successfully executed using native Numba GPU kernels", "snapshots": snapshots}
        
    except Exception as e:
        import traceback
        with open('err_numba.txt', 'w') as f:
             f.write(traceback.format_exc())
             
        # Fallback to CPU execution
        pheromones = np.full((num_nodes, num_nodes), 0.1, dtype=np.float32)
        snapshots = []
        snapshots.append(format_edges(distances, pheromones, num_nodes))
        
        for iter_count in range(1, iterations + 1):
            paths = np.zeros((num_ants, num_nodes), dtype=np.int32)
            path_lengths = np.zeros(num_ants, dtype=np.int32)
            path_costs = np.zeros(num_ants, dtype=np.float32)
            
            # Construct solutions
            for k in range(num_ants):
                current_node = start_node
                paths[k, 0] = current_node
                
                visited = np.zeros(num_nodes, dtype=np.int32)
                visited[current_node] = 1
                length = 1
                cost = 0.0
                
                while current_node != dest_node and length < num_nodes:
                    total_prob = 0.0
                    probs = np.zeros(num_nodes, dtype=np.float32)
                    valid_neighbors = 0
                    
                    for j in range(num_nodes):
                        dist = distances[current_node, j]
                        if dist > 0.0 and visited[j] == 0:
                            tau = pheromones[current_node, j]
                            eta = 1.0 / dist
                            p = (tau ** ALPHA) * (eta ** BETA)
                            probs[j] = p
                            total_prob += p
                            valid_neighbors += 1
                            
                    if valid_neighbors == 0 or total_prob == 0.0:
                        cost = -1.0
                        break
                        
                    # Roulette selection
                    rand_val = random.random() * total_prob
                    cumulative = 0.0
                    next_node = dest_node
                    
                    for j in range(num_nodes):
                        if probs[j] > 0.0:
                            cumulative += probs[j]
                            if cumulative >= rand_val:
                                next_node = j
                                break
                                
                    cost += distances[current_node, next_node]
                    current_node = next_node
                    paths[k, length] = current_node
                    visited[current_node] = 1
                    length += 1
                    
                if current_node != dest_node:
                    cost = -1.0
                    
                path_lengths[k] = length
                path_costs[k] = cost
                
            # Evaporate
            pheromones *= (1.0 - EVAPORATION_RATE)
            
            # Deposit
            for k in range(num_ants):
                if path_costs[k] > 0.0:
                    L = path_lengths[k]
                    dt = Q / path_costs[k]
                    for i in range(L - 1):
                        u = paths[k, i]
                        v = paths[k, i+1]
                        pheromones[u, v] += dt
                        
            if iter_count % 10 == 0:
                snapshots.append(format_edges(distances, pheromones, num_nodes))

        return {
            "mocked": False,
            "message": "Successfully executed using CPU computing (No CUDA device found)",
            "snapshots": snapshots
        }
