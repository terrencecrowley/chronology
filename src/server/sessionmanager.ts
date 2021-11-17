// Node Packages
import * as fs from 'fs';

// Public OT libraries
import { OT, Util, LogAbstract, FSM } from '@dra2020/baseclient';
import { Storage, DB, Lambda } from '@dra2020/baseserver';

// Public libraries
import * as striptags from 'striptags';

// App libraries
import { Environment, Schemas, Fsm } from './env';
import * as SM from './serversession';
import * as UM from './users';
import * as MRU from './mru';
import { DataBlob } from './datablob';

const ErrorImport: string = 'Import failed, could not parse file.';
const ErrorFileSize: string = 'Import failed, file too large.';

// Force error either on receiving request or after successfully processing request (to mimic comm errors either way)
let forceErrorFrequency: number;

const msOneSecond: number = 1000;
const msOneMinute: number = 60 * msOneSecond;
const msOneHour: number = 60 * msOneMinute;
const msOneDay: number = 24 * msOneHour;
const msOneWeek: number = 7 * msOneDay;

const ExpungeDelay: number = Number(process.env.EXPUNGE_DELAY) || (msOneWeek * 4);

let UniqueState: number = FSM.FSM_CUSTOM1;
export const FSM_LOADINGLIVE: number = UniqueState++;
export const FSM_CREATING: number = UniqueState++;
export const FSM_UPLOADING: number = UniqueState++;
export const FSM_DOWNLOADING: number = UniqueState++;
export const FSM_FINDING: number = UniqueState++;
export const FSM_LOADINGREVISION: number = UniqueState++;
export const FSM_UNLINKING: number = UniqueState++;
export const FSM_IMPORTING: number = UniqueState++;
export const FSM_READING: number = UniqueState++;
export const FSM_PARSING: number = UniqueState++;
export const FSM_DELETING: number = UniqueState++;
export const FSM_QUEUED: number = UniqueState++;
export const FSM_LOADINGDATA: number = UniqueState++;
export const FSM_VALIDATING: number = UniqueState++;
export const FSM_FINALIZING: number = UniqueState++;
export const FSM_SAVINGSESSION: number = UniqueState++;
export const FSM_UPDATING: number = UniqueState++;

function trace(env: Environment, s: string): void
{
  if (env.context.xflag('ot_fail_mode'))
    console.log(s);
}

export class FsmFind extends FSM.Fsm
{
  query: any;
  fsmFind: DB.DBFind;
  sp: OT.SessionProps;

  constructor(env: Environment, query: any)
    {
      super(env);
      this.query = query;
      this.sp = env.sessionManager.mru.find(query.id);
      if (this.sp || env.sessionManager.mru.blocked(query.id))
        this.setState(FSM.FSM_DONE);
    }

  get env(): Environment { return this._env as Environment; }

  tick(): void
    {
      if (this.ready && this.isDependentError)
        this.setState(FSM.FSM_ERROR);
      if (this.ready)
      {
        switch (this.state)
        {
          case FSM.FSM_STARTING:
            this.fsmFind = this.env.db.createFind(this.env.sessionManager.col, this.query);
            this.waitOn(this.fsmFind);
            this.setState(FSM.FSM_PENDING);
            break;

          case FSM.FSM_PENDING:
            this.sp = this.fsmFind.result;
            if (this.sp && this.sp.expunged)
              this.sp = null;
            if (this.sp)
              this.sp = this.env.sessionManager.mru.refresh(this.sp.id, this.sp);
            else
              this.env.sessionManager.mru.block(this.query.id);
            this.setState(FSM.FSM_DONE);
            break;
        }
      }
    }
}

export class FsmAPIBase extends FSM.Fsm
{
  api: string;
  userid: string;
  apilabel: string;
  responseBody: any;
  timer: LogAbstract.AsyncTimer;

  constructor(env: Environment, api: string, userid: string)
    {
      super(env);
      this.apilabel = `${api}`;
      this.api = api;
      this.userid = userid;
      this.responseBody = { result: OT.ESuccess };
      this.apiLogStart();
    }

  get env(): Environment { return this._env as Environment; }

  apiLogStart(): void
    {
      this.timer = new LogAbstract.AsyncTimer(this.env.log, this.api);
      this.env.log.event({ event: `API ${this.apilabel} started`, userid: this.userid });
      this.env.sessionManager.requestsTotal++;
      this.env.sessionManager.requestsOutstanding++;
    }

