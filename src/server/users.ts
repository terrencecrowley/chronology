// Node
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';

// Shared libraries
import { Util, FSM } from '@dra2020/baseclient';
import { DB } from '@dra2020/baseserver';

// App libraries
import * as SM from './serversession';
import * as MRU from './mru';
import { Environment, Schemas } from './env';

const MaxDailyResets: number = 10;

// For bootstrapping admin - email of user to set as admin. Email must be verified.
let specialAdmin: string;

export type Roles = { [role: string]: boolean }

export interface IUser
{
  id: string;
  name: string;
  email: string;
  twitterhandle: string;
  hashPW: string;
  cachekey: string;
  verified: boolean;
  admin: boolean;
  roles: Roles;
  verifyGUID: string;
  resetGUID: string;
  resetTime: Util.DateString;
  lastActive: Util.DateString;
  modifyTime: Util.DateString;
  resetCount: number;
  accessed: any;
  likeID: string;
  visitData: {[key: string]: any};    // Place for any data to track user, for example to allow one-time pop-up for some change
}

export interface IPublicUser
{
  id: string;
  name: string;
  twitterhandle?: string;
}

function toPublic(u: IUser): IPublicUser
{
  return { id: u.id, name: u.name, twitterhandle: u.twitterhandle ? u.twitterhandle : '' };
}

export type UserCallback = (u: IUser) => void;
type NameCache = { [id: string]: IPublicUser };

function canonicalEmail(email: string): string
{
  return email.trim().toLowerCase();
}

export class FsmFind extends FSM.Fsm
{
  find: DB.DBFind;
  findLower: DB.DBFind;
  user: IUser;

  constructor(env: Environment, col: DB.DBCollection, filter: any)
    {
      super(env);
      if (Util.countKeys(filter) === 1 && filter.id !== undefined)
        this.user = this.env.userManager.mru.find(filter.id) as IUser;
      else
        this.user = null;
      /* REMOVE SERVICE DEPENDENCIES
      if (this.user == null)
      {
        this.find = this.env.db.createFind(col, filter);
        this.waitOn(this.find);

        // Also look up lowercase email if looking up by email
        if (Util.countKeys(filter) === 1 && filter.email !== undefined && filter.email !== canonicalEmail(filter.email))
        {
          filter = { email: canonicalEmail(filter.email) };
          this.findLower = this.env.db.createFind(col, filter);
          this.waitOn(this.findLower);
        }
      }
      */
      this.setState(FSM.FSM_DONE);
    }

  get env(): Environment { return this._env as Environment }

  tick(): void
    {
      if (this.ready && this.isDependentError)
        this.setState(FSM.FSM_ERROR);
      else if (this.ready && this.state == FSM.FSM_STARTING)
      {
        if (this.find)
        {
          this.user = this.find.result as IUser;
          if (this.user == null && this.findLower)
            this.user = this.findLower.result as IUser;
          if (this.user)
            this.env.userManager.mru.refresh(this.user.id, this.user);
        }
        if (this.user && this.user.accessed && typeof this.user.accessed === 'string')
          this.user.accessed = (this.user.accessed === '') ? {} : JSON.parse(this.user.accessed);
        if (this.user && this.user.modifyTime === undefined)
          this.user.modifyTime = Util.Now();
        this.setState(FSM.FSM_DONE);
      }
    }
}

export class FsmUpdate extends FSM.Fsm
{
  fsmUpdate: DB.DBUpdate;
  query: any;
  set: any;
  user: IUser;

  constructor(env: Environment, query: any, set: any)
    {
      super(env);
      this.query = query;
      this.set = set;
      /* REMOVE SERVICE DEPENDENCIES */
      this.setState(FSM.FSM_ERROR);
    }

  get env(): Environment { return this._env as Environment }

  tick(): void
    {

      if (this.ready && this.isDependentError)
        this.setState(FSM.FSM_ERROR);
      else if (this.ready)
      {
        switch (this.state)
        {
          case FSM.FSM_STARTING:
            this.fsmUpdate = this.env.db.createUpdate(this.env.userManager.col, this.query, this.set);
            this.waitOn(this.fsmUpdate);
            this.setState(FSM.FSM_PENDING);
            break;

          case FSM.FSM_PENDING:
            if (this.fsmUpdate.result)
              this.user = this.env.userManager.mru.refresh(this.fsmUpdate.result.id, this.fsmUpdate.result);
            this.setState(FSM.FSM_DONE);
            break;
        }
      }
    }
}

class FsmEnsureAnon extends FSM.Fsm
{
  find: FsmFind;

  constructor(env: Environment)
    {
      super(env);
      this.find = null;
    }

