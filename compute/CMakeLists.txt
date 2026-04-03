cmake_minimum_required(VERSION 3.18)
project(CUDA_ACO LANGUAGES CXX CUDA)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CUDA_STANDARD 14)

add_executable(cuda_aco 
    src/main.cpp
    src/aco.cu
)

# Output executable to the main compute folder
set_target_properties(cuda_aco PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/bin")
