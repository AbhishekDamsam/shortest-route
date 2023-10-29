import * as request from 'supertest';

import { createApp } from '../index';

const TIMEOUT = 10_000;

let server: Express.Application;

describe('server', () => {
  beforeAll(async () => {
    server = await createApp();
  });

  describe('shortest route', () => {
    it('correctly routes from TLL to SFO', async () => {
      // https://www.greatcirclemap.com/?routes=TLL-TRD-KEF-YEG-SFO%2C%20TLL-ARN-OAK-SFO
      const response = await request(server).get('/routes/TLL/SFO');
      const body = response.body;

      expect(body.distance).toBeWithin(9200, 9300);
      expect(body).toEqual(expect.objectContaining({
        source: 'TLL',
        destination: 'SFO',
        hops: ['TLL', 'TRD', 'KEF', 'YEG', 'SFO']
      }));

      // Multiple acceptable hop sequences is not supported
    }, TIMEOUT);

    it('correctly routes from HAV to TAY', async () => {
      // https://www.greatcirclemap.com/?routes=%20HAV-NAS-JFK-HEL-TAY Total=> 9186Kms
      // https://www.greatcirclemap.com/?routes=%20HAV-NAS-BOS-KEF-HEL-TAY Total => 9144Kms
      const response = await request(server).get('/routes/HAV/TAY');
      const body = response.body;

      expect(body.distance).toBeWithin(9120, 9140);
      expect(body).toEqual(expect.objectContaining({
        source: 'HAV',
        destination: 'TAY',
        hops: ['HAV', 'NAS', 'BOS', 'KEF', 'HEL', 'TAY'],
      }));
    }, TIMEOUT);
  });

  describe('routes extended via ground', () => {
    it('correctly routes from TLL to LHR', async () => {
      // https://www.greatcirclemap.com/?routes=TLL-STN-LHR 
      // There is no data of route distance between STN and LHR in route.data csv file
      const response = await request(server).get('/routes/TLL/LHR');
      const body = response.body;

      expect(body.distance).toBeWithin(1810, 1820);
      expect(body).toEqual(expect.objectContaining({
        source: 'TLL',
        destination: 'LHR',
        hops: ['TLL', 'CPH', 'LHR'],
      }));
    }, TIMEOUT);
  });
});