  get env(): Environment
    {
      return this._env as Environment;
    }

  tick(): void
    {

      if (this.ready && this.isDependentError)
        this.setState(FSM.FSM_ERROR);
      else if (this.ready)
      {
        switch (this.state)
        {
          case FSM.FSM_STARTING:
            this.find = this.env.userManager.find({ id: 'anonymous' });
            this.waitOn(this.find);
            this.setState(FSM.FSM_PENDING);
            break;

          case FSM.FSM_PENDING:
            if (this.find.user == null)
              this.env.userManager.createUser({ id: 'anonymous', name: 'anonymous', email: 'anonymous' });
            this.setState(FSM.FSM_DONE);
            break;
        }
      }
    }
}

export class UserManager
{
  env: Environment;
  col: DB.DBCollection;
  names: NameCache;
  mru: MRU.ExpiringMRU;

  // Constructor
  constructor(env: Environment)
    {
      this.env = env;
      /* REMOVE SERVICE DEPENDENCIES
      this.col = this.env.db.createCollection('users', Schemas['users']);
      this.env.db.createIndex(this.col, 'email');
      */
      this.names = {};
      this.mru = new MRU.ExpiringMRU({ latency: 1000 * 60 * 60 });
      specialAdmin = this.env.context.xstring('special_admin');
      new FsmEnsureAnon(env);
    }

  get isDBError(): boolean
    {
      return (this.col && this.col.iserror) || (this.env.db && this.env.db.iserror);
    }

  userNew(o?: any): IUser
    {
      let now = Util.Now();

      let u: IUser = {
        id: Util.createGuid(),
        name: '',
        twitterhandle: '',
        email: '',
        hashPW: '',
        cachekey: Util.createGuid(),
        verified: false,
        admin: false,
        roles: {},
        verifyGUID: Util.createGuid(),
        resetGUID: Util.createGuid(),
        resetTime: now,
        modifyTime: now,
        lastActive: null,
        resetCount: 0,
        accessed: {},
        likeID: Util.createGuid(),
        visitData: {},
      };

      if (o)
        Util.shallowAssign(u, this.massageUpdate(u, o));

      return u;
    }

  createUser(o: any): FSM.Fsm
    {
      let u: IUser = this.userNew(o);
      this.names[u.id] = toPublic(u);
      if (o.email) o.email = canonicalEmail(o.email);
      let update = new FsmUpdate(this.env, { id: u.id }, u);
      if (this.isDBError)
        update.setState(FSM.FSM_ERROR);
      return update;
    }

  massageUpdate(u: IUser, o: any): any
    {
      if (o.email === '')
        delete o.email;
      if (o.name === '')
        delete o.name;
      if (o.email)
      {
        // Reset verified flag if updating email from non-empty to non-empty
        o.email = canonicalEmail(o.email);
        if (u.email != '' && u.email != o.email)
          o.verified = false;
      }
      if (o.password !== undefined)
      {
        if (o.password != '')
        {
          o.hashPW = bcrypt.hashSync(o.password, 8);
          o.resetCount = 0;
        }
        delete o.password;
      }

      // This is a bootstrap to get admin access up and working - service environment variable
      if (! u.admin && specialAdmin && u.email == specialAdmin)
        o.admin = true;

      // This is bootstrap to ensure likeID is setup
      if (u.likeID === undefined)
        o.likeID = Util.createGuid();

      // This is bootstrap to ensure roles is setup
      if (u.roles === undefined)
        o.roles = {};

      // Don't update modify time for simply marking active
      if (o.lastActive === undefined)
        o.modifyTime = Util.Now();

      // Update in-memory version as well
      Util.shallowAssign(u, o);

      return o;
    }

  updateUser(u: IUser, o: any): FsmUpdate
    {
      if (u)
      {
        this.names[u.id] = toPublic(u);
        let update = new FsmUpdate(this.env, { id: u.id }, this.massageUpdate(u, o));
        if (this.isDBError)
          update.setState(FSM.FSM_ERROR);
        return update;
      }
      return null;
    }

  userValidPassword(u: IUser, pw: string): boolean
    {
      try
      {
        let result = bcrypt.compareSync(pw, u.hashPW);
        return result;
      }
      catch(err)
      {
        return false;
      }
    }

  userMarkActive(u: IUser): FSM.Fsm
    {
      if (u)
      {
        // Only once an hour
        let msNow = (new Date()).getTime();
        let msThen = u.lastActive ? (new Date(u.lastActive)).getTime() : 0;
        if (msNow - msThen > 1000 * 60 * 60)
          return this.updateUser(u, { lastActive: Util.Now() });
      }
      return null;
    }

