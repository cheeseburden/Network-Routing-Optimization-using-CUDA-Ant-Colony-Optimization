#pragma once
#include <vector>

struct Edge {
    int to;
    float weight; // Cost or distance
};

struct Graph {
    int numNodes;
    std::vector<std::vector<Edge>> adjList;
    std::vector<std::vector<float>> pheromones;

    Graph(int n);
    void addEdge(int from, int to, float weight);
};
