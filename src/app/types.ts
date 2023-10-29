
export interface VertexDistance {
    destinationVertex: string,
    distance: number;
}

export interface VertexInput extends VertexDistance {
    sourceVertex: string;
}

export interface ShortestRouteResponse {
    source: string;
    destination: string;
    distance: number;
    hops: string[]
}

export type Vertices = { [key: string]: VertexDistance[] }

export interface IGraph {
    points: string[];
    vertices: Vertices;
    addPoint(code: string): void;
    addVertex(vertex: VertexInput): void;
}