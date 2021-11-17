import * as objectHash from 'object-hash';

import { Util } from "@dra2020/baseclient";

export function qhash(o: any, keys?: any): any
{
  // Copy only specified keys into temp object if subset provided.
  if (keys !== undefined)
  {
    let tmpO: any = {};
    for (let p in keys) if (keys.hasOwnProperty(p))
      tmpO[p] = o[p];
    o = tmpO;
  }

  return objectHash(o, { unorderedArrays: true, unorderedSets: true, });
}

export function keyhash(o: any, omitKeys?: any): any
{
  let oo: any = Util.shallowCopy(o);
  if (oo && omitKeys)
  {
    for (let p in omitKeys) if (omitKeys.hasOwnProperty(p))
      delete oo[p];
  }

  return objectHash(oo, { unorderedArrays: true, unorderedSets: true, });
}
