// Core react imports
import * as React from 'react';

// Material Imports
import * as Material from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import {withStyles} from '@material-ui/core/styles';

// Extended Material Import
import * as RV from 'react-virtualized';

// Public utilities
import classNames = require('classnames');

// Core OT
import { OT, Util } from '@dra2020/baseclient';

// App libraries
import * as ClientActions from '../clientactions';
import * as MA from './materialapp';

export type Ordering = 'ASC' | 'DESC';

export type FieldType =
    'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'image'
  | 'shortstring'
  | 'icon'
  | 'popover'
  | 'check'
  | 'button'
  | 'midstring';

function textToFlex(align: string): string
{
  switch (align)
  {
    default:
    case 'left': return 'flex-start';
    case 'right': return 'flex-end';
    case 'center': return 'center';
  }
}

export interface ColumnHead
{
  id: string,
  idList?: string[];
  fieldType: FieldType,
  disablePadding: boolean,
  label: string,
  labelList?: string[];
  labelAll?: string;
}

export interface IconData
{
  name: string,
  tooltip: string,
  selected: boolean,
}

export type ColumnList = ColumnHead[];

export type RowData = any;
export type RowList = RowData[];
export type Sorter = (rows: RowList, orderBy: string, ordering: Ordering) => RowList;

export interface Selection
{
  length: number,
  test: (id: string) => boolean,
  indeterminate: (id: string) => boolean,
  asString: () => string,
}

export interface TableViewProps
{
  actions: ClientActions.ClientActions,
  selection: Selection,
  columns: ColumnHead[],
  rows: RowList,
  sorter: Sorter,
  orderBy: string,
  ordering: Ordering,
  outerHeight?: string,
  rowHeight?: number,
  disableHeader?: boolean,
  showCheck: boolean,
  scrollToSelection?: boolean,
  designSize?: MA.DW,
  renderPopover?: (id: string, name: string) => JSX.Element,

  classes?: any,
  theme?: any,
}

export interface TableViewState
{
  elMenuOn?: any,
  elPopoverOn?: any,
  idPopover?: string,
  namePopover?: string,
  menuColumn?: ColumnHead,
}

function badDate(s: string): boolean
{
  return s == null || s == '' || s == 'unknown';
}

function isNarrow(designSize: MA.DW): boolean
{
  return designSize != undefined && designSize <= MA.DW.NARROWPLUS;
}

export function TableViewSorter(rows: RowList, columns: ColumnList, orderBy: string, ordering: Ordering): RowList
{
  if (orderBy == '') return rows;
  let col: ColumnHead = null;
  for (let i: number = 0; i < columns.length; i++)
    if (columns[i].id === orderBy)
    {
      col = columns[i];
      break;
    }
  if (col == null) return rows;

  // Just sort in place
  //rows = rows.slice();

  rows.sort((r1: RowData, r2: RowData) =>
  {
    let ret: number = 0;
    let s1: string = String(r1[orderBy]);
    let s2: string = String(r2[orderBy]);
    switch (col.fieldType)
    {
      case 'string':
      case 'shortstring':
      case 'midstring':
      case 'boolean':
      case 'check':
      case 'button':
        // caseless..
        s1 = s1.trim().toUpperCase();
        s2 = s2.trim().toUpperCase();
        if (s1 < s2)
          ret = -1;
        else if (s2 < s1)
          ret = 1;
        break;

      case 'icon':
      case 'popover':
      case 'image':
        break;

      case 'date':
        {
          if (badDate(s1))
            ret = -1;
          else if (badDate(s2))
            ret = 1;
          else
          {
            let d1 = new Date(s1);
            let d2 = new Date(s2);
            if (d1.getTime() < d2.getTime())
              ret = -1;
            else if (d2.getTime() < d1.getTime())
              ret = 1;
          }
        }
        break;

      case 'number':
        {
          let n1 = Number(s1);
          let n2 = Number(s2);
          if (isNaN(n1) || n1 < n2)
            ret = -1;
          else if (isNaN(n2) || n2 < n1)
            ret = 1;
        }
        break;
    }

    if (ordering === 'DESC')
      ret = -ret;
    return ret;
  });

  return rows;
}

const TableRowHeight: number = 48;
const TableNormalHeight = 'calc(100vh - 100px)';
const TableDialogHeight = 'calc(100vh - 200px)';

