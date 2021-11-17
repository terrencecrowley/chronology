// Shared libraries
import { Util, OT, Context, LogAbstract, FSM } from '@dra2020/baseclient';
import { Storage } from '@dra2020/baseserver';

// App libraries
import * as SM from './sessionmanager';
import { Environment, BucketMap } from './env';
import { DataBlob } from './datablob';

export interface TransferParams extends Storage.TransferParams
{
  data?: any;
}

export class FsmTransferUrl extends Storage.FsmTransferUrl
{
  data: any;
  fsm: Storage.FsmTransferUrl;
  blob: DataBlob;

  constructor(env: Environment, params: TransferParams)
  {
    super(env, 'transfers', params);
    if (params.data)
      this.data = params.data;
    this.fsm = env.storageManager.createTransferUrl(this.params);
    this.waitOn(this.fsm);
    this.key = this.fsm.key;
  }

  get env(): Environment { return this._env as Environment; }

  tick(): void
  {
    // If we are making a data blob available for download from client, upload to S3
    if (this.params.op === 'getObject' && this.data !== undefined)
    {
      this.blob = DataBlob.createForUpload(this.env, this.key, this.data, 'transfers');
      delete this.data;
      this.waitOn(this.blob.fsmSave);
    }

    // If url created and any data uploaded, we are done
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.url = this.fsm.url;
          this.setState(FSM.FSM_DONE);
          break;
      }
    }
  }
}

class FsmExpire extends FSM.Fsm
{
  fsmUrl: Storage.FsmTransferUrl;

  constructor(env: Environment, fsmUrl: Storage.FsmTransferUrl)
  {
    super(env);
    this.fsmUrl = fsmUrl;
    this.waitOn(fsmUrl);
    this.waitOn(new FSM.FsmSleep(env, 1000*60*5));
  }

  get env(): Environment { return this._env as Environment }

  tick(): void
  {
    if (this.ready)
    {
      if (! this.fsmUrl.iserror)
        DataBlob.createForDelete(this.env, this.fsmUrl.key, 'transfers');
      this.setState(FSM.FSM_DONE);
    }
  }
}

export class TransferManager
{
  env: Environment;
  enabled: boolean;

  constructor(env: Environment)
  {
    this.env = env;
    if (! this.env.context.xflag('production'))
      BucketMap['transfers'] = 'transfers-dev';

    // Handlers

    this.houseKeeping = this.houseKeeping.bind(this);
    setTimeout(this.houseKeeping, 5000);

    this.enabled = env.context.xflag('presign_enabled');
  }

  houseKeeping(): void
  {

    // And again
    setTimeout(this.houseKeeping, 5000);
  }

  createGetUrl(data: any): Storage.FsmTransferUrl
  {
    let fsmUrl = new FsmTransferUrl(this.env, { op: 'getObject', data: data });
    new FsmExpire(this.env, fsmUrl);
    return fsmUrl;
  }

  createPutUrl(contentType: string): Storage.FsmTransferUrl
  {
    return new FsmTransferUrl(this.env, { op: 'putObject', contentType: contentType });
  }

  loadData(key: string): DataBlob
  {
    return DataBlob.createForJSON(this.env, key, 'transfers');
  }
}
