// Public libraries
import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as FS from "file-saver";

// Shared libraries
import { Util, FSM, Poly, G, OT, FilterExpr, LogAbstract } from "@dra2020/baseclient";

// App
import { Environment, create } from './env';
import * as ClientActions from "./clientactions";
import * as AA from "./accountactions";
import * as MA from "./components/materialapp";
import * as TV from './components/tableview';
import * as Hash from './hash';
import * as Ajax from "./ajax";

let coder: Util.Coder = { encoder: new TextEncoder(), decoder: new TextDecoder('utf-8') };

class Actions extends ClientActions.ClientActions
{
  app: App;

  constructor(app: App)
  {
    super(app.env);
    this.app = app;
    let account = new AA.AccountActions(app.env);
    app.env.account = account;

    this.mixin(new AA.AccountActions(app.env));
  }

  fire(id: number, arg?: any): boolean
  {
    let handled: boolean = true;

    switch (id)
    {
      default:
        handled = false;
        break;

      case ClientActions.Render:
        this.app.forceRender();
        break;

      case ClientActions.SetErrorMessage:
        this.app.actionSetErrorMessage(arg as string);
        break;

      case ClientActions.CloseResetPassword:
        this.app.actionCloseResetPassword();
        break;

      case ClientActions.OpenForgotPassword:
        this.app.actionOpenForgotPassword();
        break;

      case ClientActions.CloseForgotPassword:
        this.app.actionCloseForgotPassword();
        break;

      case ClientActions.Profile:
        this.app.actionProfile(arg);
        break;

      case ClientActions.VerifyEmail:
        this.app.actionVerifyEmail();
        break;

      case ClientActions.OpenAlert:
        this.app.actionOpenAlert(arg as ClientActions.ParamAlert);
        break;

      case ClientActions.CloseAlert:
        this.app.actionCloseAlert();
        break;

      case ClientActions.OpenProgress:
        this.app.actionOpenProgress(arg as ClientActions.ParamProgress);
        break;

      case ClientActions.CloseProgress:
        this.app.actionCloseProgress();
        break;

      case ClientActions.DoneResetForgot:
        this.app.actionDoneResetForgot(arg as ClientActions.ParamAlert);
        break;
      
      case ClientActions.ResetPassword:
        let profileState: ClientActions.ParamProfile = arg as ClientActions.ParamProfile;
        profileState.resetGUID = this.app.resetGUID;
        handled = false;
        break;
    }

    return handled ? true : this._fire(id, arg);
  }
}

class App
{
  env: Environment;
  props: MA.AppProps;

  // For rendering
  bRender: boolean;

  // Actions
  actions: Actions;

  // Reset
  resetGUID: string;

