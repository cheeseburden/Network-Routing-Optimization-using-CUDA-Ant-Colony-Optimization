#include <iostream>
#include <vector>
#include "aco.cuh"

int main() {
    int numNodes = 5;
    std::vector<float> distances(numNodes * numNodes, -1.0f);
    std::vector<float> pheromones(numNodes * numNodes, 0.1f);

    // Create a simple network graph
    // 0 -> 1 (10), 0 -> 2 (5)
    // 1 -> 3 (10)
    // 2 -> 3 (20), 2 -> 1 (2)
    // 3 -> 4 (5)

    distances[0 * numNodes + 1] = 10.0f;
    distances[0 * numNodes + 2] = 5.0f;
    distances[1 * numNodes + 3] = 10.0f;
    distances[2 * numNodes + 3] = 20.0f;
    distances[2 * numNodes + 1] = 2.0f;
    distances[3 * numNodes + 4] = 5.0f;

    int startNode = 0;
    int destNode = 4;
    int numAnts = 32;
    int iterations = 100;

    std::cout << "Starting CUDA ACO Routing Optimization..." << std::endl;
    runCUDAACO(distances.data(), pheromones.data(), numNodes, startNode, destNode, numAnts, iterations);

    std::cout << "Optimization Complete. Modified Pheromone map:" << std::endl;
    for (int i = 0; i < numNodes; i++) {
        for (int j = 0; j < numNodes; j++) {
            if (distances[i * numNodes + j] > 0) {
                std::cout << "Edge " << i << " -> " << j << " Pheromones: " << pheromones[i * numNodes + j] << std::endl;
            }
        }
    }

    return 0;
}