  apiLogComplete(): void
    {
      this.env.sessionManager.requestsOutstanding--;
      this.env.log.event({ event: `API ${this.apilabel} ended`, userid: this.userid });
      this.timer.log();
    }

  get responded(): boolean
    {
      return this.responseBody == null;
    }

  apiComplete(): void
    {
      this.apiLogComplete();
      this.responseBody = null;
      this.setState(FSM.FSM_DONE);
    }

  forceError(): boolean
    {
      throw 'override forceError in subclass';
    }

  dispatchResponse(): void
    {
      throw 'override dispatchResponse in subclass';
    }

  respond(result?: number, message?: string): void
    {
      if (this.responded)
      {
        return;
      }

      if (result !== undefined)
        this.responseBody.result = result;
      if (message !== undefined)
        this.responseBody.message = message;

      this.dispatchResponse();
      this.apiComplete();
    }

  respondBadRequest()
    {
      this.respond(OT.EBadRequest);
    }
}

export class FsmAPI extends FsmAPIBase
{
  req: any;
  res: any;
  user: UM.IUser;

  constructor(env: Environment, api: string, req: any, res: any)
  {
    let u = req.user as UM.IUser;
    let id = u ? u.id : '';
    super(env, api, id);
    this.user = u;
    this.req = req;
    this.res = res;
  }

  header(name: string): string
  {
    return this.req.headers[name];
  }

  host(): string
  {
    return this.header('host');
  }

  forceError(): boolean
  {
    if (!this.env.context.xflag('production') && (Math.random() < forceErrorFrequency))
    {
      this.res.status(503).json({ error: 'Simulated server error' });
      return true;
    }
    return false;
  }

  dispatchResponse(): void
  {
    if (this.forceError())
      this.env.log.event({ event: `API ${this.api}: response intercepted with forced error 503` });
    else
      this.res.json(this.responseBody);
  }

  addUserToResponse(): void
  {
    if (this.user && this.responseBody)
      this.responseBody.user = this.env.userManager.userToView(this.user);
  }
}

// OT_FAIL_MODE:
//    bit(0) set means fail requests periodically (mimics failure of server to receive client request)
//    bit(1) set means fail responses periodically (mimics failure of server to send client response)
//    bit(2) set means discard livesession periodically (mimics server restart)
//

let SendEventCount = 0;
function failSendRequest(env: Environment): boolean
{
  return ((env.context.xnumber('ot_fail_mode') & 1) && (SendEventCount % 5) == 0)
}
function failSendResponse(env: Environment): boolean
{
  return ((env.context.xnumber('ot_fail_mode') & 2) && (SendEventCount % 7) == 0)
}

export class FsmAPIUserView extends FsmAPI
{
  constructor(env: Environment, req: any, res: any)
    {
      super(env, 'userview', req, res);
    }

  tick(): void
    {
      if (this.ready)
      {
        switch (this.state)
        {
          case FSM.FSM_STARTING:
            this.addUserToResponse();
            this.setState(FSM.FSM_PENDING);
            break;

          case FSM.FSM_PENDING:
            this.respond();
            break;
        }
      }
    }
}

export class FsmAPIProfile extends FsmAPI
{
  fsmFind: UM.FsmFind;

  constructor(env: Environment, req: any, res: any)
    {
      super(env, 'updateprofile', req, res);
      this.fsmFind = null;
    }

  tick(): void
    {
      if (this.ready && this.isDependentError)
      {
        this.setState(FSM.FSM_ERROR);
        this.respond(OT.EFail);
      }
      else if (this.ready)
      {
        switch (this.state)
        {
          case FSM.FSM_STARTING:
            {
              let body: any = this.req.body;
              if (body.verify !== undefined)
                this.sendVerifyEmail();
              else if (body.feedback !== undefined)
                console.log(`feedback: ${body.feedback}`);
              else
              {
                if (body.email)
                {
                  this.fsmFind = this.env.userManager.findByEmail(body.email);
                  this.waitOn(this.fsmFind);
                }
                this.setState(FSM_FINDING);
              }
            }
            break;

          case FSM_FINDING:
            {
              let other = this.fsmFind ? this.fsmFind.user : null;
              if (other && other.id != this.user.id)
                this.respond(OT.EFail, 'User account for that email already exists.');
              else
              {
                let body: any = this.req.body;
                let set: any = {};
                if (body.email !== undefined) set.email = body.email;
                if (body.name !== undefined) set.name = body.name;
                if (body.password !== undefined) set.password = body.password;
                if (body.twitterhandle !== undefined) set.twitterhandle = body.twitterhandle;
                if (body.visitData !== undefined) set.visitData = body.visitData;
                this.env.userManager.updateUser(this.user, set);
                this.addUserToResponse();
                this.responseBody.updateusers = { [this.user.id]: this.env.userManager.userToView(this.user) };
                this.respond();
              }
            }
            break;
        }
      }
    }

