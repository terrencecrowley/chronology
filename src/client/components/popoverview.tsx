// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles';

// Public utilities
import classNames from 'classnames';

// App libraries
import * as ClientActions from "../clientactions";
import * as MA from './materialapp';

export interface PopoverViewProps
{
  alertParam: ClientActions.ParamAlert;
  width?: string;
  anchorEl?: any;
  classes?: any;
  theme?: any;
}

function PopoverViewStyles(theme: any): any
{
  return ({
    size1: {
      fontSize: '1.0rem',
    },
    popupPadding: {
      paddingLeft: '22px',
      paddingRight: '10px',
      paddingTop: '10px',
      paddingBottom: '4px',
    },
    popupMaxWidth: {
      maxWidth: '500px',
    },
  });
}

class InternalPopoverView extends React.Component<PopoverViewProps, {}>
{
  constructor(props: any)
  {
    super(props);
  }

  render(): any
  {
    const {classes, alertParam, width, anchorEl} = this.props;
          
    return (
      <Material.Popover    
        style={{width: width? width : ''}}
        anchorEl={anchorEl ? anchorEl : ''}
        open={alertParam.message && alertParam.onClose !== undefined}
        onClick={() => alertParam.onClose(true)}
        onEscapeKeyDown={() => alertParam.onClose(false)}
        onBackdropClick={() => alertParam.onClose(false)}
        anchorOrigin={alertParam.anchorOrigin ? alertParam.anchorOrigin : {vertical: 'top', horizontal: 'left'}}
        >
        <Material.Typography variant='h6' color={'secondary'} className={classNames(classes.popupPadding)}>
          {alertParam.title}
        </Material.Typography>
        <Material.Typography className={classNames(classes.popupPadding, classes.size1)} style={{whiteSpace: 'pre-line'}}>
          {alertParam.message}
        </Material.Typography>
        { alertParam.ok && alertParam.cancel
          ? <div>
              <Material.Button onClick={() => alertParam.onClose(true)} color={'secondary'} autoFocus >{alertParam.ok}</Material.Button>
              <Material.Button onClick={() => alertParam.onClose(false)} color={'secondary'} autoFocus >{alertParam.cancel}</Material.Button>
            </div>
          : <Material.Button onClick={() => alertParam.onClose(true)} color={'secondary'} autoFocus >OK</Material.Button>
        }
      </Material.Popover>
    );
  }
}

let StyledPopoverView: any = withStyles(PopoverViewStyles, {withTheme: true})(InternalPopoverView);
export const PopoverView: new () => React.Component<PopoverViewProps, {}> = StyledPopoverView;
