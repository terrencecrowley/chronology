// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import {withStyles, MuiThemeProvider} from '@material-ui/core/styles';
import * as MuiColors from '@material-ui/core/colors';

// App libraries
import { Environment } from '../env';
import * as ClientActions from '../clientactions';
import * as TV from './tableview';
import * as Profile from './profileview';
import * as ResetView from './resetview';
import * as ForgotView from './forgotview';
import * as AlertView from './alertview';
import * as PickView from './pickview';
import * as ProgressView from './progressview';
import * as STV from './statictextview';
import * as MA from './materialapp';

export function viewers(): MA.ViewerIndex
{
  let viewers: MA.ViewerIndex = {};
  viewers[AlertView.Viewer.name] = AlertView.Viewer;
  viewers[PickView.Viewer.name] = PickView.Viewer;
  viewers[Profile.Viewer.name] = Profile.Viewer;
  return viewers;
}