function TableViewStyles(theme: any): any
{
  return ({
    root: {
      minWidth: 720,
    },
    virtualTable: {
      outline: 'none',  // suppress focus outline
    },
    virtualGrid: {
      outline: 'none',  // suppress focus outline
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
    },
    cellAll: {
      display: 'flex', // RV
      alignItems: 'center', // RV
      boxSizing: 'border-box', // RV
      fontSize: theme.typography.body2.fontSize,
      fontFamily: theme.typography.body2.fontFamily,
      verticalAlign: 'middle',
      margin: 0,
      padding: '2px 10px 2px 10px',
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0',
    },
    cellTight: {
      display: 'flex', // RV
      alignItems: 'center', // RV
      boxSizing: 'border-box', // RV
      fontSize: theme.typography.body2.fontSize,
      fontFamily: theme.typography.body2.fontFamily,
      verticalAlign: 'middle',
      margin: 0,
      padding: '2px 0px 2px 0px',
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0',
    },
    cellBody: {
      display: 'flex',
      verticalAlign: 'middle',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
    },
    cellBodyWrap: {
      display: 'flex',
      verticalAlign: 'middle',
      //textOverflow: 'ellipsis',
      //whiteSpace: 'nowrap',
      width: '100%',
    },
    cellLast: {
      paddingRight: '2px',
    },
    rowAll: {
      display: 'flex',
      flexDirection: 'row',
    },
    tableHeading: {
      backgroundColor: '#d5dbdb',
      borderLeft: '1px solid #f0f0f0',
      borderRight: '1px solid #f0f0f0',
      '&:first-child': {
        borderLeft: '0px',
      },
      '&:last-child': {
        borderRight: '0px',
      },
      fontSize: theme.typography.body1.fontSize,
      fontFamily: theme.typography.body1.fontFamily,
      verticalAlign: 'middle',
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
      outline: 'none',  // suppress focus outline
      padding: '2px 10px 2px 10px',
      textOverflow: 'hidden',
    },
    tableWrapper: {
      overflowX: 'hidden',
      overflowY: 'hidden',
      width: '100%',
    },
    tableMain: {
      minWidth: 520,
    },
    tableSortLabel: {
    },
    iconSet: {
      fontSize: 'small',
    },
    iconSetUnordered: {
      fontSize: 'small',
      visibility: 'hidden',
    },
    iconUnset: {
      fontSize: 'small',
      visibility: 'hidden',
    },
    iconUnselected: {
      backgroundColor: 'transparent',
      borderRadius: '5px',
    },
    iconSelected: {
      backgroundColor: '#DDDDDD',
      borderRadius: '5px',
    },
    iconHover: {
      '&:hover': {
        backgroundColor: '#EEEEEE',
        borderRadius: '5px',
      },
    },
  });
}

class InternalTableView extends React.Component<TableViewProps, TableViewState>
{
  alreadyScrolled: boolean;

  constructor(props: any)
  {
    super(props);
    this.onHeaderClick = this.onHeaderClick.bind(this);
    this.isCellSelected = this.isCellSelected.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    //this.onCellDoubleClick = this.onCellDoubleClick.bind(this);
    this.checkboxCellRenderer = this.checkboxCellRenderer.bind(this);
    this.iconCellRenderer = this.iconCellRenderer.bind(this);
    this.popoverCellRenderer = this.popoverCellRenderer.bind(this);
    this.boolCellRenderer = this.boolCellRenderer.bind(this);
    this.checkCellRenderer = this.checkCellRenderer.bind(this);
    this.buttonCellRenderer = this.buttonCellRenderer.bind(this);
    this.vtRowGetter = this.vtRowGetter.bind(this);
    this.vtCellRenderer = this.vtCellRenderer.bind(this);
    this.vtCheckboxHeaderRenderer = this.vtCheckboxHeaderRenderer.bind(this);
    this.vtHeaderRenderer = this.vtHeaderRenderer.bind(this);
    this.vtRowClick = this.vtRowClick.bind(this);
    this.vtRowDoubleClick = this.vtRowDoubleClick.bind(this);
    this.vtHeaderClick = this.vtHeaderClick.bind(this);
    this.stringCellRenderer = this.stringCellRenderer.bind(this);
    this.renderColumnMenu = this.renderColumnMenu.bind(this);
    this.state = { elMenuOn: null, menuColumn: null, elPopoverOn: null, idPopover: null, namePopover: null };
  }