  // constructor
  constructor()
  {
    this.env = create();

    this.render = this.render.bind(this);
    this.forceRender = this.forceRender.bind(this);
    this.bRender = false;

    // Bind so I can use as generic callbacks
    this.actions = new Actions(this);
    this.env.actions = this.actions;

    // Keyboard events
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.resetGUID = '';
    
    // Initialize props
    this.props = {
      env: this.env,
      title: 'DRA 2020',
      roles: {},
      actions: this.actions,
      isAnon: false,

      alertParam: { title: '', message: '' },
      progressParam: { title: '', message: '' },

      // General
      openAlert: false,
      openProgress: false,
      openReset: false,
      openForgot: false,
    };

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize(e: any): void
  {
    this.updateDesignSize();
  }

  handleKeyPress(e: any): boolean
  {
    let accelerators = [
      { key: 'z', action: ClientActions.Undo },
      { key: 'y', action: ClientActions.Redo },
    ];

    const { actions } = this.props;

    let key = e.key;
    for (let i: number = 0; i < accelerators.length; i++)
    {
      if (key == accelerators[i].key)
      {
        actions.fire(accelerators[i].action);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    return true;
  }

  render(): void
  {
    // Make sure design size is correct
    this.updateDesignSize();

    //this.updateDerivedProps();
    ReactDOM.render(<MA.MaterialApp {...this.props} />, document.getElementById('root'));
    this.bRender = false;
  }

  forceRender(): void
  {
    if (!this.bRender)
    {
      this.bRender = true;
      setTimeout(theApp.render, 1);
    }
  }

  reTick(): void
  {
  }

  initialize(): void
  {
    window.addEventListener('hashchange', (ev: HashChangeEvent) => {
      const { location } = window;
  
      //console.log('Hash change:' + location.hash);
      this.handleHashChange(location);
    });
    this.reTick();
  }

  handleHashChange(location: Location): void
  {
    this.handleHashChangePart(location.hash);
  }

  handleHashChangePart(hashpart: string)
  {
  }

  clearOpenDialogs(): void
  {
    this.props.openAlert = false;
    this.props.openProgress = false;
    //this.props.openReset = false;
    this.props.openForgot = false;
  }

  updateDesignSize(): void
  {
    /*
    let el: any = document.getElementById('root');
    let w: number = el.clientWidth;
    let h: number = el.clientHeight;

    let designSize: MA.DW;
    if (w < 376)       designSize = MA.DW.PHONE;
    else if (w < 475)  designSize = MA.DW.PHONEPLUS;
    else if (w < 575)  designSize = MA.DW.NARROW;
    else if (w < 645)  designSize = MA.DW.NARROWPLUS;
    else if (w < 725)  designSize = MA.DW.NARROWPLUS2;
    else if (w < 770)  designSize = MA.DW.TABLET;
    else if (w < 870)  designSize = MA.DW.MEDIUM;
    else if (w < 930)  designSize = MA.DW.MEDIUMPLUS;
    else if (w < 1155) designSize = MA.DW.WIDE;
    else if (w < 1250) designSize = MA.DW.WIDER;
    else               designSize = MA.DW.WIDEST;

    if (designSize !== this.props.designSize)
    {
      this.props.designSize = designSize;
      this.forceRender();
    }
    */
  }

  actionSetErrorMessage(err: string): void
  {
    this.props.openAlert = true;
    this.props.alertParam = {title: 'Error', message: err};
    this.forceRender();
  }

  actionProfile(arg: any): void
  {
    // { name?: string, email?: string, password?: string, verify?: any, feedback?: string, twitterhandle?: string }
    //this.env.clientSession.updateProfile(arg);
  }

  actionVerifyEmail(): void
  {
    //this.env.clientSession.user.verified = 2; // pending
    //this.env.clientSession.updateProfile({ verify: '' });
    this.forceRender();
  }

  actionDownloadData(param: ClientActions.ParamDownloadData): void
  {
    // adapted from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(param.contents));
    element.setAttribute('download', param.filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  actionOpenAlert(param: ClientActions.ParamAlert): void
  {
    this.props.openAlert = true;
    this.props.alertParam = param;
    this.forceRender();
  }

  actionDoneResetForgot(param: ClientActions.ParamAlert): void
  {
    this.props.openReset = false;
    this.props.openForgot = false;
    this.props.openAlert = true;
    this.props.alertParam = param;
    this.forceRender();
  }

  actionCloseAlert(): void
  {
    this.props.openAlert = false;
    this.props.alertParam = { title: '', message: '' };
    this.forceRender();
  }

  actionOpenProgress(param: ClientActions.ParamProgress): void
  {
    this.props.openProgress = true;
    this.props.progressParam = param;
    this.forceRender();
  }

  actionCloseProgress(): void
  {
    this.props.openProgress = false;
    this.props.progressParam = { title: '', message: '' };
    this.forceRender();
  }

  actionOpenForgotPassword(): void
  {
    this.props.openForgot = true;
    this.forceRender();
  }

  actionCloseForgotPassword(): void
  {
    this.props.openForgot = false;
    this.forceRender();
  }

  actionCloseResetPassword(): void
  {
    this.props.openReset = false;
    this.forceRender();
  }

  tick(): void
  {
    this.reTick();
  }
}

let theApp: App = null;


function StartupApp()
{
  theApp = new App();
  theApp.initialize();
}


$(StartupApp);
