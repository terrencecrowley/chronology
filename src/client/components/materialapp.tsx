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

export interface AppProps
{
  env: Environment;
  title: string;
  actions: ClientActions.ClientActions;
  alertParam: ClientActions.ParamAlert;
  progressParam: ClientActions.ParamProgress;

  // Dialogs
  openAlert: boolean;
  openProgress: boolean;
  openReset: boolean;
  openForgot: boolean;

  // Home or per-session
  isAnon: boolean;
  roles: { [role: string]: boolean };

  clearState?: boolean;
  classes?: any;
  theme?: any;
}

// Items that purely control visibility
export interface AppState
{
  openProfile: boolean;
  profileState: ClientActions.ParamProfile;
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
    shareDialogRoot: {
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

class InternalMaterialApp extends React.Component<AppProps, AppState>
{
  env: Environment;
  appActions: AppActions;

  constructor(props: AppProps)
  {
    super(props);

    this.env = props.actions.env;

    this.appActions = new AppActions(this);
    props.actions.mixin(this.appActions);
  }

  fire(id: number, e?: any): boolean
  {
    const { env, actions } = this.props;
    let { profileState } = this.state;
    const u = env.account.user;
    let sp: OT.SessionProps = null;
    let param: any;

    switch (id)
    {
      // Profile dialog actions
      case ActionProfileEditField:
        profileState[e.target.name] = e.target.value;
        this.setState({ profileState: profileState });
        break;

      case ActionProfileClose:
        this.setState({ openProfile: false });
        break;

      case ActionProfileOpen:
        this.setState({ openProfile: true, profileState: { name: u.name, email: u.email, password: '', twitterhandle: u.twitterhandle } });
        break;

      case ActionProfile:
        param = { name: profileState.name, email: profileState.email, twitterhandle: profileState.twitterhandle };
        if (profileState.password != '')
          param.password = profileState.password;
        actions.fire(ClientActions.Profile, param);
        this.setState({ openProfile: false });
        break;

      // Login dialog actions
      case ActionLoginOpen:
        //actions.fire(ClientActions.Hash, {sessionID: '', mapView: HOMEVIEW_LOGIN, replace: true});
        break;

      case ActionLogin:
        param = { email: profileState.email, password: profileState.password };
        actions.fire(ClientActions.Login, param);
        break;

      case ActionLogout:
        actions.fire(ClientActions.Logout);
        break;

      // Signup dialog actions
      case ActionSignupOpen:
        //actions.fire(ClientActions.Hash, {sessionID: '', mapView: HOMEVIEW_SIGNUP, replace: true});
        break;

      case ActionSignup:
        param = { email: profileState.email, password: profileState.password };
        actions.fire(ClientActions.Signup, param);
        break;

      // Forgot Password Dialog Actions
      case ActionForgotOpen:
        actions.fire(ClientActions.OpenForgotPassword);
        break;

      case ActionForgotClose:
        actions.fire(ClientActions.CloseForgotPassword);
        break;

      case ActionForgot:
        actions.fire(ClientActions.ForgotPassword, { email: profileState.email });
        break;

      case ActionResetOpen:
        actions.fire(ClientActions.OpenReset);
        break;

      case ActionResetClose:
        actions.fire(ClientActions.CloseResetPassword);
        break;

      case ActionReset:
        actions.fire(ClientActions.ResetPassword, { password: profileState.password });
        break;

      case ActionVerifyEmail:
        actions.fire(ClientActions.VerifyEmail);
        break;

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

  renderProfileDialog(): any
  {
    const { actions } = this.props;
    const { openProfile, profileState } = this.state;
    if (!openProfile) return null;

    return (<Profile.ProfileView actions={actions} openProfile={openProfile} profileState={profileState} />);
  }

  renderForgotDialog(): any
  {
    const { actions, openForgot, alertParam } = this.props;
    const { profileState } = this.state;
    if (!openForgot) return null;

    let props: ForgotView.ForgotViewProps = {
      actions: actions, profileState: profileState, openForgot: openForgot, alertParam: alertParam
    };

    return <ForgotView.ForgotView {...props} />;
  }

  renderResetDialog(): any
  {
    const { actions, openReset } = this.props;
    const { profileState } = this.state;
    if (!openReset) return null;

    let props: ResetView.ResetViewProps = {
      actions: actions, profileState: profileState, openReset: openReset
    };

    return <ResetView.ResetView {...props} />;
  }

  renderAlertDialog(): any
  {
    const { actions, openAlert, alertParam } = this.props;
    if (!openAlert) return null;

    let props: AlertView.AlertViewProps = {
      actions: actions, openAlert: openAlert, alertParam: alertParam
    };

    return <AlertView.AlertView {...props} />;
  }

  renderProgressDialog(): any
  {
    const { actions, openProgress, progressParam } = this.props;
    if (!openProgress) return null;

    let props: ProgressView.ProgressViewProps = {
      actions: actions, openProgress: openProgress, progressParam: progressParam
    };

    return <ProgressView.ProgressView {...props} />;
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

  render(): any
  {
    const { classes } = this.props;

    let result = (
      <MuiThemeProvider theme={MaterialTheme}>
        <div className={classes.root}>
          {this.renderProfileDialog()}
          {this.renderAlertDialog()}
          {this.renderProgressDialog()}
          {this.renderForgotDialog()}
          {this.renderResetDialog()}
          Hello World
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

