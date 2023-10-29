import * as express from 'express';
import * as morgan from 'morgan';
import { AirportDataSet } from './airportDataSet';
import { Graph } from './graph';
import { calculateShortestRoute } from '../util/calculateShortestRoute';

export async function createApp() {
  const app = express();

  await AirportDataSet.loadAirportData(new Graph());

  app.use(morgan('tiny'));

  app.get('/health', (_, res) => res.send('OK'));
  
  app.get('/airports/:code', (req, res) => {
    const code = req.params['code'];
    if (code === undefined) {
      return res.status(400).send('Must provide airport code');
    }

    const airport = AirportDataSet.getAirportCode(code.toLowerCase());
    if (airport === undefined) {
      return res.status(404).send('No such airport, please provide a valid IATA/ICAO code');
    }

    return res.status(200).send(airport);
  });

  app.get('/routes/:source/:destination', (req, res) => {
    const source = req.params['source'];
    const destination = req.params['destination'];
    if (source === undefined || destination === undefined) {
      return res.status(400).send('Must provide source and destination airports');
    }

    const sourceAirport = AirportDataSet.getAirportCode(source.toLowerCase());
    const destinationAirport = AirportDataSet.getAirportCode(destination.toLowerCase());
    if (sourceAirport === undefined || destinationAirport === undefined) {
      return res.status(404).send('No such airport, please provide a valid IATA/ICAO codes');
    }

    // The calculateShortestRoute() is CPU intensive operation.
    // Here we can use workers ("worker_threads") and make use of libuv thread pool.
    // This will increase the performance of the response by distributing its computation across the threads.
    const shortestRoute = calculateShortestRoute(AirportDataSet.getAirportGraph(), source, destination);

    return res.status(200).send({
      source: source,
      destination: destination,
      distance: shortestRoute.distance,
      hops: shortestRoute.hops,
    });
  });

  return app;
}