  componentDidMount(): void
  {
    // Only do this once
    this.alreadyScrolled = true;
  }

  checkboxCellRenderer(rowData: any, rowIndex: number): any
  {
    const {selection, designSize} = this.props;
    const id = rowData.id;

    return (<Material.Checkbox
      checked={selection.test(id)}
      indeterminate={selection.indeterminate(id)}
      style={{padding: isNarrow(designSize) ? 2 : ''}}
    />);
  }

  dateCellRenderer(rowData: any, key: string): any
  {
    let dateStr: string = Util.relativeDate(new Date(rowData[key])).replace('Today at ', '');

    return ( <span> {dateStr} </span> );
  }

  boolCellRenderer(rowData: any, key: string): any
  {
    const {classes} = this.props;

    if (rowData[key])
    {
      if (rowData[`${key}_tooltip`])
        return ( <Material.Tooltip title={MA.getTooltip(rowData[`${key}_tooltip`])}>
                  <Icons.CheckCircle color={'primary'} className={classes.green} fontSize={'small'} />
                 </Material.Tooltip> );
      else
        return ( <Icons.CheckCircle color={'primary'} className={classes.green} fontSize={'small'} /> );
    }
    else
      return ( <span></span> );
  }

  checkCellRenderer(rowData: any, key: string): any
  {
    const {classes} = this.props;
    const val = rowData[key];

    return (<Material.Checkbox
      checked={!!val}
      indeterminate={val === null}
      style={{padding: 2}}
    />);
  }

  buttonCellRenderer(rowData: any, key: string): any
  {
    const {classes} = this.props;
    const val = rowData[key];

    return (<Material.Button size='small' variant='outlined' style={{padding: 2}}>
              {val}
            </Material.Button>);
  }

  iconCellRenderer(rowData: any, key: string): any
  {
    const {classes, actions} = this.props;

    let icon: any;
    let iconData: IconData = rowData[key];
    switch (iconData.name)
    {
      case 'Add':
        icon = <Icons.Add />
        break;
      case 'Share':
        icon = <Icons.Share />
        break;
      case 'Edit':
        icon = <Icons.Edit />
        break;
      case 'BorderColor':
        //icon = <Icons.BorderColor />
        icon = <Icons.Create />
        break;
      case 'FormatColorFill':
        //icon = <Icons.FormatColorFill />
        icon = <span className="iconify" data-icon="bx:bxs-color-fill" data-inline="false" data-width="1.7em" data-height="1.7em" style={{transform: 'translateY(2px)'}}></span>
        break;
      case 'TextFormat':
        //icon = <Icons.TextFormat />
        icon = <span className="iconify" data-icon="mdi:format-color-text" data-inline="false" data-width="1.7em" data-height="1.7em" style={{transform: 'translateY(4px)'}}></span>
        break;
      case 'Landmark':
        icon = <span className="iconify" data-icon="mdi:map-marker" data-inline="false" data-width="1.7em" data-height="1.7em" style={{transform: 'translateY(4px)'}}></span>
        break;
      case 'Clear':
        icon = <Icons.Clear />
        break;
      default:
        icon = <Icons.DeviceUnknown />
        break;
    }

    return (
      <Material.Tooltip title={MA.getTooltip(iconData.tooltip)}>
        <div className={classNames(iconData.selected ? classes.iconSelected : classes.iconUnselected, classes.iconHover)}>
          {icon}
        </div>
      </Material.Tooltip>
      );
  }

