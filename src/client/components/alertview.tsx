// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles';

// Public utilities
import classNames = require('classnames');

// App libraries
import * as ClientActions from "../clientactions";
import * as MA from './materialapp';


function alertOpen(appProps: MA.AppProps, params: any): { props: any, state: any }
{
  let props = { actions: appProps.actions, alertParam: params };
  return { props: props, state: null };
}

function alertRender(props: any, state: any): any
{
  return (<AlertView actions={props.actions} alertParam={props.alertParam} />);
}

export let Viewer: MA.Viewer = { name: 'alert', open: alertOpen, render: alertRender };

export interface AlertViewProps
{
  actions: ClientActions.ClientActions;
  alertParam: ClientActions.ParamAlert;

  classes?: any;
  theme?: any;
}

function AlertViewStyles(theme: any): any
{
  return (MA.AppStyles(theme));
}

class InternalAlertView extends React.Component<AlertViewProps, {}>
{
  constructor(props: any)
  {
    super(props);

    this.handleClose = this.handleClose.bind(this);
  }

  multiline(message: string): any
  {
    let lines = message.split('\n');
    let divs = lines.map(line => { return (<div>{line}</div>) });
    return (<div>{divs}</div>);
  }

  handleClose(ok: boolean): void
  {
    const {actions, alertParam} = this.props;

    if (alertParam.onClose)
      alertParam.onClose(ok);

    actions.fire(ClientActions.Close, { name: 'alert' });
  }

  render(): any
  {
    const {classes, actions, alertParam} = this.props;

    return (
      <Material.Dialog
        open={true}
        onClose={() => this.handleClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Material.DialogTitle id="alert-dialog-title">{alertParam.title}</Material.DialogTitle>
        <Material.DialogContent>
          <div className={classes.dialogRoot} />
          <Material.DialogContentText id="alert-dialog-description">
            {this.multiline(alertParam.message)}
          </Material.DialogContentText>
        </Material.DialogContent>
        <Material.DialogActions>
        { (alertParam.ok && alertParam.cancel)
          ? <div>
            <Material.Button onClick={() => this.handleClose(true)} color="primary" autoFocus>
              {alertParam.ok}
            </Material.Button>
            <Material.Button onClick={() => this.handleClose(false)} color="primary" autoFocus>
              {alertParam.cancel}
            </Material.Button>
            </div>
          : <Material.Button onClick={() => this.handleClose(false)} color="primary" autoFocus>
              Dismiss
            </Material.Button>
        }
        </Material.DialogActions>
      </Material.Dialog>
    );
  }
}

let StyledAlertView: any = withStyles(AlertViewStyles, {withTheme: true})(InternalAlertView);
export const AlertView: new () => React.Component<AlertViewProps, {}> = StyledAlertView;
