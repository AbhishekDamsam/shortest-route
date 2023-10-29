import { IGraph, VertexInput, Vertices } from "./types";

export class Graph implements IGraph {
    public points: string[] = []; // Exposed as public assuming the data in points will have a deep copy from Db
    public vertices: Vertices = {}; // Exposed as public assuming the data in points will have a deep copy from Db
    constructor() {
    }

    addPoint(iata: string) {
        this.points.push(iata);
        this.vertices[iata] = [];
    }

    addVertex({ sourceVertex, destinationVertex, distance }: VertexInput) {
        this.vertices[sourceVertex]?.push({ destinationVertex: destinationVertex, distance });
        this.vertices[destinationVertex]?.push({ destinationVertex: sourceVertex, distance });
    }


    // We can use below function and make points data member as private.
    // getGraphPoints(){
    //     return [ ...this.points ]
    // }
}