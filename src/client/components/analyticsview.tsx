//
// ANALYTICS
//

// Core react imports
import * as React from 'react';
declare var Plotly: any;

/* plotly.js configuration:

  dra/index.html includes script "https://cdn.plot.ly/plotly-1.54.1.min.js"
*/

// Material Imports
import * as Material from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

// Public utilities
import classNames from 'classnames';

// App libraries
import { Environment } from '../env';
import * as MA from './materialapp';
import * as AU from './anlzutil';
import * as ClientActions from '../clientactions';

// ... GENERAL ABOVE HERE ...

import { Partisan, Types, Utils } from '@dra2020/dra-analytics';

const numWords = require('num-words');


// ENUMS, META DATA, & FORMATTING HELPERS FOR ANALYTICS & SCORING UI

type RVGraphData = {
	rWinVfs: number[];
	rWinRanks: number[];
	rWinLabels: string[];
	dWinVfs: number[];
	dWinRanks: number[];
  dWinLabels: string[];
  minVf: number;
  maxVf: number;
}

const rvSectionHeader = "Rank-Votes Graph"
const biasSectionHeader = "Bias Measures";
const responsivenessSectionHeader = "Responsiveness Measures";
const svCurveSectionHeader = "Seats-Votes Curve";
// const compactnessSectionHeader = "Compactness Details";
// const splittingSectionHeader = "Community Splitting";
// const rpvSectionHeader = "Demographic Voting";

/// DELETED ///


// END OF ENUMS, META DATA, & FORMATTING HELPERS

// CONSTANTS for both diagrams

const bgcolor = MA.appBackgroundColor;
const red = '#ff0000';   // 'red';
const blue = '#0000ff';  // 'blue';

/// EDITED ///
// ************************************************************************
export interface AnalyticsViewProps
{
  xx: string;
  env: Environment,
  roles: { [role: string]: boolean },
  bHidePartisanData: boolean,
  openView: boolean,
  actions: ClientActions.ClientActions,
  designSize: MA.DW,

  // Added
  row: any,

  classes?: any,
  theme?: any,
}

function AnalyticsViewStyles(theme: any): any
{
  let styles: any = Object.assign({}, AU.Styles(theme));

  return (Object.assign(styles, {
    expandAdvSummary: {
      fontSize: '1.15rem',
      fontWeight: 500,
    },
    expandoRoot: {
      '&:before': {
        display: 'none',
      },
    },
    defaultBackgoundColor: {
      backgroundColor: theme.palette.background.default,
    },
    extraPaddingRightCompete: {
      paddingRight: 16,
    },
    extraPaddingRightAdv: {
      paddingRight: 12,
    },
    extraPaddingRightDecl: {
      paddingRight: 8,
    },
    compactCellPadding: {
      padding: 4,
    },
    pickerCellPadding: {
      padding: '0px 3px 0px 3px',
    },
    pickRPVTable: {
      position: 'relative',
      width: 400,
    },
    pickerLabel: {
      fontSize: '0.875rem',
      paddingRight: 6,
    },
    pickerRoot: {
      marginRight: 10,
      marginLeft: 10,
      marginTop: 2,
      marginBottom: 2,
      border: '1px solid black',
      fontSize: '0.875rem',
      verticalAlign: 'middle',
    },
  }));
}

/// DELETED ///

/// EDITED ///
interface AnalyticsViewState
{
  svLegendOn: boolean,
  svRCurveOn: boolean,
  svDirty: boolean,

  rvLegendOn: boolean,
  rvDirty: boolean,
}
  
class InternalAnalyticsView extends React.Component<AnalyticsViewProps, AnalyticsViewState>
{
  name: string = null;
  profile: any = null;
  scorecard: Types.PartisanScorecard = null;

  constructor(props: any)
  {
    super(props);

    /// EDITED ///
    this.state = {
      svLegendOn: true, svRCurveOn: true, svDirty: true,
      rvLegendOn: true, rvDirty: true
    };
  }

  /// EDITED ///
  componentDidMount(): void
  {
    const {openView, bHidePartisanData} = this.props;
    const {svLegendOn, svRCurveOn, rvLegendOn} = this.state;

    if (openView && this.profile && this.scorecard)
    {
      this.renderRankVoteDiagram(rvLegendOn);
      this.renderSVCurveDiagram(svLegendOn, svRCurveOn);
    }
  }

  /// EDITED ///
  componentDidUpdate(): void
  {
    const {openView, bHidePartisanData} = this.props;
    const {svLegendOn, svRCurveOn, rvLegendOn} = this.state;

    if (openView && this.profile && this.scorecard)
    {
      this.renderRankVoteDiagram(rvLegendOn);
      this.renderSVCurveDiagram(svLegendOn, svRCurveOn);
    }
  }

  /// EDITED ///
  render(): any
  {
    const {classes, actions, env, openView, designSize, row} = this.props;

    let links: {label: string, id: string}[] = [];
  
    links.push({label: rvSectionHeader, id: 'scorePanel'});
    links.push({label: svCurveSectionHeader, id: 'svcurvePanel'});
    links.push({label: 'Bias', id: 'biasPanel'});
    links.push({label: 'Responsiveness', id: 'responsivenessPanel'});

    // GET THE PARTISAN PROFILE & COMPUTE THE PARTISAN SCORECARD

    this.name = row.name.slice(0,-5);  // HACK - remove the '.json'

    this.profile = row.json;

    const bLog: boolean = true;
    const byDistrictVf: Types.VfArray = this.profile.byDistrict;
    const statewideVf: number = this.profile.statewide;

    this.scorecard = Partisan.makePartisanScorecard(statewideVf, byDistrictVf, bLog);

    // END

    const isMedPlus: boolean = designSize <= MA.DW.MEDIUMPLUS;
    const plotWidth: number = AU.plotWidth(designSize);
    const sideCtrlCellClasses: string = classNames(classes.cellNoBorder, isMedPlus ? classes.plotSideCtrlCellSmall : classes.plotSideCtrlCell);

    return (
      <Material.Paper className={classes.anlzPanelPaper} style={{display: openView ? 'inherit' : 'none'}}>
        {AU.renderNavLinkBar(classes, actions, MA.MAPVIEW_ANLZ, /* curModel, */ designSize, links,
                             'https://medium.com/dra-2020/advanced-880719407196', 'More information about plan Analytics')}
        <div className={classes.scrollContainer} style={{width: window.innerWidth}}>
          { this.renderScorePanel(plotWidth, sideCtrlCellClasses) }
          { this.renderSVCurvePanel(plotWidth, sideCtrlCellClasses) }
          { this.renderBiasPanel() }
          { this.renderResponsivenessPanel() }
        </div>
      </Material.Paper>
    );
  }

