// Node libraries
import * as Events from 'events';

// Public libraries
import * as session from "express-session";

// Shared libraries
import { Util, FSM } from '@dra2020/baseclient';
import { DB } from '@dra2020/baseserver';

// App libraries
import * as MRU from './mru';
import { Environment, Schemas } from './env';

const FSM_DELETING = FSM.FSM_CUSTOM1;
const FSM_UPDATING = FSM.FSM_CUSTOM2;

export type ErrCallback = (err: any) => void;
export type AllCallback = (err: any, sessions: any) => void;
export type LengthCallback = (err: any, len: number) => void;
export type GetCallback = (err: any, session: any) => void;

const CullTimeout = 1000 * 60 * 60 * 24 * 30;   // one month
const CullInterval = 1000 * 60 * 60 * 24;       // one day
const SoonInterval = 1000 * 60 * 60 * 24 * 7;   // one week

// Details on MRU management:
//  Very important to get MRU management correct for the session store, since the same cookie is seen
//  across all instances and communicates the logged-in status.
//  A user in a new browser state gets a new cookie with no user set. By logging in, that cookie now
//  gets set to hold that user hash, so it needs to be seen across all instances. If an instance was
//  holding the stale mru entry, they would not treat that user as logged in. The same issue plays out
//  when logging out - the user is removed from the cookie, but the cookie id stays the same.
//
//  We use the "flushmru" admin command to communicate flushing the mru across all instances when we
//  update the session cookie. This ensures all instances have removed stale mru entries and will see
//  the new value if they receive traffic from that client.
//

function expired(s: any): boolean
{
  if (! s || ! s.cookie || s.cookie.expires === undefined)
    return false;

  let expires = (typeof s.cookie.expires === 'string') ? new Date(s.cookie.expires) : s.cookie.expires;
  return (expires && expires <= Date.now());
}

function expiresSoon(s: any): boolean
{
  if (! s || ! s.cookie || s.cookie.expires === undefined)
    return true;
  let msExpires = (typeof s.cookie.expires === 'string') ? new Date(s.cookie.expires).getTime() : s.cookie.expires;
  let msSoon = (new Date()).getTime() + SoonInterval;
  return msExpires < msSoon;
}

class FsmFull extends FSM.Fsm
{
  query: DB.DBQuery;

  constructor(env: Environment)
  {
    super(env);
    this.query = null;
    this.waitOn(this.env.db);
    this.waitOn(this.env.storeManager.col);
  }

  get env(): Environment { return this._env as Environment; }

  tick(): void
  {
    if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.query = this.env.db.createQuery(this.env.storeManager.col, {});
          this.waitOn(this.query);
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          this.setState(FSM.FSM_DONE);
          break;
      }
    }
  }
}

class FsmClear extends FSM.Fsm
{
  query: DB.DBQuery;

  constructor(env: Environment)
  {
    super(env);
    this.query = null;
    this.waitOn(this.env.db);
    this.waitOn(this.env.storeManager.col);
  }

  get env(): Environment { return this._env as Environment; }

  tick(): void
  {
    if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.query = this.env.db.createQuery(this.env.storeManager.col, {});
          this.waitOn(this.query);
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          if (this.query.result)
            this.query.result.forEach((item: any) => { this.waitOn(this.env.storeManager.createDelete(item.id)) });
          this.setState(FSM_DELETING);
          break;

        case FSM_DELETING:
          this.setState(FSM.FSM_DONE);
          break;
      }
    }
  }
}

class FsmFind extends FSM.Fsm
{
  sid: string;
  fsmFind: DB.DBFind;
  fsmDelete: DB.DBDelete;
  session: any;

  constructor(env: Environment, sid: string)
  {
    super(env);
    this.sid = sid;
    this.fsmFind = null;
    this.session = null;
  }

  get env(): Environment { return this._env as Environment; }

