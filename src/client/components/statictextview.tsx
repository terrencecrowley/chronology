// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles';

// Public utilities
import classNames = require('classnames');

// Core OT
import { OT } from '@dra2020/baseclient';

// App libraries
import * as MA from './materialapp';
import * as ClientActions from '../clientactions';

export interface StaticTextViewProps
{
  text: ClientActions.TextContainer,

  classes?: any,
  theme?: any,
}

export interface StaticTextViewState
{
  openedExpansion: string,
}

function StaticTextViewStyles(theme: any): any
{
  let styles: any = Object.assign({}, MA.AppStyles(theme));

  return (Object.assign(styles, {
    root: {
      minWidth: 720,
    },
    denseTable: {
      width: 0,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    denseRow: {
      height: 20,
    },
    denseCell: {
      paddingTop: 2,
      paddingBottom: 2,
      paddingLeft: 4,
      paddingRight: 4,
      fontSize: theme.typography.body2.fontSize,
      fontFamily: theme.typography.body2.fontFamily,
      margin: 0,
      textAlign: 'right',
    },
    expandPanelDetails: {
      display: 'block',
      paddingLeft: 8,
      paddingRight: 8,
      paddingBottom: 0,
    },
    expandPanelSummary: {
      backgroundColor: styles.tableHeadColor.backgroundColor,
      padding: '0px 12px 0px 12px',
      minHeight: 32,
      height: 32,
      '&$expanded': {
        minHeight: 32,
        height: 32,
        //padding: '2px 2px 2px 2px',
        backgroundColor: styles.tableHeadColor.backgroundColor,
      },
    },
    expandedContent: {
      '&$expanded': {
        marginBottom: 0,
        marginTop: 0,
      },
    },
    expandIcon: {
      paddingLeft: 4,
    },
    expanded: {},
    textPadding: {
      padding: 4,
    },
    divContainer: {
      //overflowY: 'auto',
      //height: 'calc(100vh - 50px)',
      //marginTop: 2,
    },
  }));
}

class InternalStaticTextView extends React.Component<StaticTextViewProps, StaticTextViewState>
{
  index: number = 0;    // running index into text.data

  constructor(props: any)
  {
    super(props);

    this.state = {openedExpansion: null};
  }

  render(): any
  {
    const {classes, text} = this.props;

    if (!text || !text.data)
      return (<Material.Typography>Content pending...</Material.Typography>);
    else
    {
      this.index = 0;
      return (
        <div className={classes.divContainer}>
          {this.renderBlock(null)}
        </div>);
    }
  }

  renderBlock(beginText: string): any
  {
    const {classes, text} = this.props;
    const {openedExpansion} = this.state;

    let rows: any[] = [];
    for (;this.index < text.data.length;this.index++)
    {
      let block: ClientActions.TextBlock = text.data[this.index];
      let style: any = block.variant; // Could do translation to Typography variants here

      if (style === 'beginExpansion')
      {
        this.index += 1;
        rows.push(this.renderBlock(block.text));
      }
      else if (style === 'endExpansion')
      {
        return (
          <Material.Accordion
            expanded={openedExpansion === beginText}
            onChange={() => this.setState({openedExpansion: openedExpansion === beginText ? null : beginText})}
          >
            <Material.AccordionSummary
              expandIcon={<Icons.ExpandMore />}
              classes={{
                root: classes.expandPanelSummary,
                content: classes.expandedContent,
                expandIcon: classes.expandIcon,
                expanded: classes.expanded,
              }}
            >
              <Material.Typography variant='subtitle1'>
                {beginText}
              </Material.Typography>
            </Material.AccordionSummary>
            <Material.AccordionDetails className={classes.expandPanelDetails}>
              {rows}
            </Material.AccordionDetails>
          </Material.Accordion>);
      }
      else if (style === 'beginTable')
      {
        this.index += 1;
        rows.push(this.renderBlock(null));
      }
      else if (style === 'endTable')
      {
        return (
          <Material.Table key={String(this.index - 1)} className={classes.denseTable}>
            <Material.TableBody>
              {rows}
            </Material.TableBody>
          </Material.Table>);
      }
      else if (style === 'row')
      {
        let cells: any[] = [];
        if (block.cells && block.cells.length > 0)
        {
          block.cells.forEach(cell => cells.push(
            <Material.TableCell className={classes.denseCell}>
              {cell}
            </Material.TableCell>));
        }
        rows.push(<Material.TableRow key={String(this.index)} className={classes.denseRow}>{cells}</Material.TableRow>);
      }
      else if (style === 'link')
      {
        rows.push(<Material.Typography key={String(this.index)} paragraph={true} variant={'body2'}>
          {block.text ? block.text + ' ' : ''}
          <a href={block.link} target='_blank' rel='help'>{block.label}</a>
        </Material.Typography>);
      }
      else if (style === 'indentBody')
      {
        rows.push(<ul><Material.Typography key={String(this.index)} paragraph={true} variant={'body2'}>
          {this.processText(block.text)}
        </Material.Typography></ul>);
      }
      else
      {
        rows.push(<Material.Typography key={String(this.index)} paragraph={true} variant={style}
                                       className={beginText ? '' : classes.textPadding}>
          {this.processText(block.text)}
        </Material.Typography>);
      }
    }

    return (<div>{rows}</div>)
  }

  processText(text: string): any
  {
    let parts: any[] = [];
    let spans: any[] = [];
    let i: number = 0;
    while (text.length > 0)
    {
      let indexB = text.indexOf('<b>');
      let indexI = text.indexOf('<i ');
      if (-1 != indexB && (indexI == -1 || indexI > indexB))
      {
        parts.push(text.substring(0, indexB));
        text = text.substring(indexB + 3);
        if (-1 != text.indexOf('</b>'))
        {
          parts.push(<b>{text.substring(0, text.indexOf('</b>'))}</b>);
          text = text.substring(text.indexOf('</b>') + 4);
        }
        else
        {       // error: expected to find </b> 
          parts.push(text);
          text = '';
        }
      }
      else if (-1 != indexI)
      {
        parts.push(text.substring(0, indexI));
        text = text.substring(indexI + 3);
        if (-1 != text.indexOf('>'))
        {
          const icon: string = text.substring(0, text.indexOf('>'))
          parts.push(this.getIcon(icon));
          text = text.substring(text.indexOf('>') + 1);
        }
        else
        {       // error: expected to find > 
          parts.push(text);
          text = '';
        }
      }
      else
      {
        parts.push(text);
        text = '';
      }
    }

    spans.push(<span>{parts}</span>);
    return spans;
  }

  getIcon(icon: string): any
  {
    switch (icon)
    {
      case 'pan': return <Icons.PanTool fontSize='small'  style={{transform: 'translateY(1px)'}}/>;
      case 'brush': return <Icons.Brush fontSize='small' style={{transform: 'translateY(3px)'}}/>;
      case 'erase': return <span className="iconify" data-icon="bx:bxs-eraser" data-inline="false"
                                 data-width="1.75em" data-height="1.75em" style={{transform: 'translateY(5px)'}} />;
      case 'stats': return <span className="iconify" data-icon="icomoon-free:table" data-inline="false"
                                 data-width="1.25em" data-height="1.25em" style={{transform: 'translateY(3px)'}} />;
      case 'analyze': return <Icons.TrackChanges fontSize='small' style={{transform: 'translateY(3px)'}}/>;
      case 'advanced': return <img src='/analytics-icon.png' style={{width: 16, height: 16, transform: 'translateY(3px)'}}/>;
      case 'search': return <Icons.Search fontSize='small' style={{transform: 'translateY(3px)'}}/>;
      case 'radio': return <Icons.RadioButtonCheckedOutlined fontSize='small' color='secondary' style={{transform: 'translateY(3px)'}}/>;
      case 'lock': return <Icons.LockOpen fontSize='small' style={{transform: 'translateY(3px)'}}/>;
      case 'settings': return <Icons.Settings fontSize='small' style={{transform: 'translateY(3px)'}} />;
      case 'arrowdropdown': return <Icons.ArrowDropDown fontSize='small' style={{transform: 'translateY(3px)'}} />;
      default: return null;
    }
  }
}

let StyledStaticTextView: any = withStyles(StaticTextViewStyles, {withTheme: true})(InternalStaticTextView);
export const StaticTextView: new () => React.Component<StaticTextViewProps, StaticTextViewState> = StyledStaticTextView;