  popoverCellRenderer(rowData: any, key: string): any
  {
    const {classes, actions} = this.props;
    const {idPopover} = this.state;

    let icon: any;
    let iconData: IconData = rowData[key];
    switch (iconData.name)
    {
      case 'Add':
        icon = <Icons.Add />
        break;
      case 'Share':
        icon = <Icons.Share />
        break;
      case 'Edit':
        icon = <Icons.Edit />
        break;
      case 'BorderColor':
        icon = <Icons.Create />
        break;
      case 'FormatColorFill':
        icon = <span className="iconify" data-icon="bx:bxs-color-fill" data-inline="false" data-width="1.7em" data-height="1.7em" style={{transform: 'translateY(2px)'}}></span>
        break;
      case 'TextFormat':
        icon = <span className="iconify" data-icon="mdi:format-color-text" data-inline="false" data-width="1.7em" data-height="1.7em" style={{transform: 'translateY(4px)'}}></span>
        break;
      case 'Landmark':
        icon = <span className="iconify" data-icon="mdi:map-marker" data-inline="false" data-width="1.7em" data-height="1.7em" style={{transform: 'translateY(4px)'}}></span>
        break;
      case 'Clear':
        icon = <Icons.Clear />
        break;
      default:
        icon = <Icons.DeviceUnknown />
        break;
    }

    return (
      <Material.Tooltip title={MA.getTooltip(iconData.tooltip)}>
        <div id={`tvpopover-${rowData.id}`} className={classNames(rowData.id === idPopover ? classes.iconSelected : classes.iconUnselected, classes.iconHover)}>
          <span style={{whiteSpace: 'nowrap'}}>{icon}<Icons.KeyboardArrowRight /></span>
        </div>
      </Material.Tooltip>
      );
  }

  imageCellRenderer(rowData: any, key: string): any
  {
    if (rowData[key] && rowData[key] != '')
      return ( <img height={TableRowHeight - 4} src={rowData[key]} alt='Map preview'/> );
    else
      return ( <span></span> );
  }

  stringCellRenderer(rowData: any, key: string): any
  {
    const {classes} = this.props;

    let contents = ( <span>{rowData[key] ? String(rowData[key]) : ''}</span> );
    let tooltip = rowData[`${key}_tooltip`];
    if (tooltip)
    {
      return (
           <Material.Tooltip title={MA.getTooltip(tooltip)}>
            {contents}
           </Material.Tooltip>
           );
    }
    else
      return contents;
  }

  onHeaderClick(column: any): void
  {
    let {actions, columns, ordering, orderBy} = this.props;

    const id = column.id;

    if (id === 'id')
      this.onHeaderSelectionClick();
    else
    {
      let col = columns.find(c => c.id === id);
      if (col && col.fieldType === 'image') return;
      if (col && col.idList)
      {
        let state: TableViewState = {};
        state.elMenuOn = document.getElementById(`tvheader-${id}`);
        state.menuColumn = col;
        this.setState(state);
      }
      else
      {
        if (orderBy === id)
          ordering = ordering === 'ASC' ? 'DESC' : 'ASC';
        else
          ordering = 'ASC';
        orderBy = id;

        actions.fire(ClientActions.TableSort, {ordering: ordering, orderBy: orderBy});
      }
    }
  }

  renderColumnMenu(): JSX.Element
  {
    const { classes, actions, ordering, orderBy } = this.props;
    const { elMenuOn, menuColumn } = this.state;

    if (menuColumn === null) return null;
    let iconUnset = <Icons.ArrowDownward className={classes.iconUnset} />;
    let iconSet: any;
    if (orderBy === menuColumn.id)
      iconSet = ordering === 'DESC' ? <Icons.ArrowDownward className={classes.iconSet} /> : <Icons.ArrowUpward className={classes.iconSet} />;
    else
      iconSet = iconUnset;

    return (
      <Material.Menu
        open={true}
        variant={'menu'}
        onClose={() => { this.setState({ elMenuOn: null, menuColumn: null }) }}
        anchorEl={elMenuOn}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center', }}
        getContentAnchorEl={null}
        transformOrigin={{ vertical: 'top', horizontal: 'center', }}
        >
        {menuColumn.idList.map((id: string, i: number) => {
              return (
                <Material.MenuItem
                  key={id}
                  selected={menuColumn.id === id}
                  onClick={() => { this.setState({ elMenuOn: null, menuColumn: null }); actions.fire(ClientActions.SetColumn, id) }}
                >
                  {menuColumn.id === id ? iconSet : iconUnset}
                  {'\xa0'}
                  {menuColumn.labelList[i]}
                </Material.MenuItem>
              );
          })}
      </Material.Menu>
      );
  }

  isCellSelected(column: any, rowData: any): boolean
  {
    const {selection} = this.props;

    return selection && selection.test(rowData.id);
  }

