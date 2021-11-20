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
// import { MapModel } from '../mapmodel';
import * as MA from './materialapp';
import * as AU from './anlzutil';
import * as ClientActions from '../clientactions';

// ... GENERAL ABOVE HERE ...

// import * as A from '@dra2020/district-analytics';

import { Partisan, Types, Utils } from '@dra2020/dra-analytics';

// import sample from './sample-profile.json';
// const sample = require('./sample-profile.json');


// ENUMS, META DATA, & FORMATTING HELPERS FOR ANALYTICS & SCORING UI

const svCurveSectionHeader = "Seats-Votes Curve";


// END OF ENUMS, META DATA, & FORMATTING HELPERS

// CONSTANTS for both diagrams

const bgcolor = MA.appBackgroundColor;
const red = '#ff0000';   // 'red';
const blue = '#0000ff';  // 'blue';

// ************************************************************************
export interface AnalyticsViewProps
{
  xx: string;
  // curModel: MapModel,
  env: Environment,
  roles: { [role: string]: boolean },
  bHidePartisanData: boolean,
  openView: boolean,
  actions: ClientActions.ClientActions,
  designSize: MA.DW,
  // vaptype: MA.VAPTYPE,

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


interface AnalyticsViewState
{
  svLegendOn: boolean,
  svRCurveOn: boolean,
  svDirty: boolean,
}
  
class InternalAnalyticsView extends React.Component<AnalyticsViewProps, AnalyticsViewState>
{
  // profile: A.Profile = null;          // Populate these when openView
  // scorecard: A.Scorecard = null;

  name: string = null;
  profile: any = null;
  scorecard: Types.PartisanScorecard = null;

  constructor(props: any)
  {
    super(props);

    this.state = {
      svLegendOn: true, svRCurveOn: true, svDirty: true,
    };
  }

  componentDidMount(): void
  {
    const {openView, bHidePartisanData} = this.props;
    const {svLegendOn, svRCurveOn } = this.state;

    if (openView && this.profile && this.scorecard)
    {
      this.renderSVCurveDiagram(svLegendOn, svRCurveOn);
    }
  }

  componentDidUpdate(): void
  {
    const {openView, bHidePartisanData} = this.props;
    const {svLegendOn, svRCurveOn} = this.state;

    if (openView && this.profile && this.scorecard)
    {
      this.renderSVCurveDiagram(svLegendOn, svRCurveOn);
    }
  }

  render(): any
  {
    const {classes, actions, env, openView, /* curModel, */ designSize, /* bHidePartisanData, */ row} = this.props;
    // const {analyticsWrapper} = curModel.derivedProps;

    let links: {label: string, id: string}[] = [];
  
    links.push({label: svCurveSectionHeader, id: 'svcurvePanel'});

    // if (openView)
    // {
    //   const bLog: boolean = true;

    //   analyticsWrapper.analyzePlan(bLog);
    //   if (!analyticsWrapper.analyzeResult)
    //     return analyticsWrapper.analyticsErrorMessage;

    //   const anlzSession = analyticsWrapper.analyticsSession;
    //   // TODO - Bind profile & scorecard
    //   this.profile = anlzSession.getPlanProfile(false);
    //   this.scorecard = anlzSession.getPlanScorecard(false);
    // }
    
    // this.profile = anlzSession.getPlanProfile(false);
    // this.scorecard = anlzSession.getPlanScorecard(false);

    // GET THE PARTISAN PROFILE & COMPUTE THE PARTISAN SCORECARD

    this.name = row.name;
    // this.name = 'SAMPLE';   // HACK - Wire this up to the file name

    this.profile = row.json;
    // this.profile = sample;  // HACK - Wire this up to the selected profile

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
          { this.renderSVCurvePanel(plotWidth, sideCtrlCellClasses) }
        </div>
      </Material.Paper>
    );
  }

  backToTopId(): string
  {
    return 'svcurvePanel';
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

    // Pre-zoom the graph in on the region bounded by (0.5, 0.5) and (Vf, Sf)

    const Vf: number = this.profile.statewide;
    const Sf: number = Vf - this.scorecard.bias.prop;

    // END BIND

    let svTraces = [];
    let svLayout = {};
    let svConfig = {};

    // Set x-axis & y-axis (full)
    let x_range: number[] = [0.0, 1.0];
    let y_range: number[] = [0.0, 1.0];

    const margin: number = 0.05;  // +/– 5%

    const lo_x: number = (Vf > 0.5) ? (0.5 - margin) : (Math.min(Vf, Sf) - margin);
    const hi_x: number = (Vf > 0.5) ? (Math.max(Vf, Sf) + margin) : (0.5 + margin);
    // const lo_x: number = 0.0;
    // const hi_x: number = 1.0;

    x_range = [lo_x, hi_x];
    y_range = x_range;

    // end pre-zoom

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

}


let StyledAnalyticsView: any = withStyles(AnalyticsViewStyles, { withTheme: true })(InternalAnalyticsView);
export const AnalyticsView: new () => React.Component<AnalyticsViewProps, {}> = StyledAnalyticsView;