  tick(): void
  {
    if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.session = this.env.storeManager.mru.find(this.sid);
          if (this.session == null)
          {
            this.fsmFind = this.env.db.createFind(this.env.storeManager.col, { id: this.sid });
            this.waitOn(this.fsmFind);
          }
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          if (this.fsmFind && this.fsmFind.result == null)
            this.setState(FSM.FSM_DONE);
          else
          {
            if (this.fsmFind)
            {
              this.session = JSON.parse(this.fsmFind.result.value);
              //console.log(`store: mru add after find: ${this.sid} to ${JSON.stringify(session)}`);
              this.env.storeManager.mru.refresh(this.sid, this.session);
            }
            if (expired(this.session))
            {
              //console.log(`store: found expired session; returning null`);
              this.session = null;
              this.fsmDelete = this.env.storeManager.createDelete(this.sid);
              this.waitOn(this.fsmDelete);
              this.setState(FSM_DELETING);
            }
            else
              this.setState(FSM.FSM_DONE);
          }
          break;

        case FSM_DELETING:
          this.setState(FSM.FSM_DONE);
          break;
      }
    }
  }
}

class FsmTouch extends FSM.Fsm
{
  sm: StoreManager;
  sid: string;
  fsmFind: FsmFind;
  session: any;

  constructor(env: Environment, sid: string, session: any)
  {
    super(env);
    this.sid = sid;
    this.session = session;
    this.fsmFind = null;
    if (! expiresSoon(session))
      this.setState(FSM.FSM_DONE);
  }

  get env(): Environment { return this._env as Environment; }

  tick(): void
  {
    if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.fsmFind = new FsmFind(this.env, this.sid);
          this.waitOn(this.fsmFind);
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          let s = this.fsmFind.session;
          if (! s || ! this.session.cookie)
            this.setState(FSM.FSM_DONE);
          else
          {
            s.cookie = this.session.cookie;
            this.env.storeManager.flushRemoteMRU(this.sid);
            this.waitOn(this.env.db.createUpdate(this.env.storeManager.col, { id: this.sid },
                          { lastActive: Util.Now(), value: JSON.stringify(s) }));
            this.setState(FSM_UPDATING);
          }
          break;

        case FSM_UPDATING:
          this.setState(FSM.FSM_DONE);
          break;
      }
    }
  }
}

export class StoreManager extends session.Store
{
  env: Environment;
  col: DB.DBCollection;
  bEmit: boolean;
  mru: MRU.ExpiringMRU;

  // Constructor
  constructor(env: Environment)
    {
      super();

      env.storeManager = this;
      this.env = env;
      this.col = this.env.db.createCollection('session', Schemas['session']);
      this.bEmit = true;
      this.mru = new MRU.ExpiringMRU({ latency: 1000 * 60 * 60 * 4, limit: 2000 });

      // Don't cull here
      //this.cull = this.cull.bind(this);
      //this.cull();
    }

  flushmru(sid: string): void
  {
    this.mru.remove(sid);
  }

  flushRemoteMRU(sid: string): void
  {
    //this.env.queueManager.sendAdmin({ nobounceback: true, command: 'flushmru', mru: 'store', id: sid });
  }

  checkConnected(): void
  {
    if (this.bEmit)
    {
      this.emit('connected');
      this.bEmit = false;
    }
  }

  cull(): void
  {
    //console.log(`store: cull`);
    let deadline = (new Date()).getTime() - CullTimeout;

    let fsmFull = new FsmFull(this.env);
    fsmFull.waitOn(this.col);
    new FSM.FsmOnDone(this.env, fsmFull, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
          this.env.log.error('storemanager:cull failed in query');
        else
        {
          for (let i: number = 0; i < fsmFull.query.result.length; i++)
          {
            let a = fsmFull.query.result[i];
            if ((new Date(a.lastActive)).getTime() < deadline)
            {
              this.env.log.event('storemanager culling');
              this.createDelete(a.id);
            }
          }
        }
      });

