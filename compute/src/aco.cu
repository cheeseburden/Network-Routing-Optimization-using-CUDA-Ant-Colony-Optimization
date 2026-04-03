#include "aco.cuh"
#include <cuda_runtime.h>
#include <device_launch_parameters.h>
#include <curand_kernel.h>
#include <iostream>

__global__ void initCurand(curandState* state, unsigned long seed) {
    int id = blockIdx.x * blockDim.x + threadIdx.x;
    curand_init(seed, id, 0, &state[id]);
}

__global__ void constructSolutions(
    int numNodes, 
    int numAnts, 
    int startNode, 
    int destNode,
    float* distances, 
    float* pheromones, 
    int* paths, 
    int* pathLengths, 
    float* pathCosts,
    curandState* states) 
{
    int antId = blockIdx.x * blockDim.x + threadIdx.x;
    if (antId >= numAnts) return;

    curandState localState = states[antId];
    
    // Ant tracking
    int* myPath = &paths[antId * numNodes];
    // Dynamic allocation inside kernel is tricky, so let's use a fixed max size for local array
    // Assuming max nodes 1024 for this simple example.
    bool visited[1024]; 
    for(int i=0; i<numNodes; i++) visited[i] = false;

    int currentNode = startNode;
    myPath[0] = currentNode;
    visited[currentNode] = true;
    int len = 1;
    float cost = 0.0f;

    while (currentNode != destNode && len < numNodes) {
        float totalProb = 0.0f;
        float probs[1024]; 
        int validNeighbors = 0;

        for (int j = 0; j < numNodes; j++) {
            probs[j] = 0.0f;
            float dist = distances[currentNode * numNodes + j];
            if (dist > 0.0f && !visited[j]) {
                float tau = pheromones[currentNode * numNodes + j];
                float eta = 1.0f / dist; // Heuristic: 1/distance
                probs[j] = pow(tau, ALPHA) * pow(eta, BETA);
                totalProb += probs[j];
                validNeighbors++;
            }
        }

        if (validNeighbors == 0 || totalProb == 0.0f) {
            cost = -1.0f; // Dead end
            break;
        }

        float randVal = curand_uniform(&localState) * totalProb;
        float cumulative = 0.0f;
        int nextNode = -1;

        for (int j = 0; j < numNodes; j++) {
            if (probs[j] > 0.0f) {
                cumulative += probs[j];
                if (cumulative >= randVal) {
                    nextNode = j;
                    break;
                }
            }
        }

        if (nextNode == -1) nextNode = destNode; // Fallback

        cost += distances[currentNode * numNodes + nextNode];
        currentNode = nextNode;
        myPath[len++] = currentNode;
        visited[currentNode] = true;
    }

    if (currentNode != destNode) {
        cost = -1.0f; // Invalid path
    }

    pathLengths[antId] = len;
    pathCosts[antId] = cost;
    states[antId] = localState;
}

__global__ void updatePheromones(
    int numNodes, 
    int numAnts, 
    float* pheromones, 
    int* paths, 
    int* pathLengths, 
    float* pathCosts) 
{
    // 1D map to the pheromone matrix NxN
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    int totalEdges = numNodes * numNodes;
    if (idx >= totalEdges) return;

    // Evaporate
    pheromones[idx] *= (1.0f - EVAPORATION_RATE);

    // Add pheromones deposited by ants
    for (int k = 0; k < numAnts; k++) {
        if (pathCosts[k] > 0.0f) {
            int* myPath = &paths[k * numNodes];
            int len = pathLengths[k];
            float dt = Q / pathCosts[k];

            for (int i = 0; i < len - 1; i++) {
                int u = myPath[i];
                int v = myPath[i+1];
                if (u * numNodes + v == idx) {
                    pheromones[idx] += dt;
                }
            }
        }
    }
}

void runCUDAACO(const float* host_distances, float* host_pheromones, int numNodes, int startNode, int destNode, int numAnts, int iterations) {
    size_t matrixSize = numNodes * numNodes * sizeof(float);
    size_t pathsSize = numAnts * numNodes * sizeof(int);

    float *d_distances, *d_pheromones, *d_pathCosts;
    int *d_paths, *d_pathLengths;
    curandState *d_states;

    cudaMalloc(&d_distances, matrixSize);
    cudaMalloc(&d_pheromones, matrixSize);
    cudaMalloc(&d_paths, pathsSize);
    cudaMalloc(&d_pathLengths, numAnts * sizeof(int));
    cudaMalloc(&d_pathCosts, numAnts * sizeof(float));
    cudaMalloc(&d_states, numAnts * sizeof(curandState));

    cudaMemcpy(d_distances, host_distances, matrixSize, cudaMemcpyHostToDevice);
    cudaMemcpy(d_pheromones, host_pheromones, matrixSize, cudaMemcpyHostToDevice);

    int blockSize = 256;
    int numBlocksAnts = (numAnts + blockSize - 1) / blockSize;
    int numBlocksEdges = (numNodes * numNodes + blockSize - 1) / blockSize;

    initCurand<<<numBlocksAnts, blockSize>>>(d_states, 1337); // Seed
    cudaDeviceSynchronize();

    for (int iter = 0; iter < iterations; iter++) {
        constructSolutions<<<numBlocksAnts, blockSize>>>(numNodes, numAnts, startNode, destNode, d_distances, d_pheromones, d_paths, d_pathLengths, d_pathCosts, d_states);
        cudaDeviceSynchronize();

        updatePheromones<<<numBlocksEdges, blockSize>>>(numNodes, numAnts, d_pheromones, d_paths, d_pathLengths, d_pathCosts);
        cudaDeviceSynchronize();
    }

    // Retrieve the updated pheromones back
    cudaMemcpy(host_pheromones, d_pheromones, matrixSize, cudaMemcpyDeviceToHost);

    cudaFree(d_distances);
    cudaFree(d_pheromones);
    cudaFree(d_paths);
    cudaFree(d_pathLengths);
    cudaFree(d_pathCosts);
    cudaFree(d_states);
}
