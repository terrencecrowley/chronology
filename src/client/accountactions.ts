// Public libraries
import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";

// OT
import { OT, Util, FSM } from "@dra2020/baseclient";

// App
import { Environment, Fsm } from "./env";
import * as ClientActions from "./clientactions";
import * as Ajax from "./ajax";
import * as MA from "./components/materialapp";

class FsmAccountAPI extends Ajax.FsmAjax
{
  constructor(env: Environment, url: string, data: any)
  {
    super(env, { url: url, data: JSON.stringify(data) });
  }
}

class FsmLogin extends Fsm
{
  actions: AccountActions;
  fsmLoginAPI: FsmAccountAPI;

  constructor(env: Environment, actions: AccountActions, data: any)
  {
    super(env);
    this.actions = actions;
    this.fsmLoginAPI = new FsmAccountAPI(env, '/login', data);
    this.waitOn(this.fsmLoginAPI);
  }

  tick(): void
  {
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready)
    {
      let data = this.fsmLoginAPI.data;
      if (data)
      {
        if (data.result)
          this.actions.message = data.message;
        else
          this.actions.setUser(data.user);
      }
      this.setState(FSM.FSM_DONE);
    }
  }
}

export class AccountActions extends ClientActions.ClientActions
{
  user: any;
  message: string;
  requests: { [action: string]: Fsm };

  constructor(env: Environment)
  {
    super(env);
    this.user = {};
    this.message = '';
  }

  setUser(u: any): void
  {
    this.user = u;
  }

  fire(id: number, arg?: any): boolean
  {
    switch (id)
    {
      case ClientActions.Logout:
        window.location.replace('/logout');
        this.user = {};
        break;

      case ClientActions.Login:
        this.requests['login'] = new FsmLogin(this.env, this, { username: arg.email, password: arg.password });
        break;

      case ClientActions.Signup:
        this.requests['login'] = new FsmLogin(this.env, this, { signup: true, username: arg.email, password: arg.password });
        break;

      case ClientActions.ForgotPassword:
        this.requests['forgot'] = new FsmAccountAPI(this.env, '/forgotpassword/fetch', arg);
        break;

      case ClientActions.ResetPassword:
        this.requests['reset'] = new FsmAccountAPI(this.env, '/forgotpassword/set', arg);
        break;

      default:
        return this._fire(id, arg);
    }

    return true;
  }
}