    // And again...
    setTimeout(this.cull, CullInterval);
  }

  createDelete(sid: string): DB.DBDelete
  {
    this.mru.remove(sid);
    this.flushRemoteMRU(sid);
    return this.env.db.createDelete(this.col, { id: sid });
  }

  all(cb: AllCallback): void
  {
    //console.log(`store: all`);
    this.checkConnected();
    let fsmFull = new FsmFull(this.env);
    new FSM.FsmOnDone(this.env, fsmFull, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
          cb('storemanager: query failed', undefined);
        else
        {
          this.env.log.event({ event: 'storemanager returning all sessions', detail: fsmFull.query.result.length });
          let sessions: any = {};
          for (let i: number = 0; i < fsmFull.query.result.length; i++)
          {
            let r = fsmFull.query.result[i];
            let s = JSON.parse(r.value);
            if (expired(s))
              this.createDelete(r.id);
            else
              sessions[r.id] = s;
          }
          cb(null, sessions);
        }
      });
  }

  destroy(sid: string, cb: ErrCallback): void
  {
    //console.log(`store: destroy(${sid})`);
    this.checkConnected();
    let fsmDelete = this.createDelete(sid);
    new FSM.FsmOnDone(this.env, fsmDelete, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
          cb('storemanager: destroy failed');
        else
          cb(null);
      });
  }

  clear(cb: ErrCallback): void
  {
    //console.log(`store: clear`);
    this.checkConnected();
    let fsmClear = new FsmClear(this.env);
    new FSM.FsmOnDone(this.env, fsmClear, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
          cb('storemanager: clear failed');
        else
        {
          this.env.log.event('storemanager clearing all sessions');
          cb(null);
        }
      });
  }

  length(cb: LengthCallback): void
  {
    //console.log(`store: length`);
    this.checkConnected();
    let fsmFull = new FsmFull(this.env);
    new FSM.FsmOnDone(this.env, fsmFull, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
          cb('storemanager: query failed', undefined);
        else
        {
          this.env.log.event({ event: 'storemanager returning length', detail: fsmFull.query.result.length });
          cb(null, fsmFull.query.result.length);
        }
      });
  }

  get(sid: string, cb: GetCallback): void
  {
    //console.log(`store: get(${sid})`);
    this.checkConnected();
    let fsmFind = new FsmFind(this.env, sid);
    new FSM.FsmOnDone(this.env, fsmFind, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
          cb('storemanager: get failed', undefined);
        else
        {
          this.emit('get', sid);
          //console.log(`store: get(${sid}) complete: ${JSON.stringify(fsmFind.session)}`);
          cb(null, fsmFind.session);
        }
      });
  }

  set(sid: string, session: any, cb: ErrCallback): void
  {
    //console.log(`store: set(${sid}): ${JSON.stringify(session)}`);
    this.checkConnected();

    // Flush from other instances
    this.flushRemoteMRU(sid);

    let fsmUpdate = this.env.db.createUpdate(this.col, { id: sid },
                                                       { id: sid, lastActive: Util.Now(), value: JSON.stringify(session) });
    new FSM.FsmOnDone(this.env, fsmUpdate, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
        {
          this.mru.remove(sid);
          cb('storemanager: set failed');
        }
        else
        {
          //console.log(`store: set(${sid}) complete: ${JSON.stringify(session)}`);
          this.mru.refresh(sid, session);
          this.emit('update', sid); // maybe should emit 'create' if this is first one as reported by underlying DB
          this.emit('set', sid);
          cb(null);
        }
      });
  }

  touch(sid: string, session: any, cb: ErrCallback): void
  {
    //console.log(`store: touch(${sid}): ${JSON.stringify(session)}`);
    this.checkConnected();
    let fsmTouch = new FsmTouch(this.env, sid, session);
    new FSM.FsmOnDone(this.env, fsmTouch, (fsm: FSM.Fsm) => {
        if (fsm.iserror)
          cb('storemanager: touch failed');
        else
        {
          this.emit('touch', sid);
          cb(null);
        }
      });
  }

  close(): void
  {
    // Shared DB connection - ignore
  }
}
