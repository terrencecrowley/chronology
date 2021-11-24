// Common functions, types, classes and data for all analytics views (analytics, stats, radar)

// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
// import { withStyles } from '@material-ui/core/styles';
import * as MuiColors from '@material-ui/core/colors';

// Public utilities
import classNames from 'classnames';

/// DELETED ///

/// EDITED ///
// App libraries
import * as MA from "./materialapp";
import * as ClientActions from '../clientactions';
import * as MNB from './mapnavbuttons';

const numWords = require('num-words');

/// HACK - Added these types to avoid importing district-analytics

export type Datasets = {
  shapes?: string;                     // A shapefile
  census?: string;                     // A total population Census dataset
  vap?: string;                        // A voting age (or citizen voting age) dataset
  election?: string;                   // An election dataset
}

export type RequirementsChecklist = {
  score: boolean;              // T.TriState;
  metrics: {
    complete: boolean;         // T.TriState;
    contiguous: boolean;       // T.TriState;
    freeOfHoles: boolean;      // T.TriState;
    equalPopulation: boolean;  // T.TriState;
  };
  details: {
    unassignedFeatures: string[];         // A possibly empty list of GEOIDs
    emptyDistricts: number[];             // A possibly empty list of district IDs
    discontiguousDistricts: number[];     // Ditto
    embeddedDistricts: number[];          // Ditto
    populationDeviation: number;          // A fraction [0.0 – 1.0] to represent as a %
    deviationThreshold: number;           // A fraction [0.0 – 1.0] to represent as a % 
  };
  datasets: Datasets;
  resources: {
    // stateReqs: string;
  };
};
// End HACKed types

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

/// DELETED ///

export type Dict = {[key: string]: any};

export type MetricItem = {
  label: string;
  abbr?: string;
  units?: Units;
  symbol?: string;
  description?: string;
  link?: string;
}

export type MetricsMetadata = {[key: string]: MetricItem};

