import { Request, Response } from "express";

import cypto from 'crypto';
import express from "express";
import compression from "compression";  // compresses requests
import expressValidator from "express-validator";
import bodyParser from "body-parser";
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import redis, { RedisClient } from 'redis';
import { MetadataIds, metadataIdsDecoder, ValueType, Status, statusDecoder } from './types';

// Create Express server
const app = express();
let client: RedisClient;

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

export const initDatabase = async () => {
  const redisSVC: string = 'adapter-redis-master.default.svc.cluster.local'
  client = redis.createClient({
    host: redisSVC,
    password: 'wdias123',
    db: 2,
  });
  client.on("ready", (err) => {
    console.log("Redis Client is ready !");
  }).on("error", (err) => {
    console.log("Error " + err);
  });
}

const getHash = (service: string, type: string, requestId: string, extensionFunction?: string) => {
  // service: import | export | extension
  const getService = (s: string) => {
    const serviceMap: { [key: string]: string } = {
      'Import': 'i',
      'Export': 'e',
      'Extension': 'x',
    };
    return serviceMap[s];
  }
  // type: scalar | vector | grid | transformation | validation | interpolation
  return `${requestId}:s${getService(service)}:t${type.substr(0, 2).toLocaleLowerCase()}${extensionFunction ? `:e${extensionFunction.toLocaleLowerCase()}` : ''}`;
}

const setStatus = (hash: string, timeseriesId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    client.set(hash, timeseriesId, (e: Error | null, result: 'OK' | undefined) => {
      if (e) {
        return reject(new Error(e.toString()));
      } else {
        return resolve(result && result == 'OK');
      }
    });
  });
}

const getStatus = (hash: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    client.get(hash, (e: Error | null, result: string | undefined) => {
      if (e) {
        return reject(new Error(e.toString()));
      } else {
        return resolve(result);
      }
    });
  });
}

app.post('/:timeseriesId', async (req: Request, res: Response) => {
  try {
    const timeseriesId: string = req.params.timeseriesId;
    console.log('Set Status: ', timeseriesId);
    const data: JSON = req.body;
    const s: Status = statusDecoder.runWithException(data);
    console.log(timeseriesId, ', data: ', s);
    const isSet: boolean = await setStatus(getHash(s.service, s.type, s.requestId, s.extensionFunction), timeseriesId);
    isSet ? res.send('OK') : res.status(400).send(`Unable to set requestId:${s.requestId}`);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

app.get('/import/:valueType/:requestId', async (req: Request, res: Response) => {
  try {
    const valueType: string = req.params.valueType;
    const requestId: string = req.params.requestId;
    console.log('valueType: ', req.params.valueType, ', requestId:', requestId);
    const timeseriesId: string = await getStatus(getHash('Import', valueType, requestId));
    timeseriesId ? res.send(timeseriesId) : res.status(400).send(`Status not found requestId:${requestId}`);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

app.get('/export/:valueType/:requestId', async (req: Request, res: Response) => {
  try {
    const valueType: string = req.params.valueType;
    const requestId: string = req.params.requestId;
    console.log('valueType: ', req.params.valueType, ', requestId:', requestId);
    const timeseriesId: string = await getStatus(getHash('Export', valueType, requestId));
    timeseriesId ? res.send(timeseriesId) : res.status(400).send(`Status not found requestId:${requestId}`);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

app.get('/extension/:extension/:extensionFunction/:requestId', async (req: Request, res: Response) => {
  try {
    const extension: string = req.params.extension;
    const extensionFunction: string = req.params.extensionFunction;
    const requestId: string = req.params.requestId;
    console.log('extension: ', req.params.extension, ', extensionFunction:', extensionFunction, ', requestId:', requestId);
    const timeseriesId: string = await getStatus(getHash('Extension', extension, requestId, extensionFunction));
    timeseriesId ? res.send(timeseriesId) : res.status(400).send(`Status not found requestId:${requestId}`);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

app.get('/public/hc', (req: Request, res: Response) => {
  console.log('Status Health Check');
  res.send('OK');
});

export default app;
