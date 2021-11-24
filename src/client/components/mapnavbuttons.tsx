
// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

// Public utilities
import classNames from 'classnames';

// App libraries
import * as MA from "./materialapp";
import * as ClientActions from '../clientactions';

export interface MapNavButtonsProps
{
  actions: ClientActions.ClientActions,
  designSize: MA.DW,

  classes?: any,
  theme?: any,
}

function MapNavButtonsStyles(theme: any): any
{
  let styles: any = Object.assign({}, MA.AppStyles(theme));

  return (Object.assign(styles, {
    tabLikeText: {
      fontSize: '0.85rem',
    },
    tabLikeIconButton: {
      borderRadius: 2,
      padding: 4,
      marginLeft: 1,
      marginRight: 1,
      borderWidth: 1,
      borderStyle: 'solid',
      opacity: 0.6,
    },
    tabLikeSelected: {
      backgroundColor: styles.tableAlternatingShading.backgroundColor,
      textDecoration: 'underline',
    },
  }));
}

class InternalMapNavButtons extends React.Component<MapNavButtonsProps, {}>
{
  constructor(props: any)
  {
    super(props);
  }

  render(): JSX.Element
  {
    const {designSize} = this.props;

    const buttonsWidth: number = designSize < MA.DW.WIDER ? 180 : 450;
    return (
      <div style={{minWidth: buttonsWidth, textAlign: 'center'}}>
        {/* !bCOI ? this.renderButton(MA.MAPVIEW_MAP) : */ null}
        {/* !bCOI ? this.renderButton(MA.MAPVIEW_STATS) : */ null}
        {/* !is2016 && !bCOI ? this.renderButton(MA.MAPVIEW_RADAR) : */ null}
        {/* !is2016 && !bCOI ? this.renderButton(MA.MAPVIEW_COMPARE) : */ null}
        {/* !is2016 && !bCOI ? this.renderButton(MA.MAPVIEW_ANLZ) : */ null}
        {this.renderButton(MA.MAPVIEW_ANLZ)}
      </div>
    );
  }

  renderButton(mapView: string): JSX.Element
  {
    const {classes, actions, designSize} = this.props;

    let tooltip: string = null;
    let aria: string = null;
    let icon: any = null;
    let label: string = null;
  
    if (mapView === MA.MAPVIEW_ANLZ)
    {
      tooltip = 'Show Analytics';
      aria = 'Analytics';
      icon = <img src='/analytics-icon.png' style={{width: 24, height: 24}} />;
      label = 'Analytics';
    }
    
    return (
      <Material.Tooltip title={MA.getTooltip(tooltip)}>
        <Material.IconButton className={classNames(classes.tabLikeIconButton, /* mapView === curMapView ? classes.tabLikeSelected : */ '')}
          color="inherit"
          onClick={() => actions.fire(ClientActions.Hash, {/* sessionID: sessionID, */ mapView: mapView, replace: true})}
          aria-label={aria}>
          {icon}
          {designSize < MA.DW.WIDER ? null :
            <Material.Typography className={classes.tabLikeText} style={{paddingLeft: 2, width: 'min-content'}}>
              {label}
            </Material.Typography>
          }
        </Material.IconButton>
      </Material.Tooltip>
    );
  }
}

let StyledMapNavButtons: any = withStyles(MapNavButtonsStyles, {withTheme: true})(InternalMapNavButtons);
export const MapNavButtons: new () => React.Component<MapNavButtonsProps, {}> = StyledMapNavButtons;
