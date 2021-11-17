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

export interface ProfileViewProps
{
  actions: ClientActions.ClientActions;
  openProfile: boolean;
  profileState: ClientActions.ParamProfile;

  classes?: any;
  theme?: any;
}

function ProfileViewStyles(theme: any): any
{
  return (MA.AppStyles(theme));
}

class InternalProfileView extends React.Component<ProfileViewProps, {}>
{
  constructor(props: any)
  {
    super(props);

  }

  render()
  {
    const {actions, openProfile, profileState} = this.props;
    let bNoEmail: boolean = profileState.email == '';
    let bNoName: boolean = profileState.name == '';

    return (
      <Material.Dialog
        open={openProfile}
        onClose={(e: any) => actions.fire(MA.ActionProfileClose, e)}
        aria-labelledby="User Profile Dialog"
      >
        <Material.DialogTitle id="profile-dialog-title">User Profile</Material.DialogTitle>
        <Material.DialogContent>
          <Material.DialogContentText>
            Your name and Twitter handle are visible to other users when you share or publish maps. Your email and password are private to DRA 2020.
          </Material.DialogContentText>
          <Material.TextField
            autoFocus
            margin="dense"
            id="name"
            label="User Name"
            inputProps={{name: 'name'}}
            onChange={(e: any) => actions.fire(MA.ActionProfileEditField, e)}
            onKeyPress={(e: any) => { if (e.key === 'Enter' && !bNoEmail && !bNoName) actions.fire(MA.ActionProfile, e) }}
            type="text"
            value={profileState.name}
            fullWidth
          />
          <Material.TextField
            margin="dense"
            id="email"
            label="Email Address"
            inputProps={{name: 'email'}}
            onChange={(e: any) => actions.fire(MA.ActionProfileEditField, e)}
            onKeyPress={(e: any) => { if (e.key === 'Enter' && !bNoEmail && !bNoName) actions.fire(MA.ActionProfile, e) }}
            type="email"
            value={profileState.email}
            fullWidth
          />
          <Material.TextField
            margin="dense"
            id="password"
            label="Password"
            inputProps={{name: 'password'}}
            onChange={(e: any) => actions.fire(MA.ActionProfileEditField, e)}
            onKeyPress={(e: any) => { if (e.key === 'Enter' && !bNoEmail && !bNoName) actions.fire(MA.ActionProfile, e) }}
            type="password"
            value={profileState.password}
            fullWidth
          />
          <Material.TextField
            autoFocus
            margin="dense"
            id="twitterhandle"
            label="Twitter Handle"
            inputProps={{name: 'twitterhandle'}}
            onChange={(e: any) => actions.fire(MA.ActionProfileEditField, e)}
            onKeyPress={(e: any) => { if (e.key === 'Enter' && !bNoEmail && !bNoName) actions.fire(MA.ActionProfile, e) }}
            type="text"
            value={profileState.twitterhandle}
            fullWidth
          />
        </Material.DialogContent>
        <Material.DialogActions>
          <Material.Button disabled={bNoEmail} onClick={(e: any) => actions.fire(MA.ActionVerifyEmail, e)} color="primary">
            Verify Email
          </Material.Button>
          <Material.Button onClick={(e: any) => actions.fire(MA.ActionProfileClose, e)} color="primary">
            Cancel
          </Material.Button>
          <Material.Button disabled={bNoEmail || bNoName} onClick={(e: any) => actions.fire(MA.ActionProfile, e)} color="primary">
            Update Profile
          </Material.Button>
        </Material.DialogActions>
      </Material.Dialog>
    );
  }

}

let StyledProfileView: any = withStyles(ProfileViewStyles, {withTheme: true})(InternalProfileView);
export const ProfileView: new () => React.Component<ProfileViewProps, {}> = StyledProfileView;
