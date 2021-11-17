// Shared Libraries
import { Util, Context, FSM, LogAbstract, LogClient } from '@dra2020/baseclient';
import { Storage, S3, DB, DBDynamo, Lambda } from '@dra2020/baseserver';

// Local libraries
import * as APIManager from './serversession';
import * as UM from './users';
import * as SM from './sessionmanager';
import * as TM from './transfermanager';
import * as Store from './storemanager';

export interface Environment
{
  context: Context.IContext;
  log: LogAbstract.ILog;
  fsmManager: FSM.FsmManager;
  storageManager: Storage.StorageManager;
  db: DB.DBClient;
  col: (name: string) => DB.DBCollection,
  userManager: UM.UserManager;
  storeManager: Store.StoreManager;
  sessionManager: SM.SessionManager;
  transferManager: TM.TransferManager;
}

const Defaults: Context.ContextValues =
{
  aws_access_key_id: undefined,
  aws_secret_access_key: undefined,
  production: undefined,
  verbosity: 0,
  debug_save_delay: 0,
  max_edit_log_size: 50,
  client_max_count: 50,
  port: 3000,
  dra_debug: undefined,
  telemetry_interval: 1000 * 60 * 60 * 8,
  backup_state_interval: 1000 * 60 * 60,
  email_verify_server: 'http://localhost:3000',
  force_error_frequency: 0.001,
  expunge_delay: 1000 * 60 * 60 * 24 * 28,
  special_admin: undefined,
  disable_stream_parsing: 1,
}

export class Fsm extends FSM.Fsm
{
  constructor(env: Environment)
  {
    super(env);
  }

  get env(): Environment { return this._env as Environment }
}

class FsmCheckDBStart extends Fsm
{
  constructor(env: Environment)
  {
    super(env);
    this.waitOn(env.db);
  }

  tick(): void
  {
    if (this.ready)
    {
      if (this.isDependentError)
      {
        console.log('DB failed to open. Exiting.');
        process.exit(1);
      }
      this.setState(FSM.FSM_DONE);
    }
  }
}

export let BucketMap: any = {
  'default': 'template-bucket',
  'development': 'template-bucket',
  'production': 'template-bucket',
  'transfers': 'template-bucket',
};

export let Schemas: any = {
  'users':
    {
      FileOptions: { version: 5, name: 'users', map: false },
      Schema: {
        id: 'S',
        name: 'S',
        email: 'S',
        hashPW: 'S',
        verified: 'BOOL',
        admin: 'BOOL',
        roles: 'M',
        verifyGUID: 'S',
        resetGUID: 'S',
        resetTime: 'S',
        lastActive: 'S',
        modifyTime: 'S',
        resetCount: 'N',
        accessed: 'M',
        likeID: 'S',
        visitData: 'M',
        groups: 'M',
      },
      KeySchema: { id: 'HASH' },
      GlobalSecondaryIndexes: [
          { email: 'HASH' },
          { verifyGUID: 'HASH' },
          { resetGUID: 'HASH' },
        ],
    },
  'session':
    {
      FileOptions: { map: true },
      Schema: {
        id: 'S',
        lastActive: 'S',
        value: 'S',
      },
      KeySchema: { id: 'HASH' }
    },
};

export function create(): Environment
{
  let env: Environment = 
    {
      context: null,
      log: null,
      fsmManager: null,
      storageManager: null,
      db: null,
      col: null,
      userManager: null,
      storeManager: null,
      sessionManager: null,
      transferManager: null,
    };

  // Setup context
  env.context = Context.create();
  env.context.setDefaults(Defaults);

  // Singular FSM Manager
  env.fsmManager = new FSM.FsmManager();

  // Log handler
  env.log = LogClient.create(env);
  env.log.stamp({ kind: 'misc', _build: process.env.npm_package_version });

  // Announce mode
  if (env.context.xflag('production'))
    console.log('Mode: PRODUCTION: running against production DynamoDB databases and S3 buckets');
  else
    console.log('Mode: DEVELOPMENT: running against development DynamoDB databases and S3 buckets');

  // Storage Manager
  if (env.context.xflag('production'))
    BucketMap.default = 'production';
  else
    BucketMap.default = 'development';
  env.storageManager = new S3.StorageManager(env, BucketMap);

  // Database
  env.db = DBDynamo.create(env);

  // DB Collections
  let cols: { [name: string]: DB.DBCollection } = {};
  env.col = (name: string) => {
      if (cols[name] === undefined)
        cols[name] = env.db.createCollection(name, Schemas[name]);
      return cols[name];
    };

  // Http session store
  env.storeManager = new Store.StoreManager(env);

  // User manager
  env.userManager = new UM.UserManager(env);

  // Session props manager
  env.sessionManager = new SM.SessionManager(env);

  // Session props manager
  env.transferManager = new TM.TransferManager(env);

  // Validate startup
  new FsmCheckDBStart(env);

  return env;
}
