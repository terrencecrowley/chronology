// Node libraries
import * as fs from 'fs';
import * as url from 'url';

// Shared libraries
import { Util, FSM } from '@dra2020/baseclient';
import { Storage, DB } from '@dra2020/baseserver';

// App libraries
import * as UM from './users';
import * as SM from './sessionmanager';
import * as Store from './storemanager';
import { Environment } from './env';

export class APIManager
{
  env: Environment;

  private bTimerSet: boolean;
  private nBackupHour: number;
  private nBackupDay: number;
  private nHouseKeeping: number;

  nAPI: number;

  // constructor
  constructor()
    {
      this.bTimerSet = false;
      this.nHouseKeeping = 0;
      this.setHousekeepingTimer();

      this.env = Env.create();
      this.nAPI = 0;
    }

  countAPI(api: string, fsm: FSM.Fsm): void
    {
      this.nAPI++;
    }

  userView(req: any, res: any): void
    {
      this.countAPI('userview', new SM.FsmAPIUserView(this.env, req, res));
    }

  updateProfile(req: any, res: any): void
    {
      this.countAPI('updateprofile', new SM.FsmAPIProfile(this.env, req, res));
    }
  
  resetPassword(req: any, res: any, email: string): void
    {
      this.countAPI('resetpassword', new SM.FsmAPIResetPassword(this.env, req, res, email));
    }

  resetPasswordByGUID(req: any, res: any, password: string, resetGUID: string): void
    {
      this.countAPI('resetpasswordbyguid', new SM.FsmAPIResetPasswordByGUID(this.env, req, res, password, resetGUID));
    }

  presign(req: any, res: any): void
    {
      this.countAPI('presign', new SM.FsmAPIPresign(this.env, req, res));
    }

  verifyEmail(req: any,  res: any, verifyGUID: string): void
    {
      this.countAPI('verifyemail', new SM.FsmAPIVerifyEmail(this.env, req, res, verifyGUID));
    }

  admin(req: any, res: any): void
    {
      this.countAPI('admin', new SM.FsmAPIAdmin(this.env, req, res));
    }

  recordMemoryUse()
    {
      // Record high water memory usage
      let mem: any = process.memoryUsage();
      if (mem && mem.rss)
      {
        if (mem.rss)
          this.env.log.value({ event: 'memory usage: rss', value: mem.rss });
        if (mem.heapTotal)
          this.env.log.value({ event: 'memory usage: heapTotal', value: mem.heapTotal });
        if (mem.heapUsed)
          this.env.log.value({ event: 'memory usage: heapUsed', value: mem.heapUsed });
        if (mem.external)
          this.env.log.value({ event: 'memory usage: external', value: mem.external });
      }
    }

  // housekeeping Timer
  housekeepingOnTimer(): void
    {
      this.nHouseKeeping++;

      this.bTimerSet = false;

      this.recordMemoryUse();

      // Do it again
      this.setHousekeepingTimer();
    }

  // Set timer for housekeeping
  setHousekeepingTimer(): void
    {
      if (!this.bTimerSet)
      {
        this.bTimerSet = true;
        setTimeout(() => { this.housekeepingOnTimer(); }, 3600000);
      }
    }
}