export const Meta: MetricsMetadata = {
  // PROFILE INFO
  Vf: {label: "Vote share", abbr: "V", units: Units.Percentage, description: "Statewide D vote %"},

  // REQUIREMENTS
  requirementsTab: {label: "Requirements", description: "Redistricting maps must typically satisfy four constraints.", link: "https://medium.com/dra-2020/requirements-for-maps-aea2a4506f3b"},
  requirementsHeader: {label: "Check"},
  complete: {label: "Complete", description: "All precincts are assigned to districts"},
  contiguous: {label: "Contiguous", description: "All precincts in districts are connected"},
  freeOfHoles: {label: "Free of holes", description: "No districts are embedded in others"},
  equalPop: {label: "Equal population", description: "Districts have roughly equal populations"},
  meetsRequirements: {label: "meets basic requirements"},
  doesNotMeetRequirements: {label: "may not meet basic requirements"},
  // doesNotMeetRequirements: {label: "does not meet basic requirements"},

  // PARTISAN
  politicalTab: {label: "Advanced Metrics", description: "All else equal, prefer maps that have less partisan bias & more competitive districts.", link: "https://medium.com/dra-2020/advanced-measures-of-bias-responsiveness-c1bf182d29a9"},
  partisanHeader: {label: "Metric"},

  // Bias metrics
  biasTab: {label: "Proportionality", description: "All else equal, prefer maps that are more proportional.", link: "https://medium.com/dra-2020/proportionality-d7fece877810"},
  estS: {label: "Probable seats", abbr: "S_V", units: Units.Number, description: "The likely number of fractional Democratic seats"},
  estSf: {label: "Probable seat share", abbr: "S%", units: Units.Percentage, description: "The likely Democratic seat share"},
  bestS: {label: "Proportional seats", abbr: "^S", units: Units.Number, description: "Number of Democratic seats closest to proportional"},
  bestSf: {label: "Proportional seat share", abbr: "^S%", units: Units.Percentage, description: "Democratic seat share closest to proportional"},
  fptpS: {label: "FPTP seats", abbr: "S!", units: Units.Number, description: "Number of first-past-the-post Democratic seats"},

  // Responsiveness
  responsivenessTab: {label: "Responsiveness", description: "", link: null},
  
  bias: {label: "Disproportionality", abbr: "B%", units: Units.Percentage, description: "The deviation from the number of whole seats closest to proportional. "},
  biasScore: {label: "Partisan bias", abbr: "B$", units: Units.Integer, description: "Bias score normalized [0–100]"},

  // Additional bias metrics
  advanced: {label: "Advanced Measures of Bias & Responsiveness"},
  bS50: {label: "Seats bias", abbr: "BS_50", symbol: "\u{03B1}_S", units: Units.Percentage, description: "Half the difference in seats at 50% vote share", link: "http://lipid.phys.cmu.edu/nagle/2019NewPaper.pdf"},
  bV50: {label: "Votes bias", abbr: "BV_50", symbol: "\u{03B1}_V", units: Units.Percentage, description: "The excess votes required for half the seats", link: "http://lipid.phys.cmu.edu/nagle/2019NewPaper.pdf"},
  decl: {label: "Declination", abbr: "decl", symbol: "\u{03B4}", units: Units.Degrees, description: "A geometric measure of packing & cracking", link: "https://arxiv.org/abs/1803.04799"},
  gSym: {label: "Global symmetry", abbr: "GS", symbol: "\u{0393}", units: Units.Percentage, description: "The overall symmetry of the seats-votes curve"},
  gamma: {label: "Gamma", abbr: "g", symbol: "\u03B3", units: Units.Percentage, description: "The fair difference in seats at the map-wide vote share"},

  eG: {label: "Efficiency gap", abbr: "EG", units: Units.Percentage, description: "The relative two-party difference in wasted votes", link: "https://planscore.org/metrics/efficiencygap/"},
  bSV: {label: "Partisan bias", abbr: "BS_V", symbol: "\u{03D0}", units: Units.Percentage, description: "The difference in seats between the map-wide vote share and the symmetrical counterfactual share", link: "https://j.mp/2BkgYTP"},
  prop: {label: "Proportional", abbr: "prop", symbol: "\u{03B3}", units: Units.Percentage, description: "The simple deviation from proportionality using fractional seat shares"},
  tOf: {label: "Turnout bias", abbr: "TO", units: Units.Percentage, description: "The difference between the map-wide vote share and the average district share"},
  mM: {label: "Mean–median", abbr: "MM", units: Units.Percentage, description: "The average vote share across all districts minus the median vote share", link: "http://gerrymander.princeton.edu/info/"},
  lO: {label: "Lopsided outcomes", abbr: "LO", units: Units.Percentage, description: "The relative two-party difference in excess vote shares", link: "http://gerrymander.princeton.edu/info/"},

  // Impact metrics
  unearnedS: {label: "Impact", abbr: "UE", units: Units.Number, description: "The likely number of unexpected Democratic seats (won) lost"},
  impactScore: {label: "Impact score", abbr: "I$", units: Units.Integer, description: "Impact score normalized to [0–100]"},

  // Competitiveness/responsiveness metrics
  competitivenessTab: {label: "Competitiveness", description: "All else equal, prefer maps that are more competitive. ", link: "https://medium.com/dra-2020/competitiveness-1bcbe4e2d788"},
  cSimple: {label: "Simple competitive districts", abbr: "C", units: Units.Integer, description: "The number of districts in the range [45–55%]"},
  cD: {label: "Competitive districts", abbr: "Cd", units: Units.Number, description: "The likely number of competitive districts"},
  cDf: {label: "Competitiveness", abbr: "Cdf", units: Units.Percentage, description: "The percentage of competitive districts. "},

  mD: {label: "Competitive marginal districts", abbr: "Md", units: Units.Number, description: "The likely number of competitive marginal districts"},
  mDf: {label: "Competitive marginal districts share", abbr: "Mdf", units: Units.Percentage, description: "The likely competitive marginal district share"},

  competitivenessScore: {label: "Competitiveness", abbr: "C$", units: Units.Integer, description: "Competitiveness score normalized to [0–100]"},

  // Additional competitiveness/responsiveness metrics
  rD: {label: "Responsive districts", abbr: "Rd", units: Units.Number, description: "The likely number of responsive districts"},
  rDf: {label: "Responsive districts %", abbr: "Rd%", units: Units.Percentage, description: "The likely responsive district share"},
  bigR: {label: "Overall responsiveness", abbr: "R", /*, symbol: "\u{}", */ units: Units.Number, description: "The overall responsiveness (or winner’s bonus)"},
  littleR: {label: "Responsiveness", abbr: "r", symbol: "\u{03C1}", units: Units.Number, description: "The slope of the seats-votes curve at the map-wide vote share"},
  mIR: {label: "Minimal inverse responsiveness", abbr: "MIR", symbol: "\u{03B6}", units: Units.Number, description: "TBD: Describe minimal inverse responsiveness"},

  partisanScore: {label: "Weighted Score", abbr: "P$", units: Units.Integer, description: "Political representation score normalized to [0–100]"},
  // * <P$ [score] = the combined partisan score used to compare plans *across* states
  // * >P$ [score2] = the combined partisan score used to compare plans *within* a state, along with traditional districting principles


  // MINORITY
  minorityTab: {label: "Minority Representation", description: "All else equal, prefer maps that give minorities more opportunities to elect representatives. ", link: "https://medium.com/dra-2020/minority-rights-ed1f9992561d"},
  noMinorityTab: {label: "", description: "No minority group is populous enough overall to warrant an opportunity district."},
  minorityHeader: {label: "Metric"},
  minorityTableHeader: {label: "VAP"},
  minority: {label: "All minorities", description: "The number of districts where minority VAP falls in these ranges"},
  black: {label: "Black", description: "The number of districts where Black VAP falls in these ranges"},
  hispanic: {label: "Hispanic", description: "The number of districts where Hispanic VAP falls in these ranges"},
  pacific: {label: "Pacific", description: "The number of districts where Native Hawaiian and Pacific Islander VAP falls in these ranges"},
  asian: {label: "Asian", description: "The number of districts where Asian VAP falls in these ranges"},
  native: {label: "Native", description: "The number of districts where American Indian and Alaska Native VAP falls in these ranges"},
  nOpportunity: {label: "Opportunity districts", abbr: "Od", units: Units.Number, description: "The likely number of minority opportunity districts. "},
  opportunityPct: {label: "Opportunity districts", abbr: "Odf", units: Units.Percentage, description: "The percentage of what would be a proportional number of opportunity districts. "},
  coalitionPct: {label: "Coalition districts", abbr: "Cdf", units: Units.Percentage, description: "The percentage of what would be a proportional number of coalition districts. "},
  nProportional: {label: "Proportional minority districts", units: Units.Number, description: "The proportional number of minority districts"},
  minorityBonus: {label: "Minority bonus", abbr: "M$", units: Units.Integer, description: "Minority bonus normalized to [0–20]"},
  level1: {label: "37–50%"},
  level2: {label: ">50%"},
  averageDVf: {label: "The average Democratic win is", units: Units.Percentage, description: "Average vote share for Democratic wins"},
  minorityTableOpportunityHeader: {label: "# Opportunities"},
  minorityTablePackedHeader: {label: "# Packed"},


  // TRADITIONAL DISTRICTING PRINCIPLES

  compactnessTab: {label: "Compactness", description: "All else equal, prefer maps with districts that are more compact.", link: "https://medium.com/dra-2020/compactness-8e0ee3851126"},
  compactnessHeader: {label: "Compactness"},
  reockRaw: {label: "Reock", abbr: "Rc", units: Units.Fraction, description: "Measures how dispersed district shapes are. "},
  reockNormalized: {label: "Reock", abbr: "Rc$", units: Units.Integer, description: "Reock compactness normalized to [0–100]"},
  polsbyRaw: {label: "Polsby-Popper", abbr: "Pc", units: Units.Fraction, description: "Measures how indented district shapes are. "},
  polsbyNormalized: {label: "Polsby-Popper", abbr: "Pc$", units: Units.Integer, description: "Polsby-Popper compactness normalized to [0–100]"},
  compactnessScore: {label: "Compactness", abbr: "G$", units: Units.Integer, description: "Combined compactness normalized to [0–100]"},

  splittingTab: {label: "Splitting", description: "All else equal, prefer maps that split counties across districts the least.", link: "https://medium.com/dra-2020/county-splitting-7a3f295ec07f"},
  splittingHeader: {label: "County-District Splitting"},
  countySplittingRaw: {label: "County splitting", abbr: "Cs", units: Units.Number, description: "Measures how much single counties are split across multiple districts. "},
  countySplittingNormalized: {label: "County splitting", abbr: "Cs$", units: Units.Integer, description: "How much districts split counties normalized to [0–100]"},
  districtSplittingRaw: {label: "District splitting", abbr: "Ds", units: Units.Number, description: "Measures how much single districts are split across multiple counties. "},
  districtSplittingNormalized: {label: "District splitting", abbr: "Ds$", units: Units.Integer, description: "How much counties split districts normalized to [0–100]"},
  splittingScore: {label: "County splitting", abbr: "S$", units: Units.Integer, description: "Combined splitting normalized to [0–100]"},

  populationDeviationHeader: {label: "Equal Population"},
  populationDeviationRaw: {label: "Population deviation", abbr: "Eq", units: Units.Percentage, description: "The difference between the largest & smallest districts"},
  populationDeviationNormalized: {label: "Population deviation", abbr: "Eq$", description: "Population deviation normalized to [0–100]"},

  traditionalPrinciplesScore: {label: "Weighted Score", abbr: "T$", units: Units.Integer, description: "Combined traditional principles score normalized to [0–100]"},


  // OVERALL SCORE
  scoreTab: {label: "Summary", link: "https://medium.com/dra-2020/dashboard-63059fd226d3"},
  scoreHeader: {label: "Category"},
  score: {label: "Score"},
  politicalScore: {label: "Political Representation"},
  minorityScore: {label: "Minority rights"},
  traditionalScore: {label: "Traditional Districting Principles"},
  overallScore: {label: "Weighted Score", abbr: "$$$", units: Units.Integer, description: "Overall score normalized to [0–100]"},


  // MISC
  biggerIsBetter: {label: "Bigger", description: "Bigger is better. "},
  smallerIsBetter: {label: "Smaller", description: "Smaller is better. "},
  biasConvention: {label: "Bias convention", description: "By convention, positive values of bias metrics favor Republicans & negative values favor Democrats."},
  rating: {label: "Rating", description: "The raw value normalized to [0–100] where bigger is better."},

  metric: {label: "Metric"},
  raw: {label: "Raw"},
  normalized: {label: "Normalized", description: "Ratings normalize metrics to the range [0–100] with bigger being better."},
  description: {label: "Description"},
  notes: {label: "Notes"},
  datasetNote: {label: "This analysis is based on:"}
}

