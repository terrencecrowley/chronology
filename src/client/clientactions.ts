// Shared libraries
import { FSM } from "@dra2020/baseclient";


// Local libraries
import { Environment } from "./env";
import * as TV from "./components/tableview";

let ActionID = -1;
export const NoOp = ActionID++;
export const Home = ActionID++;
export const Render = ActionID++;
export const Undo = ActionID++;
export const Redo = ActionID++;
export const Hash = ActionID++; // arg is ParamHash
export const Logout = ActionID++;
export const Profile = ActionID++;
export const ResetPassword = ActionID++;
export const VerifyEmail = ActionID++;
export const SelectionEmpty = ActionID++;
export const SelectionSet = ActionID++; // arg is sid
export const SelectionDouble = ActionID++; // arg is sid
export const SelectionClear = ActionID++; // arg is sid
export const SelectionSetAll = ActionID++;
export const SelectionMeta = ActionID++;
export const TableIconSelect = ActionID++;
export const TableCheckSelect = ActionID++;
export const TableButtonSelect = ActionID++;
export const TableSort = ActionID++;
export const SetColumn = ActionID++;

// Dialogs
export const Open = ActionID++;
export const Close = ActionID++;
export const Apply = ActionID++;
export const TextChange = ActionID++;

export const SetErrorMessage = ActionID++;  // arg is error string

// User login related
export const Login: number = ActionID++;
export const Signup: number = ActionID++;
export const ForgotPassword: number = ActionID++;
export const OpenForgotPassword: number = ActionID++;
export const CloseForgotPassword: number = ActionID++;
export const OpenLogin: number = ActionID++;
export const CloseLogin: number = ActionID++;
export const OpenAlert: number = ActionID++;  // arg is ParamAlert
export const CloseAlert: number = ActionID++;
export const OpenProgress: number = ActionID++;  // arg is ParamProgress
export const CloseProgress: number = ActionID++;
export const CloseResetPassword: number = ActionID++;
export const OpenSignup: number = ActionID++;
export const CloseSignup: number = ActionID++;
export const OpenReset: number = ActionID++;
export const DoneLogin: number = ActionID++;
export const DoneResetForgot: number = ActionID++;

export const SetViewMode: number = ActionID++;

export type ViewerProps = { [dialog: string]: any };
export type ViewerState = { [dialog: string]: any };

// Custom Analyze Actions
export const SetRowToAnalyze: number = ActionID++;

export interface ParamOpen
{
  name: string,
  params?: any,
}

export interface TextBlock
{
  variant: string;  // title, subheading, body1, body2, row, link, indentBody, beginTable/EndTable, beginExpansion/endExpansion
  text?: string;
  cells?: string[];
  link?: string;    // url: only when variant = 'link'
  label?: string;   // url label: only when variant = 'link'
}

export interface TextContainer
{
  data: TextBlock[];
}

export interface ParamProfile
{
  textFields: TextFields;
}

export type CloseFunction = (ok: boolean) => void;
export interface ParamAlert
{
  title?: string;
  message?: string;
  ok?: string;                    // Text for OK button
  cancel?: string;                // Text for cancel button
  onClose?: CloseFunction;        // Function to close (triggered by OK, ESC, click anywhere)
  anchorOrigin?: {vertical: number | 'top' | 'center' | 'bottom', horizontal: number | 'left' | 'center' | 'right'};
}

export interface ParamPick
{
  alertParam: ParamAlert,
  multiple?: boolean,
  target?: string,
}

export interface ParamProgress
{
  title?: string;
  message?: string;
  onClose?: CloseFunction;        // Function to close (triggered by OK, ESC, click anywhere)
  value?: number;                 // If present, determinant progress indicator 0-100, otherwise indeterminant
}

export interface ParamTableSort
{
  ordering: TV.Ordering,
  orderBy: string,
}

export interface ParamTableIcon
{
  id: string,
  name: string,
  selected: boolean,
}

export interface ParamDownloadData
{
  filename: string,
  contents: string,
}

export class ActionTracker
{
  _pending: { [key: string]: { data: any, fsm: FSM.Fsm } };

  constructor()
  {
    this._pending = {};
  }

  start(key: string, data: any = true, fsm: FSM.Fsm = null): void
  {
    this._pending[key] = { data: data, fsm: fsm };
  }

  end(key: string): void
  {
    if (this._pending[key] && this._pending[key].fsm)
      this._pending[key].fsm.setState(FSM.FSM_DONE);
    delete this._pending[key];
  }

  pending(key: string): any
  {
    return this._pending[key];
  }

  ispending(key: string): boolean
  {
    return this._pending[key] !== undefined;
  }
}

export interface IClientActions
{
  env: Environment;

  fire: (a: number, arg?: any) => boolean
}

interface Mixin
{
  next: Mixin;
  actions: ClientActions;
}

export class ClientActions implements IClientActions
{
  env: Environment;
  mixins: Mixin;          // Mixins allow independent implementations of separate functionality
  parent: ClientActions;  // Parent allows a mixin to refire and access parent functionality
  tracker: ActionTracker;

  constructor(env: Environment)
  {
    this.env = env;
    this.mixins = null;
    this.parent = null;
    this.tracker = new ActionTracker();
  }

  mixin(actions: ClientActions): void
  {
    if (actions)
    {
      this.mixins = { next: this.mixins, actions: actions };
      actions.parent = this;
    }
  }

  unmix(actions: ClientActions): void
  {
    if (this.mixins && this.mixins.actions === actions)
      this.mixins = this.mixins.next;
    else
      for (let m = this.mixins; m != null && m.next != null; m = m.next)
        if (m.next.actions === actions)
        {
          m.next = m.next.next;
          break;
        }
  }

  _fire(a: number, arg?: any): boolean
  {
    // Try mixins
    for (let mixin = this.mixins; mixin; mixin = mixin.next)
      if (mixin.actions.fire(a, arg))
        return true;

    // No handler
    return false;
  }

  fire(a: number, arg?: any): boolean
  {
    return false;
  }

  upfire(a: number, arg?: any): boolean
  {
    return this.top.fire(a, arg);
  }

  get top(): ClientActions
  {
    let actions: ClientActions = this;

    while (actions.parent)
      actions = actions.parent;

    return actions;
  }

  start(key: string, data: any = null): void
  {
    this.top.tracker.start(key, data);
  }

  end(key: string): void
  {
    this.top.tracker.end(key);
  }

  pending(key: string): any
  {
    return this.top.tracker.pending(key);
  }

  ispending(key: string): any
  {
    return this.top.tracker.ispending(key);
  }
}
