// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import {withStyles, MuiThemeProvider} from '@material-ui/core/styles';
import * as MuiColors from '@material-ui/core/colors';

// Public utilities
import classNames from 'classnames';

// Core OT
import { OT, Util, Poly, G } from "@dra2020/baseclient";
import * as DT from '@dra2020/dra-types';

// App libraries
import { Environment } from '../env';
import * as ClientActions from '../clientactions';
import * as TV from './tableview';
import * as Profile from './profileview';
import * as ResetView from './resetview';
import * as ForgotView from './forgotview';
import * as AlertView from './alertview';
import * as ProgressView from './progressview';
import * as STV from './statictextview';
import * as Hash from '../hash';

import * as AnlzView from './analyticsview';

export const appBarHeight: number = 48;       // Calculated sizes other other panes based on this
export const appBackgroundColor: string = '#fafafa';

let AppActionID = 5000;
export const ActionProfileEditField = AppActionID++;
export const ActionProfileClose = AppActionID++;
export const ActionProfileOpen = AppActionID++;
export const ActionProfile = AppActionID++;
export const ActionLoginOpen = AppActionID++;
export const ActionLogin = AppActionID++;
export const ActionSignupOpen = AppActionID++;
export const ActionSignup = AppActionID++;
export const ActionVisitorClose = AppActionID++;
export const ActionVisitor = AppActionID++;
export const ActionForgotOpen = AppActionID++;
export const ActionForgotClose = AppActionID++;
export const ActionForgot = AppActionID++;
export const ActionResetOpen = AppActionID++;
export const ActionResetClose = AppActionID++;
export const ActionReset = AppActionID++;
export const ActionVerifyEmail = AppActionID++;
export const ActionAlertOpen = AppActionID++;
export const ActionAlertClose = AppActionID++;
export const ActionProgressOpen = AppActionID++;
export const ActionProgressClose = AppActionID++;
export const ActionLogout = AppActionID++;

export enum DW      // Enum representing size ranges for Available Width
{
  PHONE,
  PHONEPLUS,
  NARROW,
  NARROWPLUS,
  NARROWPLUS2,
  TABLET,
  MEDIUM,
  MEDIUMPLUS,
  WIDE,
  WIDER,
  WIDEST,
}

export class AppActions extends ClientActions.ClientActions
{
  app: ClientActions.IClientActions;

  constructor(app: ClientActions.IClientActions)
  {
    super(app.env);
    this.app = app;
  }

  fireIcon(cmd: ClientActions.ParamTableIcon): void
  {
    switch (cmd.name)
    {
    }
  }

  fire(id: number, arg?: any): boolean
  {
    switch (id)
    {
      case ClientActions.TableIconSelect:
        this.fireIcon(arg as ClientActions.ParamTableIcon);
        break;

      case -1: // If we ever have any
        return this.app.fire(id, arg);

      default:
        return this._fire(id, arg);;
    }

    return true;
  }
}

export interface Viewer
{
  name: string,
  open: (appProps: AppProps, params: any) => { props: any, state: any },
  render: (props: any, state: any) => any,
}

export type ViewerIndex = { [name: string]: Viewer };

export interface AppProps
{
  env: Environment;
  title: string;
  actions: ClientActions.ClientActions;

  // Dialogs
  viewers: ViewerIndex;
  viewerProps: ClientActions.ViewerProps;
  viewerState: ClientActions.ViewerState;

  // Home or per-session
  isAnon: boolean;
  roles: { [role: string]: boolean };

  // Stuff to display
  rows: any[];
  selectedRow: string;

  clearState?: boolean;
  classes?: any;
  theme?: any;
}

// Items that purely control visibility
export interface AppState
{
}

const shadingColor = MuiColors.indigo[50];

