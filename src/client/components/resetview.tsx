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

export interface ResetViewProps
{
  actions: ClientActions.IClientActions;
  openReset: boolean;
  profileState: ClientActions.ParamProfile;

  classes?: any;
  theme?: any;
}

function ResetViewStyles(theme: any): any
{
  return (MA.AppStyles(theme));
}

class InternalResetView extends React.Component<ResetViewProps, {}>
{
  constructor(props: any)
  {
    super(props);

  }

  render(): any
  {
    const {classes, actions, openReset, profileState} = this.props;
    let message: string = "Please enter your new password.";

    return (
      <Material.Dialog
        open={openReset}
        onClose={(e: any) => actions.fire(MA.ActionResetClose, e)}
        aria-labelledby="Reset Password Dialog"
      >
        <Material.DialogTitle id="forgot-password-title">Reset Password for DRA 2020</Material.DialogTitle>
        <Material.DialogContent className={classes.dialogRoot}>
          <Material.DialogContentText>
            {message}
          </Material.DialogContentText>
          <Material.TextField
            autoFocus
            margin="dense"
            id="name"
            inputProps={{name: 'password'}}
            label="Password"
            onChange={(e: any) => actions.fire(MA.ActionProfileEditField, e)}
            type="password"
            value={profileState.password}
            fullWidth
          />
        </Material.DialogContent>
        <Material.DialogActions>
          <Material.Button onClick={(e: any) => { actions.fire(MA.ActionReset, e); actions.fire(MA.ActionResetClose, e) } } color="primary">
            Submit
            </Material.Button>
          <Material.Button onClick={(e: any) => actions.fire(MA.ActionResetClose, e)} color="secondary">
            Cancel
            </Material.Button>
        </Material.DialogActions>
      </Material.Dialog>
    );
  }
}

let StyledResetView: any = withStyles(ResetViewStyles, {withTheme: true})(InternalResetView);
export const ResetView: new () => React.Component<ResetViewProps, {}> = StyledResetView;
