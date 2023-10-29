import { IGraph } from "../app/types";


function setDefaultVertexDistances(vertices: string[], source: string) {
    const distances: { [key: string]: number } = {};
    vertices.forEach((iata) => {
        distances[iata] = iata === source ? 0 : Infinity;
    });
    return distances;
}

function calculateMinDistanceVertex(graph: IGraph, source: string) {
    const visited = new Set<string>();

    // To map current vertex with nearest neighbouring vertex
    const previousVertex: { [key: string]: string | null } = {};

    // Initialize distances with Infinity because we do not know the distance, except for the source, which is 0.
    const vertexDistances = setDefaultVertexDistances(graph.points, source);

    while (true) {
        let currentVertex = null;

        // Find the unvisited node with the shortest distance.
        for (const neighbour of graph.points) {
            if (!visited.has(neighbour)) {
                const currVertexDistance: number = vertexDistances[neighbour] as number;
                const minVertexDistance: number = vertexDistances[currentVertex ?? ""] as number;
                if ((currentVertex === null || currVertexDistance < minVertexDistance)) {
                    currentVertex = neighbour;
                }
            }
        }

        // Break when all vertices are visited
        if (currentVertex === null) {
            break;
        }

        // Update distances to neighbors of the current node.
        for (const edge of graph.vertices[currentVertex]!) {
            const potentialShortestDistance = (vertexDistances[currentVertex] as number) + edge.distance;
            if (potentialShortestDistance < (vertexDistances[edge.destinationVertex] as number)) {
                vertexDistances[edge.destinationVertex] = potentialShortestDistance;
                previousVertex[edge.destinationVertex] = currentVertex;
            }
        }

        visited.add(currentVertex);
    }
    return {
        vertexDistances,
        previousVertex
    }
}

// This called functions inside this function is a potetntial candidate to be added in worker threads implementation
// Worker thread implementation will improve the overall performance of this function
export function calculateShortestRoute(graph: IGraph, source: string, destination: string) {

    const { previousVertex, vertexDistances } = calculateMinDistanceVertex(graph, source);

    const shortestRoute = [destination];
    let current = destination;

    // Traverse back from destination keys to source keys to find the route. Example LHH:CPH, CPH:TLL
    while (current !== source) {
        current = previousVertex[current] as string;
        shortestRoute.unshift(current);
    }

    return {
        source,
        destination,
        hops: shortestRoute,
        distance: vertexDistances[destination]
    };
}