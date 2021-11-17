// Public libraries
import * as $ from "jquery";

// Libraries
import { Util, FSM } from "@dra2020/baseclient";

// App
import { Environment } from "./env";

export interface FsmAjaxArgs
{
  method?: string,
  url?: string,
  data?: any,
  contentType?: any,
  dataType?: string,
  processData?: boolean,
  headers?: any,
  enctype?: string,
  crossDomain?: any,
}

const DefaultAjaxArgs: FsmAjaxArgs =
{
  method: 'POST',
  contentType: 'application/json; charset=UTF-8',
  processData: false,
  dataType: 'json',
  headers: null,
};

export class FsmAjax extends FSM.Fsm
{
  // input
  args: FsmAjaxArgs;

  // these fields available on completion or can override ondone, onfail, oncomplete
  data: any;
  statusMessage: string;
  errorMessage: string;
  errorThrown: string;
  jqXHR: any;

  constructor(env: Environment, args: FsmAjaxArgs)
  {
    super(env);
    this.args = Util.shallowAssignImmutable(DefaultAjaxArgs, args);
    if (this.args.data != null && typeof this.args.data !== 'string' && this.args.dataType !== 'binary'
        && !this.args.enctype)
      this.args.data = JSON.stringify(this.args.data);
  }

  get env(): Environment { return this._env as Environment; }

  send(): void
  {
    let params: any =
      {
        method: this.args.method,
        data: this.args.data,
        processData: this.args.processData,
        dataType: this.args.method !== 'PUT' ? this.args.dataType : 'text',
      };

    if (this.args.contentType != null) params.contentType = this.args.contentType;
    if (this.args.headers != null) params.headers = this.args.headers;
    if (this.args.dataType === 'binary' && this.args.method === 'GET')
      params.xhrFields = { responseType: 'arraybuffer' };

    this.jqXHR = $.ajax(this.args.url, params)
      .done((data: any, statusMessage: string, jqXHR: any) => this.ondone(data, statusMessage, jqXHR))
      .fail((jqXHR: any, errorMessage: string, errorThrown: string) => this.onfail(jqXHR, errorMessage, errorThrown))
      .always(() => this.oncomplete());
  }

  get resultCode(): number { return this.data ? this.data.result : undefined; }
  get statusCode(): number { return this.jqXHR ? Number(this.jqXHR.status) : 0; }

  cancel(): void
  {
    if (! this.done)
    {
      if (this.jqXHR) this.jqXHR.abort();
      this.setState(FSM.FSM_ERROR);
    }
  }

  // Canonical tick() function - can be overridden, just remember to start by calling send()
  tick(): void
  {
    if (this.ready && this.isDependentError)
      this.setState(FSM.FSM_ERROR);
    else if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.send();
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          // no-op - completion happens in ajax callbacks
          break;
      }
    }
  }

  // override or just access output fields on completion
  ondone(data: any, statusMessage: string, jqXHR: any): void
  {
    this.data = data;
    this.statusMessage = statusMessage;
    this.jqXHR = jqXHR;
  }

  // override if necessary
  onfail(jqXHR: any, errorMessage: string, errorThrown: string): void
  {
    this.jqXHR = jqXHR;
    this.errorMessage = errorMessage;
    this.errorThrown = errorThrown;

    if (! this.done) this.setState(FSM.FSM_ERROR);
  }

  // override if necessary
  oncomplete(): void
  {
    if (! this.done)
      this.setState(FSM.FSM_DONE);
  }
}

export interface PresignParams
{
  contentType?: string;
}

export class FsmPresignUrl extends FsmAjax
{
  constructor(env: Environment, params?: PresignParams)
  {
    let args: FsmAjaxArgs = { url: '/api/sessions/presign' };
    args.data = { contentType: params && params.contentType ? params.contentType : 'text/plain; charset=UTF-8' };

    super(env, args);
  }

  get url(): any { return this.resultCode !== 0 ? null : this.data.presign.url; }
  get key(): string { return this.resultCode !== 0 ? null : this.data.presign.key; }
}

export class FsmPutText extends FsmAjax
{
  constructor(env: Environment, url: any, data: string)
  {
    super(env, { url: url, method: 'PUT', data: data, contentType: 'text/plain; charset=UTF-8', dataType: 'text' });
  }
}

export class FsmPutBinary extends FsmAjax
{
  constructor(env: Environment, url: any, data: ArrayBuffer)
  {
    super(env, { url: url, method: 'PUT', data: data, contentType: 'application/octet-stream', dataType: 'binary' });
  }
}

export class FsmGetText extends FsmAjax
{
  constructor(env: Environment, url: any)
  {
    super(env, { url: url, method: 'GET', data: '', contentType: null, dataType: 'text' });
  }
}

export class FsmGetJSON extends FsmAjax
{
  constructor(env: Environment, url: any)
  {
    super(env, { url: url, method: 'GET', data: '{}', contentType: 'application/json; charset=UTF-8', dataType: 'json' });
  }
}