  onCellClick(event: any, column: any, rowData: any): void
  {
    const {actions, columns} = this.props;

    if (!column || column.id === 'id')
      this.onCellCheckbox(rowData);
    else
    {
      let e: any = event.nativeEvent;
      if (e && e.which == 1 && (e.altKey || e.metaKey || e.ctrlKey))
        actions.fire(ClientActions.SelectionMeta, rowData.id);
      else
      {
        let c = columns.find((col) => col.id === column.id);
        if (c && c.fieldType === 'icon')
        {
          let iconData: any = rowData[c.id];
          actions.fire(ClientActions.TableIconSelect, { id: rowData.id, name: iconData.name, selected: !iconData.selected });
        }
        else if (c && c.fieldType === 'popover')
        {
          let iconData: any = rowData[c.id];
          this.setState({ elPopoverOn: document.getElementById(`tvpopover-${rowData.id}`), idPopover: rowData.id, namePopover: iconData.name });
        }
        else if (c && c.fieldType === 'check')
        {
          actions.fire(ClientActions.TableCheckSelect, { id: rowData.id, name: c.id });
        }
        else if (c && c.fieldType === 'button')
        {
          actions.fire(ClientActions.TableButtonSelect, { id: rowData.id, name: c.id });
        }
        else
          this.onCellNormal(rowData);
      }
    }
  }

  onCellCheckbox(rowData: any): void
  {
    const {actions, selection} = this.props;

    const id: string = rowData.id;

    if (selection)
      if (selection.test(id))
        actions.fire(ClientActions.SelectionClear, id);
      else
        actions.fire(ClientActions.SelectionSet, id);
  }

  onCellNormal(rowData: any): void
  {
    const {actions, selection} = this.props;
    const id: string = rowData.id;

    if (selection)
      if (selection.test(id))
        actions.fire(ClientActions.SelectionDouble, id);
      else
      {
        actions.fire(ClientActions.SelectionEmpty);
        actions.fire(ClientActions.SelectionSet, id);
      }
  }

  /*onCellDoubleClick(column: any, rowData: any): void
  {
    const {actions} = this.props;
    const id: string = rowData.id;

    actions.fire(ClientActions.SelectionEmpty);
    actions.fire(ClientActions.SelectionSet, id);
    actions.fire(ClientActions.SelectionDouble, id);
  } */

  onHeaderSelectionClick(): void
  {
    const {actions, rows, selection} = this.props;

    if (selection)
      if (rows.length > selection.length)
        actions.fire(ClientActions.SelectionSetAll);
      else
        actions.fire(ClientActions.SelectionEmpty);
  }

  maxColLength(id: string): number
  {
    const {rows} = this.props;

    let maxlength = 0;
    rows.forEach((r: any) => { let l = r[id] ? r[id].length : 0; if (l > maxlength) maxlength = l });
    return maxlength;
  }

  vtRowGetter({ index }: { index: number }): any
  {
    return this.props.rows[index];
  }

  vtCellRenderer({ cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex }:
    { cellData: any, columnData: any, columnIndex: number, dataKey: string, isScrolling: boolean, rowData: any, rowIndex: number }): JSX.Element
  {
    const {classes, columns} = this.props;
    let col = columnIndex > 0 ? columns[columnIndex-1] : null;
    let className = col && (col.fieldType === 'string' || col.fieldType === 'midstring') ? classes.cellBodyWrap : classes.cellBody;

    return (
      <div
        className={className}
        style={{ textAlign: columnData.align, justifyContent: textToFlex(columnData.align) }}
        onClick={(event: any) => { this.onCellClick(event, columnData, rowData) }}
        >
          <div>
            {columnData.cellContentsRenderer(rowData, columnData.id)}
          </div>
      </div>
      );
  }

  vtCheckboxHeaderRenderer({columnData, dataKey, disableSort, label, sortBy, sortDirection }: {columnData?: any, dataKey: string, disableSort?: boolean, label?: any, sortBy?: string, sortDirection?: RV.SortDirectionType }): JSX.Element
  {
    const {classes, selection, rows, designSize} = this.props;

    return (
      <div
        className={classes.cellBody}
        style={{ textAlign: columnData.align, justifyContent: textToFlex(columnData.align) }}
        >
        <div>
          <Material.Checkbox
            indeterminate={selection.length > 0 && selection.length < rows.length}
            checked={selection.length > 0 && selection.length == rows.length}
            style={{padding: isNarrow(designSize) ? 2 : ''}}
            onClick={() => {this.onHeaderClick(columnData)}}
          />
        </div>
      </div>
      );
  }