  /// EDITED ///
  backToTopId(): string
  {
    return 'scorePanel';
  }

  // ****************** S(V) Curve ****************  
  renderSVCurvePanel(plotWidth: number, sideCtrlCellClasses: string): JSX.Element
  {
    const { classes, designSize } = this.props;

    // NOTE: Put any text, description, notes here. Actual diagram generated in renderSVCurveDiagram()
    return (
      <div id='svcurvePanel' className={''} style={{textAlign: 'center', minWidth: AU.sectionPanelWidth(designSize)}}>
        {AU.renderPanelHeading(classes, svCurveSectionHeader, '', 'https://medium.com/dra-2020/s-v-curve-c87ce5f46fa4')}
        <Material.Table>
          <Material.TableBody>
            <Material.TableRow>
              <Material.TableCell align='center' className={classNames(classes.cellNoBorder)}>
                <Material.Card id='sv-curve' style={{width: plotWidth, margin: 'auto'}} raised></Material.Card>
              </Material.TableCell>
              <Material.TableCell align='left' className={sideCtrlCellClasses}>
                {this.renderSVSwitch()}
              </Material.TableCell>
            </Material.TableRow>
          </Material.TableBody>
        </Material.Table>

        {AU.renderBackToTop(classes, this.backToTopId())}
      </div>
    );
  }

  renderSVSwitch(): JSX.Element
  {
    const {classes, designSize} = this.props;
    const {svLegendOn, svRCurveOn} = this.state;

    const isMedPlus: boolean = designSize <= MA.DW.MEDIUMPLUS;

    return (
      <Material.FormGroup>
        <Material.FormControlLabel
          label='Show R Curve'
          classes={{root: classes.switchRoot, label: isMedPlus ? classes.switchLabelSmall : classes.switchLabel}}
          control={
            <Material.Switch
              checked={svRCurveOn}
              color='default'
              classes={{switchBase: classes.switchBase, checked: classes.checked, track: classes.track}}
              onChange={() => {
                this.setState({svRCurveOn: !svRCurveOn, svDirty: true});
              }}
            />} />
        <Material.FormControlLabel
          label='Show Legend'
          classes={{root: classes.switchRoot, label: isMedPlus ? classes.switchLabelSmall : classes.switchLabel}}
          control={
            <Material.Switch
              checked={svLegendOn}
              color='default'
              classes={{switchBase: classes.switchBase, checked: classes.checked, track: classes.track}}
              onChange={() => {
                this.setState({svLegendOn: !svLegendOn, svDirty: true});
              }}
            />} />
      </Material.FormGroup>
    );
  }

  /// EDITED ///
  renderSVCurveDiagram(bLegend: boolean, bRCurve: boolean): void
  {
    // Called only if openView, which guarantees profile and scorecard are not null
    const { designSize } = this.props;

    type SVpoint = {
      v: number;  // A fraction [0.0–1.0]
      s: number   // A fraction [0.0–1.0]
    };

    // NOTE - The variable names use Python naming conventions, because I cloned
    //   this code from my Python implementation.

    if (!document.getElementById('sv-curve') || !this.profile || !this.scorecard || !this.state.svDirty)
      return;

    // BIND DATA FROM PROFILE & SCORECARD

    const name = this.name;

    // Unzip the D S/V curve points into separate V and S arrays.
    const dSVpoints: SVpoint[] = this.scorecard.dSVpoints;
    const v_d: number[] = dSVpoints.map(pt => pt.v);
    const s_d: number[] = dSVpoints.map(pt => pt.s);

    const Bv = this.scorecard.bias.bV50 as number;
    const Bs = this.scorecard.bias.bS50 as number;

    const rSVpoints: SVpoint[] = this.scorecard.rSVpoints;
    const v_r: number[] = rSVpoints.map(pt => pt.v);
    const s_r: number[] = rSVpoints.map(pt => pt.s);

    const Vf: number = this.profile.statewide;
    const Sf: number = Vf - this.scorecard.bias.prop;

    // END BIND

    let svTraces = [];
    let svLayout = {};
    let svConfig = {};

    // Pre-zoom the graph in on the square region that encompasses:
    // * The center point of symmetry -- (0.5, 0.5)
    // * Proportionality at Vf -- (Vf, Sf)
    // * Seats bias -- (0.5, 0.5 - seats bias)
    // * Votes bias -- (0.5 + votes bias, 0.5)
    // * Extra credit: EG at Vf

    let x_range: number[] = [0.0, 1.0];
    let y_range: number[] = [0.0, 1.0];

    const sym: number = 0.5;
    const S_BS_50: number = 0.5 - this.scorecard.bias.bS50;  // More binding
    const V_BV_50: number = 0.5 + this.scorecard.bias.bV50;  // More binding
    const S_EG: number = 0.5 + (2.0 * (Vf - 0.5));

    const margin: number = 0.025;  // +/– 2.5%

    const lo_x: number = Math.min(sym, Vf, Sf, S_BS_50, V_BV_50, S_EG) - margin;
    const hi_x: number = Math.max(sym, Vf, Sf, S_BS_50, V_BV_50, S_EG) + margin;
    // const lo_x: number = (Vf > 0.5) ? (0.5 - margin) : (Math.min(Vf, Sf) - margin);
    // const hi_x: number = (Vf > 0.5) ? (Math.max(Vf, Sf) + margin) : (0.5 + margin);
    // const lo_x: number = 0.0;
    // const hi_x: number = 1.0;

    x_range = [lo_x, hi_x];
    y_range = x_range;

    // End pre-zoom

    // Make horizontal and vertical rules @ 0.50. And proportional rule.

    const r_x = [0.0, 0.5, 1.0];
    const r_y = [0.0, 0.5, 1.0];
    const r_s = [0.5, 0.5, 0.5];
    const r_v = [0.5, 0.5, 0.5];
    // The S=V line
    const prop_x = [0.0, 0.5, 1.0];
    // The EG=0 line
    const prop2_x = [0.25, 0.5, 0.75];
    const prop_y = [0.0, 0.5, 1.0];

    // "Local" region traces
    const shadedColor = 'whitesmoke';
    const local = 5 / 100;          // "Local" range = 5%
    const delta = local / 2;        // +/– Vf
  
    const vrVMinusTrace = {
      x: [Vf - delta, Vf - delta],
      y: [0.0, 1.0],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: shadedColor,
        width: 0.5
      },
      hoverinfo: 'none',
      showlegend: false
    };

