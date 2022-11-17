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

export interface ForgotViewProps
{
  actions: ClientActions.ClientActions;
  openForgot: boolean;
  profileState: ClientActions.ParamProfile;
  alertParam: ClientActions.ParamAlert;

  classes?: any;
  theme?: any;
}

function ForgotViewStyles(theme: any): any
{
  return (MA.AppStyles(theme));
}

class InternalForgotView extends React.Component<ForgotViewProps, {}>
{
  constructor(props: any)
  {
    super(props);

  }

  render(): any
  {
    const {classes, actions, openForgot, profileState, alertParam} = this.props;
    let message: string = "Provide the email you used to sign up to DRA 2020 to reset your password."
    if (alertParam.message && alertParam.message != '')
      message += '\n' + alertParam.message;

    return (
      <Material.Dialog
        open={openForgot}
        onClose={(e: any) => actions.fire(MA.ActionForgotClose, e)}
        aria-labelledby="Forgot Password Dialog"
      >
        <Material.DialogTitle id="forgot-password-title">Recover Password for DRA 2020</Material.DialogTitle>
        <Material.DialogContent className={classes.dialogRoot}>
          <Material.DialogContentText>
            {message}
          </Material.DialogContentText>
          <Material.TextField
            autoFocus
            margin="dense"
            id="name"
            inputProps={{name: 'email'}}
            label="Email"
            onChange={(e: any) => actions.fire(MA.ActionProfileEditField, e)}
            type="text"
            value={profileState.email}
            fullWidth
          />
        </Material.DialogContent>
        <Material.DialogActions>
          <Material.Button onClick={(e: any) => actions.fire(MA.ActionForgot, e)} color="primary">
            Submit
            </Material.Button>
          <Material.Button onClick={(e: any) => actions.fire(MA.ActionForgotClose, e)} color="secondary">
            Cancel
            </Material.Button>
        </Material.DialogActions>
      </Material.Dialog>
    );
  }
}

let StyledForgotView: any = withStyles(ForgotViewStyles, {withTheme: true})(InternalForgotView);
export const ForgotView: new () => React.Component<ForgotViewProps, {}> = StyledForgotView;
