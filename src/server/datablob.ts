import * as zlib from 'zlib';

// Shared libraries
import { Poly, FSM } from '@dra2020/baseclient';
import { Storage } from '@dra2020/baseserver';

// App libraries
import { Environment } from './env';

export class DataBlob extends Storage.StorageBlob
{
  constructor(env: Environment, params: Storage.BlobParams)
  {
    if (params.bucket == null) params.bucket = env.context.xflag('production') ? 'data' : 'data-dev';
    if (params.loadToType && (params.bucket.indexOf('transfers') == 0 || params.bucket.indexOf('memsqs') == 0))
      params.deleteAfterLoad = true;
    super(env, params);
  }

  get env(): Environment { return this._env as Environment; }

  get json(): any
  {
    if (this.params.loadToType !== 'object') throw 'json access only on loaded object';
    return this.params.loadTo;
  }

  get buffer(): Buffer
  {
    if (this.params.loadToType !== 'buffer') throw 'buffer access only on loaded buffer';
    return this.params.loadTo as Buffer;
  }

  get str(): string
  {
    if (this.params.loadToType !== 'string') throw 'string access only on loaded string';
    return this.params.loadTo as string;
  }

  static createForDownload(env: Environment, id: string, bucket?: string): DataBlob
  {
    let isBinary = (id.indexOf('.json') == -1 && id.indexOf('.geojson') == -1);
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
        loadToType: isBinary ? 'buffer' : 'object',
      };
    let blob = new DataBlob(env, params);
    blob.startLoad(env.storageManager);
    return blob;
  }

  static createForStringDownload(env: Environment, id: string, bucket?: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
        loadToType: 'string',
      };
    let blob = new DataBlob(env, params);
    blob.startLoad(env.storageManager);
    return blob;
  }

  static createForBinaryDownload(env: Environment, id: string, bucket?: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
        loadToType: 'buffer',
      };
    let blob = new DataBlob(env, params);
    blob.startLoad(env.storageManager);
    return blob;
  }

  static createForJSON(env: Environment, id: string, bucket?: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
        loadToType: 'object',
      };
    let blob = new DataBlob(env, params);
    blob.startLoad(env.storageManager);
    return blob;
  }

  static createForStream(env: Environment, id: string, bucket?: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
        loadToType: 'stream',
      };
    let blob = new DataBlob(env, params);
    blob.startLoad(env.storageManager);
    return blob;
  }

  static createForUpload(env: Environment, id: string, json: any, bucket?: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
        saveFromType: 'object',
        saveFrom: json,
        ContentEncoding: 'gzip',
        ContentType: 'application/json',
        CacheControl: bucket === 'editcache' ? 'no-cache' : 'max-age=14400',
      };
    let blob = new DataBlob(env, params);
    blob.setDirty();
    blob.checkSave(env.storageManager);
    return blob;
  }

  static createForBinaryUpload(env: Environment, id: string, ab: ArrayBuffer, bucket?: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
        saveFromType: 'buffer',
        saveFrom: Buffer.from(ab),
        ContentEncoding: 'gzip',
        ContentType: 'application/octet-stream',
        CacheControl: bucket === 'editcache' ? 'no-cache' : 'max-age=14400',
      };
    let blob = new DataBlob(env, params);
    blob.setDirty();
    blob.checkSave(env.storageManager);
    return blob;
  }

  static createForDelete(env: Environment, id: string, bucket: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
      };
    let blob = new DataBlob(env, params);
    blob.startDelete(env.storageManager);
    return blob;
  }

  static createForHead(env: Environment, id: string, bucket: string): DataBlob
  {
    let params: Storage.BlobParams = {
        id: id,
        bucket: bucket,
      };
    let blob = new DataBlob(env, params);
    blob.startHead(env.storageManager);
    return blob;
  }
}