export function AppStyles(theme: any): any
{
  return ({
    root: {
      flexGrow: 1,
    },
    spacer: {
      flex: '1 1 100%',
    },
    fillSpace: {
      width: '100%',
    },
    fillSpread: {
      width: '100%',
      justifyContent: 'space-between',
    },
    actions: {
      color: theme.palette.text.secondary,
    },
    secondary: {
      color: theme.palette.secondary.main,
    },
    primary: {
      color: theme.palette.primary.main,
    },
    appFrame: {
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      width: '100%',
      height: 'calc(100vh)'
    },
    menuButton: {
      marginLeft: 2,
      marginRight: 2,
    },
    hide: {
      display: 'none',
    },
    bigDialogPaper: {
      maxWidth: '80vw',
      minWidth: '80vw',
    },
    dialogRoot: {
      minWidth: 552,
    },
    tableTitle: {
      marginLeft: 2,
    },
    simpleRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      maxWidth: 552,
    },
    spreadRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 552,
    },
    simpleColumn: {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,  // Fix Safari bug where scrolling content gets shrunk instead of scrolling
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      width: '100%',
      maxWidth: 552,
    },
    firstColumn: {
      width: 120,
      paddingRight: 12,
      textAlign: 'right',
    },
    table: {
      position: 'relative',
      width: '100%',
      height: '90vh',
    },
    tableHeader: {
      display: 'flex',
      alignItems: 'left',
      justifyContent: 'flex-start',
      padding: 0,
      ...theme.mixins.toolbar,
    },
    tableHeadColor: {
      backgroundColor: '#d5dbdb',
    },
    tableAlternatingShading: {
      backgroundColor: '#ebdef0',
    },
    themeBackgroundColor: {
      backgroundColor: theme.palette.background.default,
    },
    sessionTable: {
      minWidth: 520,
    },
    sessionTableWrapper: {
      overflowX: 'auto',
      overflowY: 'scroll',
      width: '100%',
      height: 'calc(100vh - 136px)',
    },
    noMargin: {
      marginLeft: 0,
      marginRight: 0,
      padding: 0,
      borderWidth: 0,
    },
    noPadding: {
      padding: 0,
    },
    denseIcon: {
      width: 24,
      height: 24,
    },
    iconLarge: {
      fontSize: 36,
    },
    veryDenseIcon: {
      width: '16px',
      height: '16px',
      fontSize: '16px',
    },
    denseLabel: {
      fontSize: '0.7rem',
      marginLeft: 2,
      marginRight: 2,
    },
    smallLabel: {
      fontSize: '0.6rem',
      marginLeft: 0,
      marginRight: 0,
    },
    denseFormControl: {
      marginLeft: 2,
      marginRight: 2,
    },
    padding4: {
      padding: 4,
    },
    shortControl: {
      minWidth: 120,
      fontSize: theme.typography.body1.fontSize,
    },
    denseInput: {
      fontSize: theme.typography.body1.fontSize,
      width: 120,
    },
    denseMenuItem: {
      fontSize: '0.7rem',
      marginLeft: 0,
      marginRight: 0,
      height: 24,
    },
    denseSelect: {
      fontSize: '0.7rem',
      marginLeft: 0,
      marginRight: 0,
      minWidth: 48,
    },
    denseIconWithLabel: {
      width: 'fit-content',
      minWidth: '60px',
    },
    denseLabel1: {
      fontSize: '0.75rem',
      marginLeft: 0,
      marginRight: 0,
    },
    denseLabel2: {
      fontSize: '0.8rem',
      margin: 1,
      padding: 1,
    },
    denseLabel3: {
      fontSize: '0.8rem',
      margin: '1px 0px 1px 1px',      // no right margin/padding, because chevron there
      padding: '1px 0px 1px 1px',
    },
    checkCell: {
      fontSize: '0.7rem',
      padding: 0,
      margin: 0,
      width: 0,
    },
    denseCell: {
      fontSize: '0.7rem',
      padding: 0,
      margin: 0,
      '&:last-child': {
        paddingRight: 1,
      },
    },
    subheading: {
      marginTop: 6,
      marginBottom: 3,
    },
    smallPadding: {
      padding: 2,
      margin: 2,
    },
    smallIcon: {
      fontSize: 'small',
      padding: 2,
    },
    linkText: {
      '&:hover': {
        textDecoration: 'underline',
        cursor: 'pointer',
      },
    },
    blueLinkText: {
      color: theme.palette.secondary.main,
      fontSize: '1rem',
      fontWeight: 500,
      padding: 8,
      fontFamily: theme.typography.body2.fontFamily,
      '&:hover': {
        textDecoration: 'underline',
        cursor: 'pointer',
      },
    },
    dialogScrollBlock: {
      height: 400,
      overflowY: 'scroll',
      fontFamily: theme.typography.body2.fontFamily,
    },
    commentText: {
      fontSize: '0.85rem',
      color: 'black',
    },
    commentName: {
      fontSize: '0.85rem',
      color: 'black',
      fontWeight: 'bold',
    },
    commentMeta: {
      fontSize: '0.85rem',
      color: 'grey',
    },
    separator: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: 36,
      width: '100%',
      maxWidth: 552,
    },
    font875: {
      fontSize: '0.875rem',
    },
    font1rem: {
      fontSize: '1rem',
    },
    loginButton: {
      fontSize: '1.0rem',
    },
    cellNoBorder: {
      border: '0px',
    },
  });
}

