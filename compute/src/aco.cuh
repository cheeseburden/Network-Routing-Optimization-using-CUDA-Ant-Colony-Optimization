#pragma once

// Constants for ACO
#define ALPHA 1.0f // Pheromone importance
#define BETA 2.0f  // Heuristic information importance
#define EVAPORATION_RATE 0.5f
#define Q 100.0f   // Pheromone deposit factor
#define MAX_ANTS 256
#define MAX_ITERATIONS 100

struct GraphData {
    int numNodes;
    float* distances; 
    float* pheromones; 
};

struct AntPaths {
    int* paths;     
    int* pathLengths; 
    float* pathCosts; 
};

void runCUDAACO(const float* host_distances, float* host_pheromones, int numNodes, int startNode, int destNode, int numAnts, int iterations);
