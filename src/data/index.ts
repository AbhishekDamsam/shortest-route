import * as parse from 'csv-parse';
import { readFile } from 'fs';
import { resolve as resolvePath } from 'path';
import { notNil, haversine } from '../util';
import { IGraph } from '../app/types';

export interface Airport {
  id: string;
  icao: string | null;
  iata: string | null;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Route {
  source: Airport;
  destination: Airport;
  distance: number;
}

function parseCSV<T extends Readonly<string[]>>(filePath: string, columns: T): Promise<{ [key in T[number]]: string }[]> {
  return new Promise((resolve, reject) => {
    readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }

      parse(data, { columns: Array.from(columns), skip_empty_lines: true, relax_column_count: true }, (err, rows) => {
        if (err) {
          return reject(err);
        }

        resolve(rows);
      });
    });
  });
}

export async function loadAirportData(): Promise<Airport[]> {
  const columns = ['airportID', 'name', 'city', 'country', 'iata', 'icao', 'latitude', 'longitude'] as const;
  //This works fine on running test suite, may be issue due to copy cmd
  const rows = await parseCSV(resolvePath(__dirname, './airports.dat'), columns); 
  
  //This works fine on server start
  //const rows = await parseCSV(resolvePath(__dirname, 'src/data/airports.dat'), columns);

  return rows.map((row) => ({
    id: row.airportID,
    icao: row.icao === '\\N' ? null : row.icao,
    iata: row.iata === '\\N' ? null : row.iata,
    name: row.name,
    location: {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    },
  }));
}


export async function loadRouteData(airportGraph: IGraph, airports: Airport[]): Promise<void> {
  const airportsById = new Map<string, Airport>(airports.map((airport) => {
    airportGraph.addPoint(airport.iata!);
    return [airport.id, airport] as const;
  }));

  const columns = ['airline', 'airlineID', 'source', 'sourceID', 'destination', 'destinationID', 'codeshare', 'stops'] as const;
  
  //This works fine on running test suite, may be issue due to copy cmd
  const rows = await parseCSV(resolvePath(__dirname, './routes.dat'), columns);
  
  //This works fine on server start
  //const rows = await parseCSV(resolvePath(__dirname, 'src/data/routes.dat'), columns);

  rows.filter((row) => row.stops === '0').map((row) => {
    const source = airportsById.get(row.sourceID);
    const destination = airportsById.get(row.destinationID);

    if (source === undefined || destination === undefined) {
      return null;
    }
    const distance = haversine(
      source.location.latitude, source.location.longitude,
      destination.location.latitude, destination.location.longitude,
    )

    if(source.iata && destination.iata){
      airportGraph.addVertex({
        sourceVertex: source.iata,
        destinationVertex: destination.iata,
        distance: parseFloat(distance.toFixed(4)),
      })
    }

    return {
      source,
      destination,
      distance,
    }
  }).filter(notNil);
}

