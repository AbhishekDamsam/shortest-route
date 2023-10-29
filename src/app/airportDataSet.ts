import { flatten, notNil } from "../util";
import { Airport, loadAirportData, loadRouteData } from "../data";
import { IGraph } from "./types";

export class AirportDataSet {
    private static airports: Airport[];
    private static airportGraph: IGraph;
    private static airportsByCode: Map<string, Airport>;

    private constructor() {

    }

    static async loadAirportData(graph: IGraph) {
        if (!AirportDataSet.airports) {
            
            AirportDataSet.airports = await loadAirportData();
            AirportDataSet.airportGraph = graph;

            await loadRouteData(AirportDataSet.airportGraph, AirportDataSet.airports);

            AirportDataSet.airportsByCode = new Map<string, Airport>(
                flatten(AirportDataSet.airports.map((airport) => [
                    airport.iata !== null ? [airport.iata.toLowerCase(), airport] as const : null,
                    airport.icao !== null ? [airport.icao.toLowerCase(), airport] as const : null,
                ].filter(notNil)
                ))
            );
        }
    }

    static getAirportCode(airportCode: string) {
        return AirportDataSet.airportsByCode.get(airportCode.toLowerCase());
    }

    static getAirportGraph() {
        return AirportDataSet.airportGraph;
    }
}