   sendVerifyEmail(): void
    { 
      /*
      let emailUrl: string = this.env.context.xstring('email_verify_server') + '/verify/' + this.user.verifyGUID;

      this.env.emailManager.sendTo(this.user.email, 'Email verification for DRA 2020',
        'Follow this link to verify your email for DRA 2020: ' + emailUrl,
        'Follow this link to verify your email for DRA 2020: ' + '<a href="' + emailUrl + '">' + emailUrl + '</a>');
      */
      this.respond();
    }
}

export class FsmAPIResetPassword extends FsmAPI
{
  fsmFind: UM.FsmFind;

  constructor(env: Environment, req: any, res: any, email: string)
    {
      super(env, 'resetpassword', req, res);

      this.fsmFind = this.env.userManager.findByEmail(email);
      this.waitOn(this.fsmFind);
    }

  tick(): void
    {
      if (this.ready && this.isDependentError)
      {
        this.setState(FSM.FSM_ERROR);
        this.respond(OT.EFail);
      }
      else if (this.ready && this.state == FSM.FSM_STARTING)
      {
        let user = this.fsmFind.user;

        if (user == null)
          this.respond(OT.EFail, 'No such user.');
        else if (! this.env.userManager.userResetPasswordAllowed(user))
          this.respond(OT.EFail, 'Too many password attempts. Try again tomorrow.');
        else
        {
          /*
          let emailUrl: string = this.env.context.xstring('email_verify_server') + '/forgotpassword/reset/' + user.resetGUID;

          this.env.emailManager.sendTo(user.email, 'Password reset for DRA 2020',
            'Follow this link to reset your password for DRA 2020: ' + emailUrl,
            'Follow this link to reset your password for DRA 2020: ' + '<a href="' + emailUrl + '">' + emailUrl + '</a>');
          */
          this.respond(OT.ESuccess, 'Check your email for a password reset message.');
        }
      }
    }
}

export class FsmAPIResetPasswordByGUID extends FsmAPI
{
  password: string;
  resetGUID: string;
  fsmFind: UM.FsmFind;

  constructor(env: Environment, req: any, res: any, password: string, resetGUID: string)
    {
      super(env, 'resetpasswordbyguid', req, res);

      this.password = password;
      this.resetGUID = resetGUID;

      if (this.password == '' || this.resetGUID == '')
        this.respond(OT.EBadRequest);
      else
      {
        this.fsmFind = this.env.userManager.find({ resetGUID: resetGUID });
        this.waitOn(this.fsmFind);
      }
    }

  tick(): void
    {
      if (this.ready && this.isDependentError)
      {
        this.setState(FSM.FSM_ERROR);
        this.respond(OT.EFail);
      }
      else if (this.ready && this.state == FSM.FSM_STARTING)
      {
        let user = this.fsmFind.user;

        if (user == null)
          this.respond(OT.EFail, 'No such user.');
        else
        {
          this.env.userManager.updateUser(user, { password: this.password, resetGUID: Util.createGuid() });
          this.respond();
        }
      }
    }
}

export class FsmAPIVerifyEmail extends FsmAPI
{
  fsmFind: UM.FsmFind;

  constructor(env: Environment, req: any, res: any, verifyGUID: string)
    {
      super(env, 'verifyemail', req, res);

      this.fsmFind = this.env.userManager.find({ verifyGUID: verifyGUID });
      this.waitOn(this.fsmFind)
    }

