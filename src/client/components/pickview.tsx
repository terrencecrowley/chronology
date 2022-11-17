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


function pickOpen(appProps: MA.AppProps, params: any): { props: any, state: any }
{
  let state: PickViewState = { fileName: '', files: [] };
  let props: PickViewProps = { actions: appProps.actions, alertParam: params.alertParam, multiple: params.multiple, initState: state };
  return { props: props, state: state };
}

function pickRender(props: any, state: any): any
{
  return (<PickView
            actions={props.actions}
            alertParam={props.alertParam}
            target={props.target}
            multiple={props.multiple}
            initState={state}
          />);
}

export let Viewer: MA.Viewer = { name: 'pick', open: pickOpen, render: pickRender };

export interface PickViewProps
{
  actions: ClientActions.ClientActions;
  alertParam: ClientActions.ParamAlert;
  multiple?: boolean;
  target?: string;
  initState: PickViewState;

  classes?: any;
  theme?: any;
}

export interface PickViewState
{
  fileName: string,
  files: any[],
}

function PickViewStyles(theme: any): any
{
  return (MA.AppStyles(theme));
}

class InternalPickView extends React.Component<PickViewProps, {}>
{
  constructor(props: any)
  {
    super(props);

    this.handleClose = this.handleClose.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.state = props.initState;
  }

  handleClose(ok: boolean): void
  {
    const {actions} = this.props;

    if (ok)
      actions.fire(ClientActions.Apply, { name: 'pick', props: this.props, state: this.state });
    actions.fire(ClientActions.Close, { name: 'pick' });
  }

  handleFile(e: any): void
  {
    this.setState({ fileName: e.target.value, files: e.target.files });
  }

  multiline(message: string): any
  {
    let lines = message.split('\n');
    let divs = lines.map(line => { return (<div>{line}</div>) });
    return (<div>{divs}</div>);
  }

  render(): any
  {
    const {classes, actions, alertParam, multiple} = this.props;
    const inputProps = multiple ? { multiple: 'multiple' } : {};

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
          <Material.TextField
            autoFocus
            margin="dense"
            name="file"
            label="File"
            type="file"
            onChange={this.handleFile}
            inputProps={inputProps}
            fullWidth
           />
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

let StyledPickView: any = withStyles(PickViewStyles, {withTheme: true})(InternalPickView);
export const PickView: new () => React.Component<PickViewProps, {}> = StyledPickView;