  vtHeaderContentRenderer(col: ColumnHead): JSX.Element
  {
    let l = col.labelAll ? col.labelAll : col.label;
    let re = /^icon: (.*)$/;
    let a = re.exec(l);
    if (a)
    {
      switch (a[1])
      {
        case 'TrackChanges': return (<Icons.TrackChanges />);
        // others...
      }
    }

    return (<Material.Typography>{l}</Material.Typography>);
  }

  vtHeaderRenderer({columnData, dataKey, disableSort, label, sortBy, sortDirection }: {columnData?: any, dataKey: string, disableSort?: boolean, label?: any, sortBy?: string, sortDirection?: RV.SortDirectionType }): JSX.Element
  {
    const {classes,columns} = this.props;
    type SD = 'asc' | 'desc';
    let sd: SD = sortDirection === 'ASC' ? 'asc' : 'desc';
    let col = columns.find(c => c.id === columnData.id);

    return (
      <div
        className={classes.cellBody}
        style={{ textAlign: columnData.align, justifyContent: textToFlex(columnData.align) }}
        id={`tvheader-${columnData.id}`}
        >
        <div>
          {!disableSort ?
              <Material.TableSortLabel active={sortBy === columnData.id} direction={sd} onClick={() => this.onHeaderClick(columnData)} hideSortIcon={true}
                className={classNames(classes.tableSortLabel)}>
                <Material.Tooltip title={MA.getTooltip(`Sort by ${columnData.label}`)}>
                  {this.vtHeaderContentRenderer(col)}
                </Material.Tooltip>
              </Material.TableSortLabel> :
            this.vtHeaderContentRenderer(col)}
        </div>
      </div>
      );
  }

  vtRowClick({ event, index, rowData }: { event: any, index: number, rowData: any }): void
  {
    const {columns} = this.props;

    if (index == 0)
      this.onCellCheckbox(rowData);
    else
      this.onCellClick(event, index ? columns[index-1] : null, rowData);
  }

  vtRowDoubleClick({ event, index, rowData }: { event: any, index: number, rowData: any }): void
  {
    //this.vtRowClick(event, index, rowData);
  }

  vtHeaderClick({ columnData, dataKey, event }: { columnData: any, dataKey: string, event: any }): void
  {
    this.onHeaderClick(columnData);
  }

  renderThePopover(): JSX.Element
  {
    const { renderPopover } = this.props;
    const { elPopoverOn, idPopover, namePopover } = this.state;

    if (elPopoverOn && renderPopover)
    {
      let myId = idPopover;
      return (
          <Material.Popover
            open={true}
            onClose={() => { if (myId === this.state.idPopover) this.setState({elPopoverOn: null, idPopover: null, namePopover: null}) }}
            anchorEl={elPopoverOn}
            getContentAnchorEl={null}
            anchorOrigin={{vertical:'top', horizontal:'right'}}
            anchorReference={'anchorEl'}
          >
            {renderPopover(idPopover, namePopover)}
          </Material.Popover>
        )
    }
    else
      return null;
  }