export class TableActions extends ClientActions.ClientActions
{
  actions: ClientActions.ClientActions;

  constructor(env: Environment, actions: ClientActions.ClientActions)
  {
    super(env);
    this.actions = actions;
  }

  fire(id: number, arg?: any): boolean
  {
    switch (id)
    {
      case ClientActions.SelectionClear:
        break;
      case ClientActions.SelectionEmpty:
        break;
      case ClientActions.SelectionDouble: // id
      case ClientActions.SelectionSet: // id
        break;
      case ClientActions.TableButtonSelect:
        console.log(`analyze button for ${arg.id}, ${arg.name} clicked`);
        this.actions.fire(ClientActions.SetRowToAnalyze, arg.id);
        break;
    }
    return true;
  }
}

class InternalMaterialApp extends React.Component<AppProps, AppState>
{
  env: Environment;
  appActions: AppActions;
  tableActions: TableActions;
  viewers: ViewerIndex;

  constructor(props: AppProps)
  {
    super(props);

    this.env = props.actions.env;

    this.appActions = new AppActions(this);
    this.tableActions = new TableActions(this.env, props.actions);
    props.actions.mixin(this.appActions);

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handlePick = this.handlePick.bind(this);
  }

  fire(id: number, e?: any): boolean
  {
    const { env, actions } = this.props;
    const u = env.account.user;
    let param: any;

    switch (id)
    {
      case ActionAlertOpen:
        actions.fire(ClientActions.OpenAlert, e);
        break;

      case ActionAlertClose:
        actions.fire(ClientActions.CloseAlert);
        break;

      case ActionProgressOpen:
        actions.fire(ClientActions.OpenProgress, e);
        break;

      case ActionProgressClose:
        actions.fire(ClientActions.CloseProgress);
        break;

      default:
        console.log('materialapp.fire: Unexpected app action');
        return false;
        break;
    }

    return true;
  }

  componentWillReceiveProps(props: AppProps): void
  {
  }

