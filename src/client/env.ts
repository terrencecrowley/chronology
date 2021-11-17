import { Util, FSM, LogAbstract } from "@dra2020/baseclient";
import { ClientActions } from './clientactions';

export class NullLogger implements LogAbstract.ILog
{
  constructor() {}
  dump(): FSM.Fsm { return null; }
  stamp(o: any): void {}
  log(o: any, verbosity?: number): void {}
  event(o: any, verbosity?: number): void {}
  value(o: any, verbosity?: number): void {}
  error(o: any): void {}
  chatter(s: string): void { console.log(s) }
  chatters(): string[] { return null; }
}

export class BrowserContext
{
  ilog: LogAbstract.ILog;

  constructor()
  {
    this.ilog = new NullLogger();
  }

  get logInterface(): LogAbstract.ILog { return this.ilog; }

  flagIsSet(flag: string): boolean
  {
    return false;
  }

  flagValue(flag: string): number
  {
    return 0;
  }

  log(verbose: number, s: string): void
  {
    // logMessage(s);
  }
}

export interface Account
{
  user: any,
}

export interface Environment
{
  fsmManager: FSM.FsmManager,
  log: LogAbstract.ILog,
  actions?: ClientActions,
  account?: Account,
}

export function create(): Environment
{
  return { fsmManager: new FSM.FsmManager(), log: new NullLogger() };
}

export class Fsm extends FSM.Fsm
{
  constructor(env: Environment)
  {
    super(env);
  }

  get env(): Environment { return this._env as Environment }
}