  render(): JSX.Element
  {
    let {classes, theme, columns, rows, selection, sorter, ordering, orderBy, outerHeight, disableHeader, rowHeight, showCheck, scrollToSelection, designSize} = this.props;
    if (!rowHeight) rowHeight = TableRowHeight;
    const { elPopoverOn } = this.state;

    // Sort
    rows = sorter(rows, orderBy, ordering);

    // Map to react-virtualized columns
    let vcolumns: any[] = [];

    // Selection Checkbox Column
    let checkWidth = isNarrow(designSize) ? 48 : 62;
    if (showCheck)
      vcolumns.push(
          <RV.Column
            className={classes.cellAll}
            disableSort={true}
            cellRenderer={this.vtCellRenderer}
            headerRenderer={this.vtCheckboxHeaderRenderer}
            columnData={{ id: 'id', cellContentsRenderer: this.checkboxCellRenderer }}
            id={'id'}
            width={checkWidth}
            minWidth={checkWidth}
            maxWidth={checkWidth}
          />);

    // Normal columns
    // Need disableSort, flexGrow, flexShrink, width, columnData.cellContentsRenderer, className, cellRenderer

    // Add columns
    columns.forEach((col: any) => {
        let cprops: any = {};
        // These are properties common to all columns
        cprops.cellRenderer = this.vtCellRenderer;
        cprops.className = classes.cellAll;
        cprops.columnData = { };
        // Customize
        cprops.id = col.id;
        cprops.columnData.id = col.id;
        cprops.label = col.label;
        cprops.flexGrow = 0;
        cprops.disableSort = false;
        cprops.columnData.cellContentsRenderer = this.stringCellRenderer;
        cprops.columnData.align = 'left';
        cprops.columnData.label = col.label;
        cprops.headerRenderer = this.vtHeaderRenderer;
        switch (col.fieldType)
        {
          case 'number':
            cprops.width = 70;
            cprops.columnData.align = 'right';
            break;
          case 'shortstring':
            cprops.width = 70;
            cprops.columnData.align = 'center';
            break;
          case 'midstring':
            cprops.columnData.align = 'left';
            let m = this.maxColLength(col.id);
            if (m == 0) cprops.width = 92;
            else if (m < 15) cprops.width = 156;
            else
            {
              cprops.flexGrow = 1;
              cprops.width = 0;
            }
            break;
          case 'string':
            cprops.width = 0;
            cprops.flexGrow = 1;
            break;
          case 'icon':
            cprops.width = 24;
            cprops.className = classes.cellTight;
            cprops.columnData.cellContentsRenderer = this.iconCellRenderer;
            cprops.columnData.align = 'center';
            break;
          case 'popover':
            cprops.width = 48;
            cprops.className = classes.cellTight;
            cprops.columnData.cellContentsRenderer = this.popoverCellRenderer;
            cprops.columnData.align = 'center';
            break;
          case 'boolean':
            cprops.width = 32;
            cprops.columnData.cellContentsRenderer = this.boolCellRenderer;
            cprops.columnData.align = 'center';
            break;
          case 'check':
            cprops.width = 96;
            cprops.columnData.cellContentsRenderer = this.checkCellRenderer;
            cprops.columnData.align = 'center';
            break;
          case 'button':
            cprops.width = 110;
            cprops.columnData.cellContentsRenderer = this.buttonCellRenderer;
            cprops.columnData.align = 'center';
            break;
          case 'date':
            cprops.width = 110;
            cprops.columnData.cellContentsRenderer = this.dateCellRenderer;
            break;
          case 'image':
            cprops.disableSort = true;
            cprops.width = 110;
            cprops.columnData.cellContentsRenderer = this.imageCellRenderer;
            cprops.columnData.align = 'center';
            break;
        }
        if (cprops.width)
        {
          cprops.minWidth = cprops.width;
          cprops.maxWidth = cprops.width;
        }

        // Now push
        vcolumns.push(<RV.Column {...cprops} />);
      });

    let props: any = {};
    props.headerClassName = classes.tableHeading;
    props.headerHeight = rowHeight;
    props.disableHeader = false;  // Use if implement no-header option
    //props.onHeaderClick = this.vtHeaderClick; - set on header object using onClick
    //props.onRowClick = this.vtRowClick; - use explicit onClick
    //props.onRowDoubleClick = this.vtRowDoubleClick;
    props.disableHeader = disableHeader;
    props.rowCount = rows.length;
    props.rowGetter = this.vtRowGetter;
    props.rowHeight = rowHeight;
    props.sortBy = orderBy;
    props.sortDirection = ordering;
    props.rowClassName = classes.rowAll;
    props.gridClassName = classes.virtualGrid;

    if (scrollToSelection && !this.alreadyScrolled && selection && selection.length == 1)
    {
      let id = selection.asString();
      let i = rows.findIndex((r: any) => r.id === id);
      if (i >= 0)
        props.scrollToIndex = i;
    }

    const outerH = outerHeight ? outerHeight : 'calc(100vh - 100px)';
    return (
      <div id={'tableview'} className={classes.tableWrapper} style={{height: outerH}}>
        <RV.AutoSizer>
          {({ height, width }) => (
            <RV.Table className={classes.virtualTable} width={width} height={height} {...props} >
              {vcolumns}
            </RV.Table>
          )}
        </RV.AutoSizer>
        {this.renderColumnMenu()}
        {this.renderThePopover()}
      </div>
      );
  }

}

let StyledTableView: any = withStyles(TableViewStyles, {withTheme: true})(InternalTableView);
export const TableView: new () => React.Component<TableViewProps, TableViewState> = StyledTableView;