export const disclaimerText = 'Disclaimer: This analysis does not ensure Voting Rights Act (VRA) compliance!';

// STRINGS

type RatingMumble = {
  label: string;
  description: string;
}

type RatingsInfo = {[key: string]: RatingMumble};

// Ratings
export const Ratings: RatingsInfo = {
  unbiased: { label: "Proportionality", description: "N/A" },
  competitive: { label: "Competitiveness", description: "N/A" },
  equitable: { label: "Minority", description: "N/A" },
  compact: { label: "Compactness", description: "N/A" },
  cohesive: { label: "Splitting", description: "N/A" }
}

// Dimensions
export const enum Rating
{
  Proportionality,
  Competitiveness,
  MinorityRights,
  Compactness,
  Splitting
}

function getTextPosition(rating: number[], moveValue: number, bHidePartisanData: boolean): string[]
{
  // No partisan data; moveValue when to move because it's close to the edge of the diagram
  const textPosition: string[] = bHidePartisanData ?
  [
    (rating[0] < moveValue) ? "top right" : "top left",
    (rating[1] < moveValue) ? "top left" : "middle right",
    (rating[2] < moveValue) ? "bottom left" : "middle right",
    (rating[3] < moveValue) ? "top right" : "top left"
  ] :
  [
    (rating[0] < moveValue) ? "top right" : "top left",
    (rating[1] < moveValue) ? "top center" : "middle left",
    (rating[2] < moveValue) ? "top left" : "middle right",
    (rating[3] < moveValue) ? "bottom left" : "middle right",
    (rating[4] < moveValue) ? "bottom center" : "middle left",
    (rating[5] < moveValue) ? "top right" : "top left"
  ];

  return textPosition;
}

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

