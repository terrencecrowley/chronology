// Shared Libraries
import { Util, FSM, } from "@dra2020/baseclient";

// App
import { Environment, Fsm } from "./env";

export interface ReadFileOptions
{
  binary?: boolean,
}

const DefaultReadFileOptions: ReadFileOptions = { };

export class FsmReadFile extends Fsm
{
  file: any;
  fileReader: FileReader;
  options: ReadFileOptions;
  name: string;
  _json: any;
  _s: string;

  constructor(env: Environment, file: any, options?: ReadFileOptions)
  {
    super(env);
    this.file = file;
    this.name = file.name;
    this.options = Util.shallowAssignImmutable(DefaultReadFileOptions, options);
    this.fileReader = new FileReader();
    this.fileReader.onload = () => { this.setState(FSM.FSM_DONE); }
    this.fileReader.onerror =() => { this.setState(FSM.FSM_ERROR); }
  }

  get result(): string { return this.done ? this.fileReader.result as string : undefined }
  get buffer(): ArrayBuffer { return this.done ? this.fileReader.result as ArrayBuffer : undefined }

  get json(): any
  {
    if (! this._s)
    {
      this._s = this.result;
      if (this._s)
      {
        try
        {
          this._json = JSON.parse(this._s);
        }
        catch (err)
        {
          this._json = null;
        }
      }
    }
    return this._json;
  }

  tick(): void
  {
    if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          if (this.options.binary)
            this.fileReader.readAsArrayBuffer(this.file);
          else
            this.fileReader.readAsText(this.file);
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          // no-op - completion happens in event handlers
          break;
      }
    }
  }
}

export type JSONRow = { name: string, s: string, json: any };
export type JSONRows = JSONRow[];

export class FsmReadJSONFiles extends Fsm
{
  files: any[];
  rows: JSONRows;
  fsmReadFiles: FsmReadFile[];

  constructor(env: Environment, files: any[])
  {
    super(env);
    this.files = files;
    this.rows = [];
  }

  tick(): void
  {
    if (this.ready)
    {
      switch (this.state)
      {
        case FSM.FSM_STARTING:
          this.fsmReadFiles = [];
          if (this.files) for (let i = 0; i < this.files.length; i++)
            this.fsmReadFiles.push(new FsmReadFile(this.env, this.files[i]));
          this.waitOn(this.fsmReadFiles);
          this.setState(FSM.FSM_PENDING);
          break;

        case FSM.FSM_PENDING:
          this.rows = this.fsmReadFiles.map((f: FsmReadFile) => { return ({ name: f.name, s: f.result, json: f.json }) });
          this.setState(FSM.FSM_DONE);
          break;
      }
    }
  }
}
