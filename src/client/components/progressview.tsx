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

export interface ProgressViewProps
{
  actions: ClientActions.ClientActions;
  progressParam: ClientActions.ParamProgress;

  classes?: any;
  theme?: any;
}

function ProgressViewStyles(theme: any): any
{
  return (MA.AppStyles(theme));
}

class InternalProgressView extends React.Component<ProgressViewProps, {}>
{
  constructor(props: any)
  {
    super(props);

    this.handleClose = this.handleClose.bind(this);
  }

  handleClose(e: any): void
  {
    const {actions, progressParam} = this.props;

    if (progressParam.onClose)
      progressParam.onClose(true);

    actions.fire(MA.ActionProgressClose, e);
  }

  render(): any
  {
    const {classes, actions, progressParam} = this.props;

    let icon = progressParam.value === undefined
                  ? <Material.CircularProgress />
                  : <Material.CircularProgress variant='determinate' value={progressParam.value} />;

    return (
      <Material.Dialog
        open={true}
        onClose={this.handleClose}
        aria-labelledby="progress-dialog-title"
        aria-describedby="progress-dialog-description"
      >
        <Material.DialogTitle id="progress-dialog-title">{progressParam.title}</Material.DialogTitle>
        <Material.DialogContent>
          <div className={classes.dialogRoot} />
          <Material.DialogContentText id="progress-dialog-description">
            {progressParam.message}
          </Material.DialogContentText>
          {icon}
        </Material.DialogContent>
        <Material.DialogActions>
          <Material.Button onClick={this.handleClose} color="primary" autoFocus>
            Dismiss
          </Material.Button>
        </Material.DialogActions>
      </Material.Dialog>
    );
  }
}

let StyledProgressView: any = withStyles(ProgressViewStyles, {withTheme: true})(InternalProgressView);
export const ProgressView: new () => React.Component<ProgressViewProps, {}> = StyledProgressView;
