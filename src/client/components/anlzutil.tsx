// Common functions, types, classes and data for all analytics views (analytics, stats, radar)

// Core react imports
import * as React from 'react';
// declare var Plotly: any;

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
// import { withStyles } from '@material-ui/core/styles';
import * as MuiColors from '@material-ui/core/colors';

// Public utilities
import classNames from 'classnames';

// App libraries
import * as MA from "./materialapp";
import * as ClientActions from '../clientactions';
import * as MNB from './mapnavbuttons';

const navBarHeight = 50;
export const bAnnotateDiagram = 'true';

// *******************************************************************
// Styles
export function Styles(theme: any): any
{
  // Common styles for Stats, Radar, and Analytics Views
  let styles: any = Object.assign({}, MA.AppStyles(theme));

  return (Object.assign(styles, {
    expandPanelDetails: {
      display: 'block',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
    expandPanelSummary: {
      backgroundColor: '#e6ffe6',
    },
    expandPanelSummaryExpanded: {
      margin: '0px',
    },
    expandedContent: {
      flexGrow: 'inherit',
      '&$expanded': {
        flexGrow: 'inherit',
      },
    },
    expanded: {},
    districtsCellPadding: {
      padding: 4,
      '&:last-child': {
        paddingRight: 8,
      },
    },
    squareBox: {
      width: '16px',
      height: '16px',
      margin: 'auto'
    },
    smallIconSize: {
      width: '10px',
      height: '10px',
    },
    smallIconRightPadding: {
      paddingRight: '8px',
    },
    backRed: {
      backgroundColor: 'red',
    },
    backGreen: {
      backgroundColor: 'green',
    },
    backYellow: {
      backgroundColor: '#ffee00',
    },
    red: {
      color: 'red',
    },
    green: {
      color: 'green',
    },
    yellow: {
      color: '#ffee00',
    },
    cellCenter: {
      textAlign: 'center',
    },
    fontBig: {
      fontSize: '1.4rem',
    },
    cellRightBorder: {
      borderRight: '1px',
      borderLeft: '0px',
      borderTop: '0px',
      borderStyle: 'solid',
    },
    cellLessPadding: {
      padding: '4px 16px 4px 16px',
    },
    cellLessPaddingExceptTop: {
      padding: '16px 16px 4px 16px',
    },
    cellNoBorder: {
      border: '0px',
    },
    boldCell: {
      fontWeight: 500,
    },
    cellPadding: {
      padding: '4px 3px 4px 3px',
    },
    cellPaddingExtraLeft: {
      padding: '4px 3px 4px 9px',
    },
    cellPaddingUpper: {
      padding: '4px 3px 0px 3px',
    },
    cellPaddingLower: {
      padding: '0px 3px 4px 3px',
    },
    notesCell: {
      fontSize: '1rem',
      border: '0px',
      padding: '4px 3px 4px 3px',
      verticalAlign: 'top',
    },
    metricLabelCell: {
      border: '0px',
      padding: '4px 0px 4px 3px',
      verticalAlign: 'top',
    },
    metricValueCell: {
      border: '0px',
      padding: '4px 6px 4px 0px',
      verticalAlign: 'top',
    },
    metricDescripCell: {
      border: '0px',
      padding: '4px 3px 4px 3px',
    },
    ratingTextCell: {
      fontSize: '1rem',
      border: '1px solid #0000006f',
      width: 78,
      padding: '0px 1px 0px 1px',
      textAlign: 'center',
      verticalAlign: 'bottom',
    },
    plotSideCtrlCell: {
      verticalAlign: 'top',
      minWidth: 200,
      width: 200,
      paddingLeft: 0,
      paddingRight: 8,
    },
    plotSideCtrlCellSmall: {
      verticalAlign: 'top',
      minWidth: 133,
      width: 140,
      paddingLeft: 0,
      paddingRight: 8,
    },
    ratingTable: {
      tableLayout: 'fixed',
      width: 'auto',
      paddingLeft: 34,
      paddingRight: 12,
      marginTop: 10,
      display: 'block',
    },
    iconCell: {
      width: 12,
      verticalAlign: 'top',
    },
    leftPaddingDescrip: {
      paddingLeft: 9,
    },
    tableMarginTop: {
      marginTop: 40,
    },
    notesTable: {
      marginTop: 40,
      marginLeft: 12,
      width: 'auto',
    },
    tableSortLabel: {
      icon: {
        margin: 0,
      },
    },
    scoringTable: {
      paddingLeft: 12,
      paddingRight: 12,
      marginTop: 24,
      display: 'block',
    },
    anlzPanelPaper: {
      height: 'auto',
      width: '100%',
      margin: 0,
      padding: '0px 0px 0px 0px',
      backgroundColor: theme.palette.background.default,
    },
    panelPaper: {
      height: 'auto',
      backgroundColor: theme.palette.background.default,
    },
    overallBackground: {
      backgroundColor: theme.palette.background.default,
    },
    navPadding: {
      paddingLeft: 10, paddingRight: 10,
    },
    navLink: {
      fontWeight: 400,
      textDecoration: 'underline',
      textTransform: 'inherit',
      paddingLeft: 4,
      paddingRight: 4,
    },
    disclaimerText: {
      fontSize: '1rem',
      fontStyle: 'italic',
    },
    cellThickBottomBorder: {
      borderBottom: '2px solid black',
    },
    cellBottomBorder: {
      borderBottom: '1px solid black',
    },
    cellLightBottomBorder: {
      borderBottom: '1px solid #a0a0a0ff',
    },
    cellThickTopBorder: {
      borderTop: '2px solid black',
    },
    cellTopBorder: {
      borderTop: '1px solid black',
    },
    cellTopBotBorder: {
      borderTop: '1px solid black',
      borderBottom: '1px solid black',
    },
    cellLeftBorder: {
      borderLeft: '1px solid black',
    },
    cellRightBorder1: {
      borderRight: '1px solid black',
    },
    backToTop: {
      padding: '4px 16px 4px 4px',
    },
    sliderPadding: {
      paddingTop: 0,
      paddingBottom: 9,
    },
    sliderRail: {
      height: 10,
      border: '1px solid black',
      backgroundColor: 'transparent',
      right: '-1px',
    },
    sliderTrack: {
      height: 11,
    },
    sliderThumb: {
      width: 20,
      height: 20,
      border: '1px solid black',
      backgroundColor: theme.palette.background.default,
    },
    sliderPadding1: {
      padding: 0,
      marginBottom: 12,
    },
    sliderRail1: {
      height: 17,
      //border: '1px solid black',
      backgroundColor: 'transparent',
      //right: '-1px',
    },
    sliderTrack1: {
      height: 18,
      backgroundColor: styles.tableHeadColor.backgroundColor,
    },
    sliderThumb1: {
      width: 0,
      height: 0,
      marginTop: 0,
      border: '0px solid transparent',
      backgroundColor: theme.palette.background.default,
    },
    ratingColor: {
      backgroundColor: styles.tableHeadColor.backgroundColor,
    },
    sliderValueLabel: {
      left: 'calc(-50% + 2px)',
      top: 3,
      '& *': {
        background: 'transparent',
        color: '#000',
        fontSize: '0.7rem',
      },
    },
    sliderMarkLabel: {
      top: 20,
    },
    sliderMark: {
      height: 8,
      width: 2,
      marginTop: '-2px',
      backgroundColor: 'black',
    },
    sliderPadding2: {
      padding: 0,
      marginBottom: 12,
    },
    sliderRail2: {
      height: 7,
      border: '1px solid #0000006f',
      backgroundColor: 'transparent',
      //right: '-1px',
    },
    sliderTrack2: {
      height: 8,
      paddingLeft: 1.5,
      backgroundColor: theme.palette.secondary.main,
      marginTop: 0.5,
    },
    sliderThumb2: {
      width: 0,
      height: 0,
      marginTop: 0,
      border: '0px solid transparent',
      backgroundColor: theme.palette.background.default,
    },
    sliderMarkLabel2: {
      top: 8,
    },
    sliderMark2: {
      height: 10,
      width: 2,
      marginTop: '-12px',
      backgroundColor: 'black',
    },
    sliderBubble: {
      position: 'relative',
      top: 29.5,
      left: 8,
      marginTop: -15,
      padding: 0,
      width: 15,
      height: 15,
      borderRadius: '50%',
      backgroundColor: theme.palette.secondary.main,
    },
    markCover2: {
      height: 7,
      width: 36,
      marginTop: '-7px',
      backgroundColor: theme.palette.background.default,
      position: 'relative',
      top: 11,
      zIndex: 1100,
    },
    ratingTextCell2: {
      fontSize: '0.8rem',
      border: '0px solid transparent',
      width: 90,
      padding: '0px 1px 0px 1px',
      textAlign: 'center',
      verticalAlign: 'bottom',
    },
    ratingSliderCell2: {
      fontSize: '1rem',
      border: '0px solid transparent',
      padding: '4px 6px 4px 6px',
      textAlign: 'center',
    },
    ratingSliderDiv: {
      border: '1px solid #0000006f',
      borderRadius: '15px',
      padding: '14px 20px 8px 20px',
    },
    ratingTable2: {
      tableLayout: 'fixed',
      width: 'fit-content',
      marginLeft: 26,
      //padding: '4px 12px 4px 12px',
      marginTop: 10,
      display: 'block',
      backgroundColor: theme.palette.background.default,
      borderRadius: '15px',
    },
    ratingColor2: {
      backgroundColor: styles.tableHeadColor.backgroundColor,
    },
    panelHeadingTable: {
      //marginLeft: 12,
      //marginRight: 12,
      //width: 'auto',
      borderTopStyle: 'solid',
      borderTopWidth: 1,
      borderTopColor: '#00000050',
    },
    switchBase: {
      color: MuiColors.green[300],
      '&$checked': {
        color: MuiColors.green[600],
      },
      '&$checked + $track': {
        backgroundColor: MuiColors.green[300],
      },
    },
    checked: {},
    track: {},
    scrollContainer: {
      overflow: 'auto',
      height: 'calc(100vh - ' + String(MA.appBarHeight + navBarHeight + 1) + 'px)',
      borderTop: '1px solid black',
    },
    navSelect: {
      marginLeft: 10,
      fontSize: '0.9rem',
      paddingTop: 2,
      paddingBottom: 2,
    },
    navItemPadding: {
      paddingTop: 0,
      paddingBottom: 0,
    },
    switchRoot: {
      float: 'left',
      marginLeft: 6,
      marginRight: 6,
    },
    switchLabel: {
      fontSize: '1rem',
    },
    switchLabelSmall: {
      fontSize: '0.875rem',
    },
  }));
}

// *******************************************************************
// Metadata

export enum Units
{
  Fraction,
  Percentage,
  Integer,
  Number,
  Degrees
}

export type Dict = {[key: string]: any};

// *******************************************************************
// Helper functions

export function formatPercent(num: number, fracDigits: number): string
{
  let formatted: string = (Math.round(num * 10000) / 100).toLocaleString('en-US', { minimumIntegerDigits: 1, minimumFractionDigits: fracDigits, maximumFractionDigits: fracDigits }) + '%';
  if (formatted === '-0.00%')
    return '0.00%';
  return formatted;
}

export function formatNumber(raw: number, units: Units): string
{
  return externalFormat(raw, units).toLocaleString('en-US', unitsOptions(units));
}

export function externalFormat(internal: number, units: Units): number
{
  const decimalPlaces = unitsOptions(units)['minimumFractionDigits'];

  let external: number = internal;

  switch (units)
  {
    case Units.Percentage: {
      external = trim((internal * 100), decimalPlaces);
      break;
    }
    default: {
      external = trim(internal, decimalPlaces);
      break;
    }
  }

  return external;
}

// NOTE - There may be a better, more declarative way to do this.
export function unitsOptions(units: Units): Dict
{
  let options: Dict;

  switch (units)
  {
    case Units.Fraction: {
      options = {minimumFractionDigits: 4, maximumFractionDigits: 4};
      break;
    }
    case Units.Percentage: {
      options = {minimumFractionDigits: 2, maximumFractionDigits: 2};
      break;
    }
    case Units.Integer: {
      options = {minimumFractionDigits: 0, maximumFractionDigits: 0};
      break;
    }
    case Units.Number: {
      options = {minimumFractionDigits: 2, maximumFractionDigits: 2};
      break;
    }
    case Units.Degrees: {
      options = {minimumFractionDigits: 2, maximumFractionDigits: 2};
      break;
    }
    default: {
      console.log('Unrecognized type of units.');
      break;
    }
  }

  return options;
}

// NOTE - There may be a better, more declarative way to do this.
export function unitsSymbol(units: Units): string
{
  let symbol: string;

  switch (units)
  {
    case Units.Percentage: {
      symbol = '%';
      break;
    }
    case Units.Degrees: {
      symbol = '°';
      break;
    }
    default: {
      symbol = ' ';

      break;
    }
  }

  return symbol;
}

export function trim(fullFraction: number, digits: number | undefined = undefined): number
{
  const defaultDigits = 4;

  if (digits === 0)
  {
    return Math.round(fullFraction);
  }
  else
  {
    let shiftPlaces = 10 ** (digits || defaultDigits);

    return Math.round(fullFraction * shiftPlaces) / shiftPlaces;
  }
}

export function plotWidth(designSize: MA.DW): number
{
  return designSize <= MA.DW.MEDIUM ? Math.max(window.innerWidth - 220, 375) :
    designSize <= MA.DW.MEDIUMPLUS ? 650 : 700;
}

export function sectionPanelWidth(designSize: MA.DW): number
{
  return plotWidth(designSize) + 32 /* 1st cell padding */ + 8 /* 2nd cell padding */ +
    (designSize <= MA.DW.MEDIUMPLUS ? 133 : 200);
}

// ************************************************************
// Rendering Helpers

export function renderNavLinkBar(classes: any, actions: ClientActions.ClientActions, curMapView: string, /* curModel: MapModel, */ designSize: MA.DW,
  links: {label: string, id: string}[], infoUrl: string, infoTooltip: string): JSX.Element
{
  const buttonsWidth: number = designSize < MA.DW.WIDER ? 146 : 356;
  return (
    <Material.Table size='small' padding='none' style={{height: navBarHeight}}>
      <Material.TableRow>
        <Material.TableCell className={classNames(classes.cellNoBorder)}>
          {renderLinks(classes, links, designSize)}
        </Material.TableCell>
        <Material.TableCell className={classNames(classes.cellNoBorder)} align='center' style={{width: buttonsWidth}}>
          <MNB.MapNavButtons {...{actions, curMapView, /* curModel, */ designSize}}/>
        </Material.TableCell>
        <Material.TableCell className={classNames(classes.cellNoBorder)} align='center' style={{width: 40, paddingRight: 5}}>
          <Material.Tooltip title={MA.getTooltip(infoTooltip)}>
            <Material.IconButton style={{padding: '8px 0px 0px 0px'}}>
              <Material.Link
                color="inherit"
                aria-label='Info'
                href={infoUrl}
                target={'_blank'}
                rel='noopener'
              >
                <Icons.Info fontSize='large' />
              </Material.Link>
            </Material.IconButton>
          </Material.Tooltip>
        </Material.TableCell>
      </Material.TableRow>
    </Material.Table>
  );
}

function renderLinks(classes: any, links: {label: string, id: string}[], designSize: MA.DW): JSX.Element
{

  if (links.length == 0)
    return <Material.Typography>&nbsp;&nbsp;</Material.Typography>;
  
  if (MA.isWide(designSize))
  {
    return (
      <Material.Table size='small' padding='none' style={{display: 'block', paddingLeft: 10}}>
        <Material.TableRow>
          {links.map(link =>
            <Material.TableCell className={classNames(classes.cellNoBorder)}>
              <Material.Button color='primary' className={classes.navLink} onClick={() => document.getElementById(link.id).scrollIntoView()}>
                {link.label}
              </Material.Button>
            </Material.TableCell>)}
        </Material.TableRow>
      </Material.Table>
    );
  }
  else
  {
    return (
      <Material.Select
        className={classNames(classes.navSelect, classes.navLink)}
        inputProps={{name: 'ratings-SectionNav'}}
        value={0}
      >
        <Material.MenuItem dense disableGutters value={0}>
          <Material.Typography color='primary' className={classNames(classes.navLink, classes.navItemPadding)} style={{fontSize: '0.875rem'}}>
            <em>Go To Section</em>
          </Material.Typography>
        </Material.MenuItem>
        {links.map((link, index) =>
          <Material.MenuItem dense disableGutters value={index + 1} className={classNames('')}>
            <Material.Button color='primary' className={classNames(classes.navLink, classes.navItemPadding)} onClick={() => document.getElementById(link.id).scrollIntoView()}>
              {link.label}
            </Material.Button>
          </Material.MenuItem>)}
      </Material.Select>
    );
  }
}

export function renderBackToTop(classes: any, topId: string, leftText?: string): JSX.Element
{
  return (
    <Material.Table>
      <Material.TableRow>
        <Material.TableCell className={classNames(classes.disclaimerText, classes.cellNoBorder)}>
          {leftText ? <Icons.Warning color='secondary' style={{verticalAlign: 'text-bottom', paddingRight: 6}} /> : null}
          {leftText}
        </Material.TableCell>
        <Material.TableCell align='right' className={classNames(classes.cellNoBorder)} style={{paddingRight: 1}}>
          <Material.Button color='primary'
            className={classNames(classes.backToTop, classes.navLink)}
            onClick={() => document.getElementById(topId).scrollIntoView()}
          >
            Back to top
          </Material.Button>
        </Material.TableCell>
      </Material.TableRow>
    </Material.Table>
  );
}

export function renderPanelHeading(classes: any, heading: string, explanation: string, articleUrl: string, bShowHeading: boolean = true): JSX.Element
{
  // Return 2-row table to be the heading of a panel
  const tooltip = 'More information about ' + heading;

  if (!bShowHeading)
    heading = '';

  return (
    <Material.Table size='small' className={classes.panelHeadingTable}>
      <Material.TableRow>
        <Material.TableCell className={classes.cellNoBorder}>
          <Material.Typography variant='h6' style={{float: 'left'}}>
            {heading}
          </Material.Typography>
        </Material.TableCell>
        <Material.TableCell align='right' className={classes.cellNoBorder} style={{paddingRight: 1}}>
          {articleUrl ? <Material.Tooltip title={MA.getTooltip(tooltip)}>
            <Material.IconButton>
              <Material.Link
                color='inherit'
                aria-label='Info'
                href={articleUrl}
                target={'_blank'}
                rel='noopener'
              >
                <Icons.Info className={classes.iconLarge} />
              </Material.Link>
            </Material.IconButton>
          </Material.Tooltip> : null}
        </Material.TableCell>
      </Material.TableRow>
      {explanation ? <Material.TableRow>
        <Material.TableCell className={classes.cellNoBorder}>
          <Material.Typography variant='body1' style={{fontSize: '1rem'}}>
            {explanation}
          </Material.Typography>
        </Material.TableCell>
      </Material.TableRow> : null}
    </Material.Table>
  );
}