export function zeroOrNumber(n: number): string
{
  const bZero = ((n - 0.0) < 0.005) ? true : false;
  const rendered = bZero ? 'zero' : formatNumber(n, Units.Number);

  return rendered;
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

export function isArrayEmpty(a: any[]): boolean
{
  if (a === undefined || a.length == 0)
  {
    // array empty or does not exist
    return true;
  }
  else
  {
    return false;
  }
}

export function minArray(arr: number[]): number
{
  return Math.min(...arr);
}

export function maxArray(arr: number[]): number
{
  return Math.max(...arr);
}

export function describeArray(items: string[], one: string, two: string, more: string): string
{
  if (items.length > 2) return more;
  if (items.length == 2) return two;
  if (items.length == 1) return one;
  return '';
}

// A helper to format a list (array) of text entries for rendering, dealing with
// 1, 2, or more items and adding commas and an 'and' (or optionally 'or').
export function prepareListEntry(list: any[], bOr:boolean = false): string
{
  const nItems = list.length;
  let listStr: string = '';
  const conjunction = bOr ? ' or ' : ' and ';

  switch (nItems)
  {
    case 1: {
      listStr = list[0];
      break;
    }
    case 2: {
      listStr = list[0] + conjunction + list[1];
      break;
    }
    default: {
      if (list.length > 0)
      {
        const listWithCommas = list.join(', ');
        const lastItem = list[list.length - 1].toString();
        let lastCommaIndex = listWithCommas.length - (lastItem.length + 1);
        // let lastCommaIndex = listWithCommas.length - ((list[list.length - 1].length) + 1);
        let beforeAnd = listWithCommas.substr(0, lastCommaIndex);
        let afterAnd = listWithCommas.substr(lastCommaIndex + 1);
        listStr = beforeAnd + conjunction + afterAnd;
      }
      break;
    }
  }
  return listStr;
}

// Make election data statements read more naturally
export function prepareElectionsStatement(electionsInput: string): string | undefined
{
  let electionsUsed = undefined;

  if (electionsInput)
  {
    if (electionsInput.includes('and'))               // PVI
    {
      electionsUsed = 'composite of ' + electionsInput.slice('Composite of'.length);
    }
    else if (electionsInput.startsWith('Composite'))  // regular composite
    {
      const elections = electionsInput.slice('Composite of'.length).split(',').map((e: string) => e.trim());
      electionsUsed = 'composite of ' + prepareListEntry(elections);
    }
    else                                             // one election
    {
      electionsUsed = electionsInput;
    }
  }

  return electionsUsed;
}

export function initialCap(str: string): string
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function intInSentence(n: number): string
{
  return n && !isNaN(n) && n > 0 ? ((n > 9) ? n.toLocaleString('en-US') : numWords(n)) : 'zero';
}

/// DELETED ///


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

/// DELETED ///

export function requirementsRating(reqsChecklist: RequirementsChecklist, targetPopEqual: boolean): string
{
  const bChecksPass = requirementsPass(reqsChecklist, targetPopEqual);

  const ratingOneLiner: string = bChecksPass ? Meta.meetsRequirements.label : Meta.doesNotMeetRequirements.label;

  return ratingOneLiner;
}

function requirementsPass(reqsChecklist: RequirementsChecklist, targetPopEqual: boolean): boolean
{
  if (reqsChecklist != null)    // Could be null if !openView
  {
    if (!reqsChecklist.metrics.complete) return false;
    if (!reqsChecklist.metrics.contiguous) return false;
    if (!reqsChecklist.metrics.freeOfHoles) return false;
    if (targetPopEqual && !reqsChecklist.metrics.equalPopulation) return false;
  }

  return true;
}

/// DELETED /// 

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

export function renderNotes(classes: any, notes: any[], showBullet: boolean, notesLabel?: string): JSX.Element
{
  return (
    <Material.Table className={classNames(classes.notesTable)}>
      <Material.TableBody>
        <Material.TableRow>
          <Material.TableCell colSpan={2} className={classNames(classes.cellNoBorder, classes.font1rem, classes.cellPadding, classes.boldCell)}>
            {(notesLabel ? notesLabel : Meta.notes.label)}
          </Material.TableCell>
        </Material.TableRow>
        {notes.map(note => (typeof note) === 'string' ? notesDetailRowWrap(classes, note, showBullet) : notesDetailRow(classes, note, showBullet))}
      </Material.TableBody>
    </Material.Table>
  );
}

export function notesDetailRowWrap(classes: any, text: string, showBullet: boolean): JSX.Element
{
  const cell: JSX.Element = (
    <Material.TableCell className={classNames(classes.cellNoBorder, classes.font1rem, classes.cellPadding)}>
      {text}
    </Material.TableCell>);
  return notesDetailRow(classes, cell, showBullet);
}

export function notesDetailRow(classes: any, cell: JSX.Element, showBullet: boolean): JSX.Element
{
  return (
    <Material.TableRow>
      <Material.TableCell className={classNames(classes.notesCell)}>
        {showBullet ? (<Icons.FiberManualRecord className={classNames(classes.smallIconSize)} />) : null}
      </Material.TableCell>
      {cell}
    </Material.TableRow>
  );
}

export function renderIcon(classes: any, check: boolean, fontSize: any): JSX.Element
{
  return (
    check ? (<Icons.CheckCircle color={'primary'} className={classNames(classes.green)} fontSize={fontSize} />) :
    (<Icons.HighlightOffOutlined color={'primary'} className={classNames(classes.red)} fontSize={fontSize} />)
  );
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

export function renderFreestandingNote(classes: any, text: string): JSX.Element
{
  return (
    <Material.Typography variant='body1' style={{fontSize: '1rem', paddingTop: 16}}>
      {text}
    </Material.Typography>
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

export function renderMetricHeader(classes: any, labelColumn: string, valueColumn: string, descriptionColumn: string, widths?: number[]): JSX.Element
{
  return (
    <Material.TableRow>
      <Material.TableCell className={classNames(classes.cellThickBottomBorder, classes.cellPadding, classes.font1rem, classes.boldCell)}
                          style={{width: widths && widths.length > 0 ? widths[0] : 166}}>
        {labelColumn}
      </Material.TableCell>
      <Material.TableCell align='right' className={classNames(classes.cellThickBottomBorder, classes.cellPadding, classes.font1rem, classes.boldCell)}
                          style={{width: widths && widths.length > 1 ? widths[1] : 120}}>
        {valueColumn}
      </Material.TableCell>
      <Material.TableCell className={classNames(classes.cellThickBottomBorder, classes.cellPadding, classes.leftPaddingDescrip, classes.font1rem, classes.boldCell)}>
        {descriptionColumn}
      </Material.TableCell>
    </Material.TableRow>
  );
}

export function renderMetricRow(classes: any, label: string, metric: number | undefined, units: Units, description?: string, extraPadRight?: any): JSX.Element
{
  return (
    <Material.TableRow>
      <Material.TableCell className={classNames(classes.metricLabelCell, classes.font1rem)}>
        <Icons.FiberManualRecord className={classNames(classes.smallIconSize, classes.smallIconRightPadding)} />
        {label}
      </Material.TableCell>
      <Material.TableCell align='right' className={classNames(classes.metricValueCell, classes.font1rem, extraPadRight ? extraPadRight : '')}>
        {(metric !== undefined) ? formatNumber(metric, units) : 'N/A'}
        {(metric !== undefined) ? unitsSymbol(units): ''}
      </Material.TableCell>
      <Material.TableCell className={classNames(classes.metricDescripCell, classes.font1rem, classes.leftPaddingDescrip)}>
        {description ? description : null}
      </Material.TableCell>
    </Material.TableRow>
  );
}

export function renderBlankMetricRow(classes: any): JSX.Element
{
  // Need to force the height otherwise it's 0
  return (
    <Material.TableRow>
      <Material.TableCell className={classNames(classes.metricLabelCell, classes.font1rem)} style={{height: 20}}>
      </Material.TableCell>
      <Material.TableCell align='right' className={classNames(classes.metricValueCell, classes.font1rem)}>
      </Material.TableCell>
      <Material.TableCell className={classNames(classes.metricDescripCell, classes.font1rem, classes.leftPaddingDescrip)}>
      </Material.TableCell>
    </Material.TableRow>
  );
}

/// DELETED ///