  tick(): void
    {
      if (this.ready && this.isDependentError)
      {
        this.setState(FSM.FSM_ERROR);
        this.respond(OT.EFail);
      }
      else if (this.ready && this.state == FSM.FSM_STARTING)
      {
        let user = this.fsmFind.user;
        let message = user ? 'Email verified.' : 'User not found.';
        if (user && !user.verified)
          this.env.userManager.updateUser(user, { verified: true });
        this.res.type('text/plain');
        this.res.send(message);
        this.apiComplete();
      }
    }
}

let IndexHtml: string[] = undefined;

class FsmLoadHtml extends FSM.Fsm
{
  fileContents: FsmReadFile;

  constructor(env: Environment)
  {
    super(env);
    this.fileContents = null;
  }

  get env(): Environment { return this._env as Environment; }

  tick(): void
  {
    if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          if (IndexHtml !== undefined)
            this.setState(IndexHtml.length == 3 ? FSM.FSM_DONE : FSM.FSM_ERROR);
          else
          {
            this.fileContents = new FsmReadFile(this.env, 'pages/index.html', false);
            this.waitOn(this.fileContents);
            this.setState(FSM_READING);
          }
          break;

        case FSM_READING:
          if (this.isDependentError)
            this.setState(FSM.FSM_ERROR);
          else
          {
            IndexHtml = this.fileContents.result.split('<!-- INJECTHEAD -->');
            if (IndexHtml.length != 3)
            {
              console.log('pages/index.html missing INJECT comment');
              this.env.log.error('failure loading INJECTable index page');
              this.setState(FSM.FSM_ERROR);
            }
            else
              this.setState(FSM.FSM_DONE);
          }
          break;
      }
    }
  }
}

export class FsmUnlink extends FSM.Fsm
{
  path: string;

  constructor(env: Environment, path: string)
    {
      super(env);

      this.path = path;
    }

  get env(): Environment { return this._env as Environment; }

  cleanupPath(): void
    {
      // path of form 'uploads/uuid/file/filename' - rm everything after uploads
      // FYI: If we allow multiple files per upload/import, this function would need to be
      // enhanced/extended.
      let dirs: string[] = this.path.split('/');
      if (dirs.length != 4)
      {
        this.env.log.error('cleanupUpload: unexpected argument');
        return;
      }
      let dir1: string = dirs[0] + '/' + dirs[1];
      let dir2: string = dir1 + '/' + dirs[2];
      fs.unlink(this.path, (e1: any) => {
          if (e1)
          {
            this.env.log.error('cleanupUpload: unlink failed');
            this.setState(FSM.FSM_DONE);
          }
          else
            fs.rmdir(dir2, (e2: any) => {
              if (e2)
              {
                this.env.log.error('cleanupUpload: rmdir failed');
                this.setState(FSM.FSM_DONE);
              }
              else
                fs.rmdir(dir1, (e3: any) => {
                  if (e3)
                    this.env.log.error('cleanupUpload: rmdir2 failed');
                  this.setState(FSM.FSM_DONE);
                  });

              });
        });
    }

  tick(): void
    {
      if (this.ready && this.state == FSM.FSM_STARTING)
        this.cleanupPath();
    }

}

export class FsmReadFile extends FSM.Fsm
{
  path: string;
  result: string;
  unlinkAfterRead: boolean;

  constructor(env: Environment, path: string, unlinkAfterRead: boolean = true)
    {
      super(env);

      this.path = path;
      this.result = null;
      this.unlinkAfterRead = unlinkAfterRead;
    }

  get env(): Environment { return this._env as Environment; }

  tick(): void
    {
      if (this.ready)
      {
        switch (this.state)
        {
          case FSM.FSM_STARTING:
            this.setState(FSM_READING);
            fs.readFile(this.path, 'utf8', (err: any, data: string) => {
                if (err)
                  this.setState(FSM.FSM_ERROR);
                else
                {
                  this.result = data;
                  if (this.unlinkAfterRead)
                    this.waitOn(new FsmUnlink(this.env, this.path));
                  this.setState(FSM_UNLINKING);
                }
              });
            break;

          case FSM_UNLINKING:
            // Note we silently ate any unlink error
            this.setState(FSM.FSM_DONE);
            break;
        }
      }
    }
}

export class FsmAPIPresign extends FsmAPI
{
  fsmTransferUrl: Storage.FsmTransferUrl;