    const vrVPlusTrace = {
      x: [Vf + delta, Vf + delta],
      y: [0.0, 1.0],
      fill: 'tonextx',
      fillcolor: shadedColor,
      type: 'scatter',
      name: 'Uncertainty',
      text: 'uncertainty',
      mode: 'lines',
      line: {
        color: shadedColor,
        width: 0.5
      },
      hoverinfo: 'none',
      showlegend: true
    };
  

    const hoverTemplate = 'Vote %: %{x:5.2%}, Seat %: %{y:5.2%}<extra></extra>';
    const d_sv_curve = {
      x: v_d,
      y: s_d,
      mode: 'lines',
      name: 'Democratic',
      marker: {
        color: blue,
        size: 5
      },
      hovertemplate: hoverTemplate,
      showlegend: (bRCurve) ? true : false
    }

    const halfPtHoverTemplate = 'Vote %: 50%, Seat %: 50%<extra></extra>';
    const half_pt_trace = {
      x: [0.5],
      y: [0.5],
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: 'black',
        symbol: 'circle',
        size: 8,
      },
      hoverinfo: 'text',
      hovertemplate: halfPtHoverTemplate,
      showlegend: false
    };

    const bvPtLabel = 'Votes bias: ' + AU.formatNumber(Bv, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
    const bvPtHoverTemplate = bvPtLabel + '<extra></extra>';
    const bvFormatted = AU.formatNumber(Bv, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
    const bv_pt_trace = {
      x: [Bv + 0.5],
      y: [0.5],
      mode: 'markers',
      type: 'scatter',
      name: 'Votes bias: ' + bvFormatted,
      marker: {
        color: 'black',
        symbol: 'diamond',
        size: 8,
      },
      hoverinfo: 'text',
      hovertemplate: bvPtHoverTemplate,
      showlegend: true
    };

    const bsPtLabel = 'Seats bias: ' + AU.formatNumber(Bs, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
    const bsPtHoverTemplate = bsPtLabel + '<extra></extra>';
    const bsFormatted = AU.formatNumber(Bs, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
    const bs_pt_trace = {
      x: [0.5],
      y: [0.5 - Bs],
      mode: 'markers',
      type: 'scatter',
      name: 'Seats bias: ' + bsFormatted,
      marker: {
        color: 'black',
        symbol: 'square',
        size: 8,
      },
      hoverinfo: 'text',
      hovertemplate: bsPtHoverTemplate,
      showlegend: true
    };

    const bv_ray = {
      x: [0.5, Bv + 0.5],
      y: [0.5, 0.5],
      mode: 'lines',
      line: {
        color: 'black',
        width: 1,
        dash: 'solid'
      },
      hoverinfo: 'none',
      showlegend: false
    }

    const bs_ray = {
      x: [0.5, 0.5],
      y: [0.5, 0.5 - Bs],
      mode: 'lines',
      line: {
        color: 'black',
        width: 1,
        dash: 'solid'
      },
      hoverinfo: 'none',
      showlegend: false
    }

    const r_sv_curve = {
      x: v_r,
      y: s_r,
      mode: 'lines',
      name: 'Republican',
      marker: {
        color: red,
        size: 5
      },
      hovertemplate: hoverTemplate,
      showlegend: true
    }

    const h_rule = {
      x: r_x,
      y: r_s,
      name: 'Seat % = 50%',
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'solid'     // 'dash'
      },
      hoverinfo: 'none',  // 'text',
      // hoveron: 'points',
      showlegend: false   // true
    }

    const v_rule = {
      x: r_v,
      y: r_y,
      name: 'Vote % = 50%',
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'solid'     // 'dot'
      },
      hoverinfo: 'none',  // 'text',
      // hoveron: 'points',
      showlegend: false   // true
    }

    const prop_rule = {
      x: prop_x,
      y: prop_y,
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'dot'
      },
      hoverinfo: 'none',
      showlegend: false
    }
    const prop2_rule = {
      x: prop2_x,
      y: prop_y,
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'dash'
      },
      hoverinfo: 'none',
      showlegend: false
    }

    const statewideVf = this.profile.statewide;
    const nPts = 20;
    const statewideVfXs = [...Array(nPts + 1).keys()].map(x => statewideVf);
    const ruleYs = [...Array(nPts + 1).keys()].map(y => ((100 / nPts) * y) / 100);
    const statewideVfWinHoverLabel = 'Total D vote: ' + AU.formatNumber(statewideVf, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
    const statewideVfTrace = {
      x: statewideVfXs,
      y: ruleYs,
      type: 'scatter',
      mode: 'lines',
      name: statewideVfWinHoverLabel,  //'Statewide D vote %',
      line: {
        color: 'black',
        width: 1,
        dash: 'dashdot'
      },
      text: statewideVfWinHoverLabel,
      hoverinfo: 'text',
      hoveron: 'points',
      showlegend: true
    };

    svTraces.push(vrVMinusTrace);
    svTraces.push(vrVPlusTrace);
    svTraces.push(prop2_rule);

    svTraces.push(h_rule);
    svTraces.push(v_rule);
    svTraces.push(prop_rule);
    svTraces.push(statewideVfTrace);
    svTraces.push(d_sv_curve);
    if (bRCurve)
      svTraces.push(r_sv_curve);
    svTraces.push(half_pt_trace);
    svTraces.push(bv_pt_trace);
    svTraces.push(bs_pt_trace);
    svTraces.push(bv_ray);
    svTraces.push(bs_ray);

    const svSize = AU.plotWidth(designSize) - 25;

    // Place the legend based on whether & where the plot is pre-zoomed
    // - If (Vf > 0.5) => lower right
    // - If (Vf < 0.5) => upper left
    // - x,y units are normalized, not Vf, Sf

    const tab = 0.02;  // 2% indent margin
    const x_anchor = (Vf > 0.5) ? 'right' : 'left';
    const y_anchor = (Vf > 0.5) ?  'bottom' : 'top';
    const x_pos = (Vf > 0.5) ? 1 - tab : 0 + tab;
    const y_pos = (Vf > 0.5) ? 0 + tab : 1 - tab;

    svLayout = {
      title: 'Seats-Votes Curve: ' + name,
      width: svSize,
      height: svSize,
      xaxis: {
        title: "Vote %",
        range: x_range,
        // rangemode: 'nonnegative',  // Experimented w/ this to keep axis positive
        tickmode: 'linear',
        ticks: 'outside',
        tick0: 0.0,
        dtick: 0.1,
        tickformat: '%{x:5.2%}'
      },
      yaxis: {
        title: "Seat %",
        range: y_range,
        // rangemode: 'nonnegative',  // Experimented w/ this to keep axis positive
        scaleanchor: 'x',
        scaleratio: 1,
        tickmode: 'linear',
        ticks: 'outside',
        tick0: 0.0,
        dtick: 0.1,
        tickformat: '%{y:5.2%}'
      },
      dragmode: 'zoom',
      hovermode: 'closest',
      showlegend: bLegend,
      legend: {
        xanchor: x_anchor,
        yanchor: y_anchor,
        x: x_pos,
        y: y_pos,
        // x: 0.60,
        // y: 0.01,
        bordercolor: 'black',
        borderwidth: 1
      },
      paper_bgcolor: bgcolor,
      plot_bgcolor: bgcolor
    }

    // Configure hover menu options & behavior

    svConfig = {
      toImageButtonOptions: {
        format: 'png', // one of png, svg, jpeg, webp
        filename: 's(v)-curve'
      },
      // Remove the unwanted plotly hover commands. Let users pan & zoom.
      modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      // modeBarButtonsToRemove: ['zoom2d', /* 'select2d', */ 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      scrollZoom: true,
      displayModeBar: true,
      displaylogo: false,
      responsive: true
    };

    var svDiv = document.getElementById('sv-curve');

    Plotly.react(svDiv, svTraces, svLayout, svConfig);
    this.setState({svDirty: false});
  }

  /// EDITED ///
  // *********** Bias ****************
  renderBiasPanel(): any
  {
    // Called only if openView, which guarantees scorecard is not null
    const { classes, designSize, /* curModel, */ env, roles } = this.props;
    // const { analyticsWrapper } = curModel.derivedProps;
    // const { datasource } = curModel.dataContext;

    // BIND the metrics to the partisan scorecard 
    // Advanced analytics: All of these will have been computed
    const seatsBias50 = this.scorecard.bias.bS50 as number;
    const votesBias50 = this.scorecard.bias.bV50 as number;
    const declination = this.scorecard.bias.decl;
    const globalSymmetry = this.scorecard.bias.gSym as number;
    const gamma = this.scorecard.bias.gamma as number;

    const efficiencyGap = this.scorecard.bias.eG as number;
    const seatsBiasV = this.scorecard.bias.bSV as number;
    const prop = this.scorecard.bias.prop as number;
    const meanMedian = this.scorecard.bias.mMd as number;
    const turnoutBias = this.scorecard.bias.tOf as number;
    const lopsidedOutcomes = this.scorecard.bias.lO;
  
    // EXPERIMENTAL
    // const lProp = this.scorecard.details['lProp'];
    // const lUE = this.scorecard.details['lUE'];
    // const bExperimental = roles.experimental;

    // Political geography
  
    /// DELETED ///

    // const anlzSession = analyticsWrapper.analyticsSession;
    // const reqs = anlzSession.getRequirementsChecklist(false);

    // HACK - Hardcoded this ...
    const reqs: AU.RequirementsChecklist = {
      score: true,
      metrics: {
        complete: true,
        contiguous: true,
        freeOfHoles: true,
        equalPopulation: true
      },
      details: {
        unassignedFeatures: [] as string[],
        emptyDistricts: [] as number[],
        discontiguousDistricts: [] as number[],
        embeddedDistricts: [] as number[],
        populationDeviation: 0,
        deviationThreshold: 0.75,
      },
      datasets: {
        shapes: 'shapes',
        census: 'census',
        vap: 'vap',
        election: 'election'
      },
      resources: {
        // stateReqs: string;
      }
    };

    const bComplete = reqs.metrics.complete;
    // const is2020: boolean = datasource === '2020_VD';
    // const bEnablePG: boolean = bComplete && is2020;

    // Notes

    let notes: any[] = [];
    notes.push(AU.Meta.biasConvention.description);

    // let planScoreButton: JSX.Element = (
    //   <Material.Button
    //     className={classNames(classes.pickerRoot)}
    //     onClick={() => this.handlePlanScore()}
    //   >
    //     <Material.Typography className={classes.font875}>PlanScore</Material.Typography>
    //   </Material.Button>
    // );

    // const planscoreNotice: JSX.Element = (
    //   <Material.TableCell className={classNames(classes.cellNoBorder, classes.font1rem, classes.cellPadding)}>
    //     {'Use '}
    //     <Material.Link href='https://planscore.org' target='_blank' rel='noopener'>
    //       {'PlanScore'}
    //     </Material.Link>
    //     {' to further assess the degree to which a map is gerrymandered.'}
    //     {/*<Material.Link href='https://medium.com/dra-2020/how-to-planscore-43771ec3d729' target='_blank' rel='noopener'>
    //       {'here'}
    //     </Material.Link>*/}
    //     {planScoreButton}
    //   </Material.TableCell>
    // );
    // notes.push(planscoreNotice);

    // if (bEnablePG && pg.showNote)
    // {
    //   notes.push(`The fractional Democratic seats & boundary bias implied by precinct political geography are ${A.trim(pg.precinctPG, 2)} and ${AU.formatPercent(boundaryBiasAlt, 2)}.`);
    //   // notes.push(`The fractional Democratic seats implied by ${pgUnitsAlt} political geography is ${A.trim(pgSeatsAlt, 2)}. `);
    // }

    const advancedBiasIntro = 'These are some prominent measures of partisan bias.';

    return (
      <div id='biasPanel' style={{minWidth: AU.sectionPanelWidth(designSize)}}>
        {AU.renderPanelHeading(classes, biasSectionHeader, advancedBiasIntro, 'https://medium.com/dra-2020/advanced-measures-of-bias-responsiveness-c1bf182d29a9')}
        <Material.Table className={classNames(classes.scoringTable)}>
          <Material.TableBody>
            {AU.renderMetricHeader(classes, AU.Meta.metric.label, '', AU.Meta.description.label, [190, 60])}
            {AU.renderMetricRow(classes, AU.Meta.bS50.label, seatsBias50, AU.Meta.bS50.units as AU.Units, AU.Meta.bS50.description)}
            {AU.renderMetricRow(classes, AU.Meta.bV50.label, votesBias50, AU.Meta.bV50.units as AU.Units, AU.Meta.bV50.description)}
            {AU.renderMetricRow(classes, AU.Meta.decl.label, declination, AU.Meta.decl.units as AU.Units, AU.Meta.decl.description, classes.extraPaddingRightDecl)}
            {AU.renderMetricRow(classes, AU.Meta.gSym.label, globalSymmetry, AU.Meta.gSym.units as AU.Units, AU.Meta.gSym.description)}
            {AU.renderMetricRow(classes, AU.Meta.gamma.label, gamma, AU.Meta.gamma.units as AU.Units, AU.Meta.gamma.description)}

            {AU.renderBlankMetricRow(classes)}

            {AU.renderMetricRow(classes, AU.Meta.eG.label, efficiencyGap, AU.Meta.eG.units as AU.Units, AU.Meta.eG.description)}
            {AU.renderMetricRow(classes, AU.Meta.bSV.label, seatsBiasV, AU.Meta.bSV.units as AU.Units, AU.Meta.bSV.description)}
            {AU.renderMetricRow(classes, AU.Meta.prop.label, prop, AU.Meta.prop.units as AU.Units, AU.Meta.prop.description)}
            {AU.renderMetricRow(classes, AU.Meta.mM.label, meanMedian, AU.Meta.mM.units as AU.Units, AU.Meta.mM.description)}
            {AU.renderMetricRow(classes, AU.Meta.tOf.label, turnoutBias, AU.Meta.tOf.units as AU.Units, AU.Meta.tOf.description)}
            {AU.renderMetricRow(classes, AU.Meta.lO.label, lopsidedOutcomes, AU.Meta.lO.units as AU.Units, AU.Meta.lO.description)}

            {/* DELETED */}
            {/* Added experimental metrics */}
            {/* {bExperimental ? AU.renderBlankMetricRow(classes) : null} */}
            {/* {bExperimental ? AU.renderMetricRow(classes, '[Local Prop\']', lProp, AU.Meta.prop.units as AU.Units, "*** EXPERIMENTAL ***") : null} */}
            {/* {bExperimental ? AU.renderMetricRow(classes, '[Local UE]', lUE, AU.Meta.unearnedS.units as AU.Units, "*** EXPERIMENTAL ***") : null} */}

            {/* DELETED political geography metrics */}
          </Material.TableBody>
        </Material.Table>

        {AU.renderNotes(classes, notes, true)}

        {AU.renderBackToTop(classes, this.backToTopId())}
      </div>
    );
  }
  
  // ***************** Responsiveness **********************
  renderResponsivenessPanel(): JSX.Element
  {
    // Called only if openView, which guarantees scorecard is not null
    const { classes, designSize } = this.props;

    /// EDITED ///
    // Advanced analytics: All of these will have been computed
    const responsiveDistricts = this.scorecard.responsiveness.rD;
    const responsiveness = this.scorecard.responsiveness.littleR;
    const overallResponsiveness = this.scorecard.responsiveness.bigR;
    // const minimalInverseResponsiveness = this.scorecard.partisan.responsiveness.mIR;

    // let notes: string[] = [];

    const advancedResponsivenessIntro = 'These are some prominent measures of responsiveness.';

    return (
      <div id='responsivenessPanel' style={{minWidth: AU.sectionPanelWidth(designSize)}}>
        {AU.renderPanelHeading(classes, responsivenessSectionHeader, advancedResponsivenessIntro, 'https://medium.com/dra-2020/advanced-measures-of-bias-responsiveness-c1bf182d29a9')}
        <Material.Table className={classNames(classes.scoringTable)}>
          <Material.TableBody>
            {AU.renderMetricHeader(classes, AU.Meta.metric.label, '', AU.Meta.description.label, [190, 60])}
            {AU.renderMetricRow(classes, AU.Meta.littleR.label, responsiveness, AU.Meta.littleR.units as AU.Units, AU.Meta.littleR.description)}
            {AU.renderMetricRow(classes, AU.Meta.rD.label, responsiveDistricts, AU.Meta.rD.units as AU.Units, AU.Meta.rD.description)}
            {AU.renderMetricRow(classes, AU.Meta.bigR.label, overallResponsiveness, AU.Meta.bigR.units as AU.Units, AU.Meta.bigR.description)}
            {/* {AU.renderMetricRow(classes, AU.Meta.mIR.label, minimalInverseResponsiveness, AU.Meta.mIR.units as AU.Units, AU.Meta.mIR.description)} */}
          </Material.TableBody>
        </Material.Table>

        {/*AU.renderNotes(classes, notes)*/}

        {AU.renderBackToTop(classes, this.backToTopId())}
      </div>
    );
  }

  /// EDITED to bind to partisan profile & scorecard ///
  renderRankVoteDiagram(bLegend: boolean): void
  {
    // Called only if openView, which guarantees profile and scorecard are set
    if (!document.getElementById('rank-vote-graph') || !this.profile || !this.scorecard || !this.state.rvDirty)
      return;

    const name = this.name;

    // DATA - RANK-VOTE DIAGRAM
    let rvTraces = [];
    let rvLayout = {};
    let rvConfig = {};
    {
      // Resources for future reference:
      // * https://plotly.com/javascript/reference/
      // * https://plotly.com/javascript/plotlyjs-function-reference/

      // Parameters
      const diagramWidth = AU.plotWidth(this.props.designSize);
      const shadedColor = 'beige';  // #F5F5DC
      const delta = 5 / 100;        // COMPETITIVE - Relaxed range = 0.5 +/– 0.05

      // Traces for R wins & D wins points

      // Set district marker size between 1–12 px, based on the # of districts
      const N = this.profile.byDistrict.length;
      const W = diagramWidth * (2 / 3);
      const markerSize = Math.min(Math.max(1, Math.round(W / N)), 12);

      const { rWinVfs, rWinRanks, rWinLabels, dWinVfs, dWinRanks, dWinLabels, minVf, maxVf } = this.extractRVGraphData();

      const districtHoverTemplate = 'District %{text}<br>%{y:5.2%}<extra></extra>';
      const repWinTrace = {
        x: rWinRanks,
        y: rWinVfs,
        mode: 'markers',
        type: 'scatter',
        text: rWinLabels,
        marker: {
          color: red,
          symbol: 'square',
          size: markerSize
        },
        hovertemplate: districtHoverTemplate,
        showlegend: false
      };

      const demWinTrace = {
        x: dWinRanks,
        y: dWinVfs,
        mode: 'markers',
        type: 'scatter',
        text: dWinLabels,
        marker: {
          color: blue,
          symbol: 'square',
          size: markerSize
        },
        hovertemplate: districtHoverTemplate,
        showlegend: false
      };

      // Traces for the "competitive" region

      const hr50PlusTrace = {
        x: [0.0, 1.0],
        y: [0.5 + delta, 0.5 + delta],
        fill: 'tonexty',
        fillcolor: shadedColor,
        type: 'scatter',
        name: 'Competitive range',
        text: 'competitive',
        mode: 'lines',
        line: {
          color: shadedColor,
          width: 0.5
        },
        hoverinfo: 'none',
        showlegend: true
      };

      const hr50Trace = {
        x: [0.0, 1.0],
        y: [0.5, 0.5],
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'black',
          width: 1
        },
        hoverinfo: 'none',
        showlegend: false
      };

      const hr50MinusTrace = {
        x: [0.0, 1.0],
        y: [0.5 - delta, 0.5 - delta],
        type: 'scatter',
        mode: 'lines',
        line: {
          color: shadedColor,
          width: 0.5
        },
        hoverinfo: 'none',
        showlegend: false
      };
      
      // Traces for statewide vote share and average D & R win percentages

      const nPts = 20;
      const ruleXs = [...Array(nPts + 1).keys()].map(x => ((100 / nPts) * x) / 100);

      /// EDITED ///
      const statewideVf = this.profile.statewide;
      const avgDWin = this.scorecard.averageDVf;
      const avgRWin = this.scorecard.averageRVf;
      const invertedAvgRWin = 1.0 - avgRWin;

      const statewideVfYs = [...Array(nPts + 1).keys()].map(x => statewideVf);
      const statewideVfWinHoverLabel = 'Total D vote: ' + AU.formatNumber(statewideVf, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
      const statewideVfTrace = {
        x: ruleXs,
        y: statewideVfYs,
        type: 'scatter',
        mode: 'lines',
        name: statewideVfWinHoverLabel,  // 'Statewide D vote %',
        line: {
          color: 'black',
          width: 1,
          dash: 'dashdot'
        },
        text: statewideVfWinHoverLabel,
        hoverinfo: 'text',
        hoveron: 'points',
        showlegend: true
      };

      const vrRuleHeight = 0.10;
      const invertedPRSfXs = [(1.0 - statewideVf), (1.0 - statewideVf)];
      const prSfYs = [statewideVf - vrRuleHeight, statewideVf + vrRuleHeight];
      const proportionalSfTrace = {
        x: invertedPRSfXs,
        y: prSfYs,
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'black',
          width: 1,
          dash: 'dashdot'
        },
        hoverinfo: 'none',
        showlegend: false
      };

      const avgDWinYs = [...Array(nPts + 1).keys()].map(x => avgDWin);
      const avgDWinHoverLabel = 'Average D win: ' + AU.formatNumber(avgDWin, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
      const avgDWinTrace = {
        x: ruleXs,
        y: avgDWinYs,
        type: 'scatter',
        mode: 'lines',
        name: avgDWinHoverLabel, // 'Average D win %',
        line: {
          color: blue,
          width: 0.5,
          dash: 'dot'
        },
        text: avgDWinHoverLabel,
        hoverinfo: 'text',
        hoveron: 'points',
        showlegend: true
      };

      const avgRWinYs = [...Array(nPts + 1).keys()].map(x => avgRWin);
      const avgRWinHoverLabel = 'Average R win: ' + AU.formatNumber(invertedAvgRWin, AU.Units.Percentage) + AU.unitsSymbol(AU.Units.Percentage);
      const avgRWinTrace = {
        x: ruleXs,
        y: avgRWinYs,
        type: 'scatter',
        mode: 'lines',
        name: avgRWinHoverLabel,  // 'Average R win %',
        line: {
          color: red,
          width: 0.5,
          dash: 'dot'
        },
        text: avgRWinHoverLabel,
        hoverinfo: 'text',
        hoveron: 'points',
        showlegend: true
      };

      // NOTE - The order is important!
      rvTraces.push(hr50MinusTrace);
      rvTraces.push(hr50PlusTrace);
      rvTraces.push(hr50Trace);
      rvTraces.push(proportionalSfTrace);
      rvTraces.push(statewideVfTrace);
      if (avgDWin)
        rvTraces.push(avgDWinTrace);
      if (avgRWin)
        rvTraces.push(avgRWinTrace);
      if (rWinVfs.length > 0)
        rvTraces.push(repWinTrace);
      if (dWinVfs.length > 0)
        rvTraces.push(demWinTrace);

      // If declination is defined, add traces for the R points & line, the D points
      // & lines, and the extension of the R line.
      const decl = this.scorecard.bias.decl;
      if (decl)
      {
        const X = 0; const Y = 1;

        const { Sb, Ra, Rb, Va, Vb } = this.scorecard.bias.rvPoints;

        // Convert R vote shares (used in dra-score for 'decl') to D vote shares
        const rDeclPt = [(1 - Ra), (1 - Va)];
        const dDeclPt = [(1 - Rb), (1 - Vb)];
        const pivotDeclPt = [(1 - Sb), 0.5];

        // Make traces for the R & D line segments and the pivot point

        const rDeclXs = [rDeclPt[X], pivotDeclPt[X]];
        const rDeclYs = [rDeclPt[Y], pivotDeclPt[Y]];
        const dDeclXs = [pivotDeclPt[X], dDeclPt[X]];
        const dDeclYs = [pivotDeclPt[Y], dDeclPt[Y]];
        const pivotDeclXs = [pivotDeclPt[X]];
        const pivotDeclYs = [pivotDeclPt[Y]];

        const rDeclTrace = {
          x: rDeclXs,
          y: rDeclYs,
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'black',
            width: 1
          },
          hoverinfo: 'none',
          showlegend: false
        };
        rvTraces.push(rDeclTrace);

        const dDeclTrace = {
          x: dDeclXs,
          y: dDeclYs,
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'black',
            width: 1
          },
          hoverinfo: 'none',
          showlegend: false
        };
        rvTraces.push(dDeclTrace);

        const pivotPtLabel = AU.formatNumber(decl, AU.Meta.decl.units) + AU.unitsSymbol(AU.Meta.decl.units);
        const pivotPtHoverTemplate = pivotPtLabel + '<extra></extra>';
        const pivotPtTrace = {
          x: pivotDeclXs,
          y: pivotDeclYs,
          mode: 'markers',
          type: 'scatter',
          name: 'Declination: ' + pivotPtLabel,
          marker: {
            color: 'white',
            symbol: 'circle',
            size: 10,
            line: {
              color: 'black',
              width: 2
            }
          },
          hovertemplate: pivotPtHoverTemplate,
          showlegend: true
        };

        // Make the dotted line extension of the R trace, if decl is significant
        const declThreshold = 5;  // degrees

        if (Math.abs(decl) > declThreshold) 
        {
          const rDy = (pivotDeclPt[Y] - rDeclPt[Y]);
          const rDx = (pivotDeclPt[X] - rDeclPt[X]);
          const dDy = (dDeclPt[Y] - pivotDeclPt[Y]);
          const dDx = (dDeclPt[X] - pivotDeclPt[X]);

          const slope = rDy / rDx;

          const dDistance = distance([pivotDeclPt[X], pivotDeclPt[Y]], [dDeclPt[X], dDeclPt[Y]]);
          const rDistance = distance([rDeclPt[X], rDeclPt[Y]], [pivotDeclPt[X], pivotDeclPt[Y]]);
          const ratio = dDistance / rDistance;

          const beyondPt = [
            pivotDeclPt[X] + (ratio * rDx),
            pivotDeclPt[Y] + (ratio * rDy)
          ];

          const beyondDeclXs = [pivotDeclPt[X], beyondPt[X]];
          const beyondDeclYs = [pivotDeclPt[Y], beyondPt[Y]];

          const dottedDeclTrace = {
            x: beyondDeclXs,
            y: beyondDeclYs,
            mode: 'lines',
            type: 'scatter',
            line: {
              color: 'black',
              width: 1,
              dash: 'dash'
            },
            hoverinfo: 'none',
            showlegend: false
          };
          rvTraces.push(dottedDeclTrace);
        }

        // Add the pivot point *after* a potential dotted line, so that it's on "top"
        rvTraces.push(pivotPtTrace);
      }

      // The r(v) plot layout

      const rankRange = [0.0, 1.0];
      const vfRange = [
        Math.max(minVf - 0.025, 0.0),
        Math.min(maxVf + 0.025, 1.0)
      ];

      const heightPct = (vfRange[1] - vfRange[0]);
      const diagramHeight = ((heightPct * diagramWidth) > 450) ? 700 : 450;

      const X = 0;
      const Y = 1;
      const lowerRight = [0.67, 0];
      const upperLeft = [0.02, 0.85];
      let legendPosition = upperLeft;
      if (decl)
      {
        if (decl < 0) legendPosition = lowerRight;
      }
      else  // 'decl' undefined
      {
        // If there are 5 or more districts and 'decl' is undefined, then the 
        // result was/is a sweep for one party or the other.
        const bSweep = (N >= 5) ? true : false;

        if ((!bSweep) && (rWinRanks.length > dWinRanks.length)) legendPosition = lowerRight;
      }
      // const legendPosition = (dWinRanks.length > rWinRanks.length) ? lowerRight : upperLeft;

      rvLayout = {
        title: 'Rank-Votes Graph: ' + name,
        // autosize: true,        // Explored setting this to 'true'
        width: diagramWidth,
        height: diagramHeight,
        xaxis: {
          title: 'District',
          range: rankRange,       // Explored removing this
          // domain: [0.0, 1.0],  // Explored adding this instead
          showgrid: false,
          zeroline: false,
          // fixedrange: true,    // Removed this, zoom maintains aspect ratio
          showticklabels: false
        },
        yaxis: {
          title: "D Vote %",
          range: vfRange,
          scaleanchor: 'x',       // Explored removing this
          scaleratio: 1,          // Explored removing this
          // constrain: "range",  // Explored adding this
          // automargin: true,    // Explored adding this
          showgrid: true,
          zeroline: false,
          tickformat: '%{y:5.2%}'
        },
        dragmode: 'zoom',
        hovermode: 'closest',
        showlegend: bLegend,
        legend: {
          x: legendPosition[X],
          y: legendPosition[Y],
          // traceorder="normal",
          // font=dict(
          //     family="sans-serif",
          //     size=12,
          //     color="black"
          // ),
          // bgcolor="LightSteelBlue",
          bordercolor: 'black',
          borderwidth: 1
        },
        paper_bgcolor: bgcolor,
        plot_bgcolor: bgcolor
      };

      // Configure hover menu options & behavior

      rvConfig = {
        toImageButtonOptions: {
          format: 'png', // one of png, svg, jpeg, webp
          filename: 'r(v)-graph'
        },
        // Remove the unwanted plotly hover commands. Let users pan & zoom.
        modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        scrollZoom: true,         // Helps w/ lots of districts
        displayModeBar: true,     // Always show the download icon
        displaylogo: false,
        responsive: true
      };
      Plotly.newPlot('rank-vote-graph', rvTraces, rvLayout, rvConfig);
      this.setState({rvDirty: false});
    }
  }

  // *********** née Score; now "above the fold" summary ****************
  renderScorePanel(plotWidth: number, sideCtrlCellClasses: string): any
  {
    const {classes, roles, designSize} = this.props;

    /// DELETED ///

    return (
      <div id='scorePanel' style={{textAlign: 'center', minWidth: AU.sectionPanelWidth(designSize)}}>
        {AU.renderPanelHeading(classes, rvSectionHeader, '', 'https://medium.com/dra-2020/r-v-graph-ecfadbfea666', false)}
        <Material.Table>
          <Material.TableBody>
            <Material.TableRow>
              <Material.TableCell align='center' className={classNames(classes.cellNoBorder)}>
                {/* NOTE - You have to specify a width to center the div, but 800 => 700  */}
                <Material.Card id='rank-vote-graph' style={{width: plotWidth, margin: 'auto'}} raised></Material.Card>
              </Material.TableCell>
              <Material.TableCell align='left' className={sideCtrlCellClasses}>
                {this.renderRVSwitch()}
              </Material.TableCell>
            </Material.TableRow>
          </Material.TableBody>
        </Material.Table>

      {/* DELETED */}

      </div>
    )
  }

  renderRVSwitch(): JSX.Element
  {
    const {classes, designSize} = this.props;
    const {rvLegendOn} = this.state;

    const isMedPlus: boolean = designSize <= MA.DW.MEDIUMPLUS;

    return (
      <Material.FormGroup row>
        <Material.FormControlLabel
          label='Show Legend'
          classes={{root: classes.switchRoot, label: isMedPlus ? classes.switchLabelSmall : classes.switchLabel}}
          control={
            <Material.Switch
              checked={rvLegendOn}
              color='default'
              classes={{switchBase: classes.switchBase, checked: classes.checked, track: classes.track}}
              onChange={() => {
                this.setState({rvLegendOn: !rvLegendOn, rvDirty: true});
              }}
            />} />
      </Material.FormGroup>
    );
  }

  /// EDITED - to bind to the partisan profile ///
  // From the *unsorted* array of D vote shares by district, extract the data needed
  // to plot the district points in an r(v) graph.
  extractRVGraphData(): RVGraphData
  {
    // Called only if openView, which guarantees profile is not null
    // const {curModel} = this.props;
    // const {redistrict} = curModel;
    
    const N: number = this.profile.byDistrict.length;
    // const N: number = this.profile.nDistricts;
    // For use in constructing district labels
    // const XX: string = this.profile.state;
    // const bLD: boolean = this.profile.bStateLeg;

    // Step 1 - Get the unsorted vote shares by district index
    const unsortedVfArray = this.profile.byDistrict;

    const minVf = Math.min(...unsortedVfArray);
    const maxVf = Math.max(...unsortedVfArray);

    // Step 2 - Convert the unsorted VfArray into an array of [Vf, (district) index] pairs.
    let idVfpairs = unsortedVfArray.map((item: any, index: any) => [item, index + 1]);
    const Vf = 0;  // Index into [Vf, (district) index] pair
    const Id = 1;  // Ditto

    // Step 3 - Sort the pairs in ascending order of vote share.
    idVfpairs.sort((a: number[], b: number[]) => a[Vf] - b[Vf]);

    // Step 4 - Unzip that into separate sorted Vf and sorted districtId arrays.
    const sortedVfArray = idVfpairs.map((pair: any) => pair[Vf]);
    const sortedIndexes = idVfpairs.map((pair: any) => pair[Id]);

    // Step 5 - Create a sorted array of district labels
    const sortedLabels: string[] = sortedIndexes.map((i: any) => i.toLocaleString());

    // const districtProps: Redistrict.DistrictPropArray = redistrict.safeDistrictProps();
    // const sortedLabels = sortedIndexes.map(id => AU.getDistrictLabel(districtProps, id));
    // NOTE - The old FiveThirtyEight-style template for district labels
    // const size = (bLD) ? 3 : 2;
    // const sortedLabels = sortedIndexes.map(id => XX + '-' + pad(id, size));

    // Step 6 - Create an array of district ranks that correspond to the 1–N ordering.
    const districtRanks = Array.from(Array(N)).map((e, i) => i + 1).map(i => rank(i, N));

    // Step 7 - Split the sorted Vf, rank, and label arrays into R and D subsets.
    const nRWins = sortedVfArray.filter((x: any) => x <= 0.5).length;  // Ties credited to R's

    const rWinVfs: number[] = sortedVfArray.slice(0, nRWins);
    const rWinRanks: number[] = districtRanks.slice(0, nRWins);
    const rWinLabels: string[] = sortedLabels.slice(0, nRWins);

    const dWinVfs: number[] = sortedVfArray.slice(nRWins);
    const dWinRanks: number[] = districtRanks.slice(nRWins);
    const dWinLabels: string[] = sortedLabels.slice(nRWins);

    const data: RVGraphData = {
      rWinVfs: rWinVfs,
      rWinRanks: rWinRanks,
      rWinLabels: rWinLabels,
      dWinVfs: dWinVfs,
      dWinRanks: dWinRanks,
      dWinLabels: dWinLabels,
      minVf: minVf,
      maxVf: maxVf
    };
    
    return data;
  }

  /// DELETED ///

}

/// DELETED ///

function rank(i: number, n: number): number
{
  return (i - 0.5) / n;
}

function distance(pt1: number[], pt2: number[]): number
{
  const X = 0;
  const Y = 1;

  const d: number = Math.sqrt(((pt2[X] - pt1[X]) ** 2) + ((pt2[Y] - pt1[Y]) ** 2));

  return d;
}

/// DELETED ///

let StyledAnalyticsView: any = withStyles(AnalyticsViewStyles, { withTheme: true })(InternalAnalyticsView);
export const AnalyticsView: new () => React.Component<AnalyticsViewProps, {}> = StyledAnalyticsView;