  componentDidMount()
  {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress(evt: any): void
  {
    const {actions} = this.props;

    if (evt.altKey || evt.metaKey || evt.ctrlKey)
    {
      let action = 0;
      switch (evt.key)
      {
        case 'f':
          break;
      }
      if (action)
      {
        actions.fire(action);
        evt.stopPropagation();
        evt.preventDefault();
      }
    }
  }

  renderTable(): any
  {
    const {classes, actions, rows} = this.props;
    let Columns: TV.ColumnList = [
      { id: 'name', fieldType: 'string', disablePadding: true, label: 'Name' },
      { id: 'isjson', fieldType: 'boolean', disablePadding: true, label: 'J?' },
      { id: 'analyze', fieldType: 'button', disablePadding: true, label: 'Analyze' },
    ];
    function Sorter(rows: TV.RowList, orderBy: string, order: TV.Ordering): TV.RowList
    {
      return TV.TableViewSorter(rows, Columns, orderBy, order);
    }
    let tablerows = rows.map((r: any) => { return ({ id: r.id, name: r.name, isjson: r.json != null, analyze: 'Analyze' }) });
    let tvProps: TV.TableViewProps = {
      actions: this.tableActions,
      selection: null,
      columns: Columns,
      rows: tablerows,
      sorter: Sorter,
      ordering: 'ASC',
      orderBy: 'name',
      outerHeight: "400px",
      rowHeight: 36,
      disableHeader: false,
      showCheck: false,
    };

    return ( <div className={classes.table}>
              <TV.TableView {...tvProps} />
             </div>);
  }

  renderAnalyticsView(): JSX.Element
  {
    const {rows} = this.props;

    let rowToRender: any = this.props.rows.find((r: any) => r.id === this.props.selectedRow);
    if (rowToRender === undefined) return null;

    console.log(`renderAnalyticsView: ${rowToRender ? 'row to render' : 'no row to render'}`);

    const stateXX: string = 'TODO';
    const bHidePartisanData: boolean = false;

    // HACK - set the designSize <<< cloned from updateDesignSize() in client.tsx
    let el: any = document.getElementById('root');
    let w: number = el.clientWidth;
    let h: number = el.clientHeight;

    let designSize: DW;
    if (w < 376)       designSize = DW.PHONE;
    else if (w < 475)  designSize = DW.PHONEPLUS;
    else if (w < 575)  designSize = DW.NARROW;
    else if (w < 645)  designSize = DW.NARROWPLUS;
    else if (w < 725)  designSize = DW.NARROWPLUS2;
    else if (w < 770)  designSize = DW.TABLET;
    else if (w < 870)  designSize = DW.MEDIUM;
    else if (w < 930)  designSize = DW.MEDIUMPLUS;
    else if (w < 1155) designSize = DW.WIDE;
    else if (w < 1250) designSize = DW.WIDER;
    else               designSize = DW.WIDEST;

    // if (designSize !== this.props.designSize)
    // {
    //   this.props.designSize = designSize;
    //   this.forceRender();
    // }

    const {classes, env, roles, /* curModel, pageView, */ actions /*, designSize */, selectedRow} = this.props;
    // const {redistrict, analyticsWrapper, sessionID} = curModel.derivedProps;
    // const {state, datasource} = curModel.dataContext;

    // return (<>Analytics</>);

    return (<AnlzView.AnalyticsView
      {...{actions, /* curModel, */ xx: stateXX, env, roles, designSize,
        bHidePartisanData, openView: true, /* vaptype: analyticsWrapper.vapType(), */
        row: rows[+selectedRow]
      }}
    />);
  }

  renderViewers(): any[]
  {
    const { viewerProps } = this.props;
    const { viewerState } = this.props;

    let views: any[] = [];
    Object.keys(viewerProps).forEach(key => {
        views.push(this.props.viewers[key].render(viewerProps[key], viewerState[key]));
      });
    return views;
  }

  handlePick(): void
  {
    const {actions} = this.props;
    const alertParam: ClientActions.ParamAlert = { message: 'Pick Files', ok: 'Pick', cancel: 'Cancel' };
    const pickParam: ClientActions.ParamPick = { alertParam: alertParam, multiple: true };

    actions.fire(ClientActions.Open, { name: 'pick', params: pickParam });
  }

  render(): any
  {
    const { classes, actions } = this.props;

    let result = (
      <MuiThemeProvider theme={MaterialTheme}>
        <div className={classes.root}>
          {this.renderViewers()}
          <Material.Button onClick={this.handlePick} >
          Pick Files
          </Material.Button>
          {this.renderTable()}
          {this.renderAnalyticsView()}
        </div>
      </MuiThemeProvider>
    );

    return result;
  }
}

let MaterialTheme: any = Material.createMuiTheme(
  {
    transitions: {
      // So we have transition: none; everywhere
      create: () => 'none',
    },
    palette: {
      primary: {
        light: MuiColors.blue['200'],
        main: MuiColors.blue['700'],
        dark: MuiColors.blue['900'],
        contrastText: '#ebf0f0',
      },
      secondary: {
        light: MuiColors.red['200'],
        main: MuiColors.red['600'],
        dark: MuiColors.red['800'],
        contrastText: '#ebf0f0',
      },
      background: {
        default: '#ffffff',
      },
    },
  }
);

let StyledMaterialApp: any = withStyles(AppStyles, { withTheme: true })(InternalMaterialApp);
export const MaterialApp: new () => React.Component<AppProps, AppState> = StyledMaterialApp;

export function isWide(designSize: DW): boolean
{
  return designSize >= DW.WIDE;
}

export function getTooltip(tip: string): any
{
  return (
    <Material.Typography style={{ fontSize: '0.8rem', color: 'white' }}>
      {tip}
    </Material.Typography>
  )
}

export function shortLabel(label: string): string
{
  return label.length > 4 ? label.slice(0, 4) + '..' : label;
}

// short label Element with optional tooltip, if elided
export function shortLabelOptionalTip(label: string): JSX.Element
{
  const labelP: string = shortLabel(label);
  const elided: boolean = labelP.endsWith('..');

  return elided ?
    <Material.Tooltip title={getTooltip(label)}>
      <span>{labelP}</span>
    </Material.Tooltip> : <span>{labelP}</span>; 
}

export const MAPVIEW_ANLZ = 'anlz';