  userToAdmin(u: IUser): any
    {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        admin: u.admin,
        lastActive: u.lastActive ? u.lastActive : ''
        };
    }

  userToView(u: IUser): any
    {
      let o: any = {
          id: u.id,
          cachekey: u.cachekey,
          email: u.email,
          name: u.name,
          twitterhandle: u.twitterhandle,
          verified: u.verified,
          accessed: this.userAccessed(u),
          visitData: u.visitData ? u.visitData : {},
          modifyTime: u.modifyTime,
        };
      if (u.admin)
        o.admin = true;
      o.roles = u.roles === undefined ? {} : u.roles;
      return o;
    }

  userResetPasswordAllowed(u: IUser): boolean
    {
      let update: any = {};

      if (u.resetGUID == '')
        update.resetGUID = Util.createGuid();
      let bOK: boolean = true;
      if (u.resetTime !== undefined)
      {
        let resetTime = new Date(u.resetTime);
        let now: Date = new Date();
        let diff: number = now.getTime() - resetTime.getTime();
        if (diff < 1000*60*60*24)
        {
          if (u.resetCount >= MaxDailyResets)
            bOK = false;
          else
            update.resetCount = u.resetCount + 1;
        }
        else
        {
          // Reset daily limits
          update.resetTime = Util.Now();
          update.resetCount = 1;
        }
      }
      else
      {
        // Initialize daily limits
        update.resetTime = Util.Now();
        update.resetCount = 1;
      }
      this.updateUser(u, update);
      return bOK;
    }

  publicUserOf(id: string): IPublicUser
    {
      // Cheap synchronous cached lookup for passing createdBy names to shared users
      let puser = this.names[id];
      if (puser === undefined)
      {
        puser = { id: id, name: id }; // just use literal id as name for now
        this.names[id] = puser;       // prevents subsequent re-launch to cache name
        // Run asynchronously so it is there next time
        this.findCB( { id: id }, (u: IUser) => { this.names[id] = toPublic(u) } );
      }
      return puser;
    }

  findByEmail(email: string): FsmFind
    {
      let fsmFind = new FsmFind(this.env, this.col, { email: email });
      if (this.isDBError)
        fsmFind.setState(FSM.FSM_ERROR);
      return fsmFind;
    }

  find(filter: any): FsmFind
    {
      return new FsmFind(this.env, this.col, filter);
    }

  findAnon(cb: UserCallback): void
    {
      let dbFind = this.find({ id: 'anonymous' });
      let dbOn = new FSM.FsmOnDone(this.env, dbFind, (fsm: FSM.Fsm) => {
          let u: IUser = (fsm && fsm.state === FSM.FSM_DONE) ? dbFind.user : null;
          if (u)
            this.names[u.id] = toPublic(u);
          cb(u);
        });
    }

  findCB(filter: any, cb: UserCallback): void
    {
      let dbFind = this.find(filter);
      let dbOn = new FSM.FsmOnDone(this.env, dbFind, (fsm: FSM.Fsm) => {
          let u: IUser = (fsm && fsm.state === FSM.FSM_DONE) ? dbFind.user : null;
          if (u)
            this.names[u.id] = toPublic(u);
          cb(u);
        });
    }

  toggleField(filter: any, field: string): void
    {
      this.findCB(filter, (user: IUser) => {
          if (user)
          {
            let b: boolean;
            switch (field)
            {
              case 'admin': b = user.admin; break;
              case 'verified': b = user.verified; break;
            }
            if (b !== undefined)
              this.updateUser(user, { [field]: !b });
          }
        });
    }

  userAccessed(user: IUser): any
    {
      if (user && user.id !== 'anonymous')
        return user.accessed ? Util.deepCopy(user.accessed) : {};
      return ({});
    }

  userSetAccessed(user: IUser, sid: string): boolean
    {
      if (user && user.id !== 'anonymous')
      {
        let o = this.userAccessed(user);
        if (o[sid] === undefined)
        {
          o[sid] = '';
          this.updateUser(user, { accessed: o });
          return true;
        }
      }
      return false;
    }

  userClearAccessed(user: IUser, sid: string): boolean
    {
      if (user)
      {
        let o = this.userAccessed(user);
        if (o[sid] !== undefined)
        {
          delete o[sid];
          this.updateUser(user, { accessed: o });
          return true;
        }
      }
      return false;
    }

  toAdmin(): any[]
    {
      let a: any[] = [];

      //for (let i: number = 0; i < this.users.length; i++)
       // a.push(this.userToAdmin(this.users[i]));

      return a;
    }
}
