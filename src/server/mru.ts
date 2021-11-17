import { Util } from '@dra2020/baseclient';

export interface Options
{
  latency?: number;
  limit?: number;
}

const DefaultOptions: Options = { latency: 1000 * 60, limit: 2000 };


interface Item
{
  msExpires: number;
  data: any;
}

export class ExpiringMRU
{
  options: Options;
  mru: { [id: string]: Item };
  _blocked: { [id: string]: boolean }
  _nBlocked: number;

  constructor(options?: Options)
  {
    this.options = Util.shallowAssignImmutable(DefaultOptions, options);
    this.mru = {};
    this._blocked = {};
    this._nBlocked = 0;
  }

  find(id: string): any
  {
    let item = this.mru[id];
    if (item !== undefined)
    {
      let msNow = (new Date()).getTime();
      if (item.msExpires < msNow)
      {
        delete this.mru[id];
        return null;
      }
      return item.data;
    }
    return null;
  }

  block(id: string): void
  {
    // Just blow this cache since we don't want to spend a lot managing it
    if (this._nBlocked > 50000)
    {
      this._blocked = {};
      this._nBlocked = 0;
    }
    this._blocked[id] = true;
    this._nBlocked++;
  }

  unblock(id: string): void
  {
    if (this._blocked[id])
    {
      delete this._blocked[id];
      this._nBlocked--;
    }
  }

  blocked(id: string): boolean
  {
    return this._blocked[id] !== undefined;
  }

  add(id: string, data: any): any
  {
    let item = this.mru[id];
    if (item === undefined)
    {
      let msNow = (new Date()).getTime();
      this.mru[id] = { msExpires: msNow + this.options.latency, data: data };
      if (Util.countKeys(this.mru) > 2*this.options.limit)
        this.cull();
    }
  }

  refresh(id: string, data: any): any
  {
    // Don't overwrite newer version of record
    let item = this.mru[id];
    if (item && item.data && item.data._atomicUpdate !== undefined && data._atomicUpdate !== undefined
        && item.data._atomicUpdate > data._atomicUpdate)
      return item.data;

    // Refresh data and expiry
    this.remove(id);
    this.add(id, data);
    return data;
  }

  freshen(id: string, data: any): any
  {
    // Only update if already present. Don't change expiry. This ensures data is up to date
    // due to a query but prevents the mru from getting polluted with lots of entries that
    // are not going to be requested again. This maintains the shell of the previous object,
    // replacing it with the current contents.
    let item = this.mru[id];

    // Don't update MRU if MRU is more up-to-date
    if (item && item.data && item.data._atomicUpdate !== undefined && data && data._atomicUpdate !== undefined
        && item.data._atomicUpdate > data._atomicUpdate)
    {
      //console.log('mru: pushToMRU: anomalous push over newer MRU data');
      return item.data;
    }

    if (item && item.data)
      return Util.shallowAssign(Util.shallowDelete(item.data, item.data), data);
    else
      return data;
  }

  freshest(id: string, data: any): any
  {
    // if present in the mru, return that, otherwise return the data passed in.
    let item = this.mru[id];

    // Don't grab MRU data if it is older than the data provided.
    if (item && item.data && item.data._atomicUpdate !== undefined && data && data._atomicUpdate !== undefined
        && item.data._atomicUpdate < data._atomicUpdate)
    {
      //console.log('mru: pullFromMRU: anomalous pull from older MRU data');
      return data;
    }

    return item && item.data ? item.data : data;
  }

  remove(id: string): void
  {
    delete this.mru[id];
  }

  cull(): void
  {
    // First delete all expired ones
    let msNow = (new Date()).getTime();
    Object.keys(this.mru).forEach((id: string) => {
        let item = this.mru[id];
        if (item.msExpires < msNow)
          delete this.mru[id];
      });

    let items: any[] = [];
    Object.keys(this.mru).forEach((id: string) => {
        items.push({ id: id, msExpires: this.mru[id].msExpires });
      });

    // Reverse sort so oldest at end of array
    items.sort((i1: any, i2: any) => { return i2.msExpires - i1.msExpires });
    // Now delete all past limit
    for (let i: number = this.options.limit; i < items.length; i++)
      delete this.mru[items[i].id];
  }
}
