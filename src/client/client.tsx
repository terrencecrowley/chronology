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
import * as Viewers from './components/viewers';
import * as Hash from './hash';
import * as Ajax from "./ajax";
import { FsmReadFile, FsmReadJSONFiles } from './readfile';

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

      case ClientActions.Open:
        this.app.actionOpen(arg);
        break;

      case ClientActions.Close:
        this.app.actionClose(arg);
        break;

      case ClientActions.Apply:
        this.app.actionApply(arg);
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
      title: 'Template',
      roles: {},
      actions: this.actions,
      isAnon: false,

      // General
      viewerProps: {},
      viewerState: {},
      viewers: Viewers.viewers(),

      // Content
      rows: [],
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

  initialize(): void
  {
    window.addEventListener('hashchange', (ev: HashChangeEvent) => {
      const { location } = window;
  
      //console.log('Hash change:' + location.hash);
      this.handleHashChange(location);
    });
    this.forceRender();
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
    this.props.viewerProps = {};
    this.props.viewerState = {};
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

  actionOpen(arg: any): void
  {
    let { props, state } = this.props.viewers[arg.name].open(this.props, arg.params);
    this.props.viewerProps[arg.name] = props;
    this.props.viewerState[arg.name] = state;
    this.forceRender();
  }

  actionClose(arg: any): void
  {
    delete this.props.viewerProps[arg.name];
    delete this.props.viewerState[arg.name];
    this.forceRender();
  }

  actionApply(arg: any): void
  {
    const { name, props, state } = arg;

    switch (name)
    {
      case 'pick':
        new FSM.FsmOnDone(this.props.env, new FsmReadJSONFiles(this.props.env, state.files), (f: FsmReadJSONFiles) => {
            this.props.rows = f.rows;
            this.forceRender();
          });
        break;
    }
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

}

let theApp: App = null;


function StartupApp()
{
  theApp = new App();
  theApp.initialize();
}


$(StartupApp);