  constructor(env: Environment, req: any, res: any)
  {
    super(env, 'presign', req, res);
  }

  tick(): void
  {
    if (this.ready && this.isDependentError)
    {
      this.setState(FSM.FSM_ERROR);
      this.respond(OT.EFail);
    }
    else if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.fsmTransferUrl = this.env.transferManager.createPutUrl(this.req.body.contentType);
          this.waitOn(this.fsmTransferUrl);
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          this.responseBody.presign = { url: this.fsmTransferUrl.url, key: this.fsmTransferUrl.key };
          this.respond();
          break;
      }
    }
  }
}

export class FsmUpdate extends FSM.Fsm
{
  update: any;
  sp: any;
  set: any;
  bUnset: boolean;

  constructor(env: Environment, sp: any, set: any, bUnset: boolean = false)
    {
      super(env);
      this.sp = sp;
      this.set = set;
      this.bUnset = bUnset;

      if (Util.isEmpty(set))
        this.setState(FSM.FSM_DONE);
      else
      {
        // So in-memory copy has updated values
        if (this.bUnset)
          Util.shallowDelete(this.sp, this.set);
        else
          Util.shallowAssign(this.sp, this.set);
        this.sp._atomicUpdate = (this.sp._atomicUpdate || 0) + 1;
      }
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

            // client can safely ignore return value if they want to fire and forget
            if (this.bUnset)
              this.update = this.env.db.createUnset(this.env.sessionManager.col,
                              { id: this.sp.id, createdBy: this.sp.createdBy },
                              this.set);
            else
            {
              this.update = this.env.db.createUpdate(this.env.sessionManager.col,
                              { id: this.sp.id, createdBy: this.sp.createdBy },
                              this.set);
            }
            this.waitOn(this.env.sessionManager.updateTracker.track(this.sp.id, this.update));
            this.setState(FSM.FSM_PENDING);
            break;

          case FSM.FSM_PENDING:
            let r = this.update.result;
            if (r)
            {
              this.update.result = this.env.sessionManager.mru.refresh(r.id, r);
              this.env.sessionManager.flushRemoteMRU(r.id);
            }
            this.setState(FSM.FSM_DONE);
            break;
        }
      }
    }
}

// How frequently to check split cache (in minutes)

export class SessionManager
{
  env: Environment;
  col: DB.DBCollection;
  bMaintenance: boolean;
  requestsTotal: number;
  requestsOutstanding: number;
  findSerializer: FSM.FsmSerializer;
  updateTracker: FSM.FsmTracker;
  mru: MRU.ExpiringMRU;
  config: any;
  isDraining: boolean;

  // Constructor
  constructor(env: Environment)
    {
      this.env = env;
      forceErrorFrequency = env.context.xnumber('force_error_frequency');
      this.bMaintenance = false;
      this.requestsTotal = 0;
      this.requestsOutstanding = 0;
      this.col = env.db.createCollection('state', Schemas['state']);
      this.findSerializer = new FSM.FsmSerializer(env);
      this.updateTracker = new FSM.FsmTracker(env);
      this.mru = new MRU.ExpiringMRU();
      this.loadConfig();
    }

  loadConfig(): void
  {
    try
    {
      this.config = JSON.parse(fs.readFileSync('config/server.config.json', 'utf8'));
      if (! this.config)
        this.config = { version: 1 };
    }
    catch (err)
    {
      this.config = { version: 1 };
    }
  }

  createStream(): FSM.FsmArray { return this.env.db.createStream(this.col) }
  closeStream(stream: FSM.FsmArray) { /* this.env.db.closeStream(this.col) */ }

  update(sp: OT.SessionProps, o: any): FSM.Fsm
    {
      if (Util.isEmpty(o)) return null;

      return new FsmUpdate(this.env, sp, o);
    }

  unset(sp: OT.SessionProps, o: any): FSM.Fsm
    {
      if (Util.isEmpty(o)) return null;

      return new FsmUpdate(this.env, sp, o, true);
    }

  flushmru(sid: string): void
  {
    this.mru.remove(sid);
    this.mru.unblock(sid);
  }

  flushRemoteMRU(sid: string): void
  {
    //this.env.queueManager.sendAdmin({ nobounceback: true, command: 'flushmru', mru: 'session', id: sid });
  }
}
