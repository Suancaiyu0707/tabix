// @ts-ignore
import { map, maxBy, isEmpty, is } from 'ramda';

/* eslint-disable */

export default class DataDecorator {
  private _humanSortCols: any[] = [];

  private _sortBy = false;

  private _sortOrder = false;

  private data: any;

  private text: any = false;

  // @ts-ignore
  private sourceType: any;

  // @ts-ignore
  private progressQuery = '';

  // @ts-ignore
  private sort = false;

  // @ts-ignore
  private sortOrder = false;

  private meta: any;

  private prepareInt64Cols: any = {};

  private query: any;

  private error: any = false;

  // @ts-ignore
  private draw: any;

  // @ts-ignore
  private rows: any;

  // @ts-ignore
  private position: any;

  // порядковый номер
  // @ts-ignore
  private countAll: any; // всего запросов в выполнении

  // @ts-ignore
  constructor(result, sourceType) {
    if (result.totals && result.data) {
      result.data.push(result.totals);
    }
    this._humanSortCols = [];
    this._sortBy = false;
    this._sortOrder = false;
    this.data = result.data;
    this.text = false;
    this.progressQuery = '';
    this.sort = false;
    this.sortOrder = false;
    // Если результат строка
    if (!result.error && !is(Object, result.data)) {
      if (is(String, result.data)) {
        this.text = JSON.stringify(result.data);
      } else {
        this.text = result.data;
      }
      // XSS
      this.text = this.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    // --------------------------------------------------
    this.sourceType = sourceType || 'ch';

    this.meta = result.meta;
    this.prepareInt64Cols = {};

    // prepare (Int64+UInt64)
    if (this.data) {
      try {
        this.prepareInt64();
      } catch (e) {
        console.error('Error in prepareInt64', e);
      }

      if (is(Object, this.meta)) {
        this.meta.prepareInt64Cols = this.prepareInt64Cols;
      }
    }

    if (result.query) {
      this.query = result.query;
    } else {
      this.query = { index: 0, drawCommands: false };
    }
    if (result.error) {
      // XSS
      this.error = result.error
        .replace('<br/>', '\n')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      this.error = this.error.replace('\\' + 'n', '<br/>');
    } else {
      this.error = false;
    }
    this.draw = this.query.drawCommands;
    this.rows = result.rows;

    this.position = this.query.index; // порядковый номер
    this.countAll = result.countAllQuery; // всего запросов в выполнении
  }

  // @ts-ignore
  prepareInt64() {
    // @ts-ignore
    const $canConvert = [];

    if (!(Array.isArray(this.data) && this.data.length > 1)) return false;

    this.prepareInt64Cols = {};
    // @ts-ignore
    this.meta.forEach(cell => {
      if (cell.type.includes('Int64') && !cell.type.includes('Array(')) {
        //  max value

        let $v = 0;
        try {
          // @ts-ignore
          const comparator = o => {
            if (!isEmpty(o[cell.name])) return parseInt(o[cell.name]);
          };
          $v = maxBy(comparator, this.data)[cell.name];
        } catch (e) {
          console.error('prepareInt64,maxBy', e, 'in cell', cell, 'meta', this.meta);
        }

        // @ts-ignore
        const $max = parseInt($v);

        // 11117311154531369000

        if ($max < Number.MAX_SAFE_INTEGER) {
          // @ts-ignore
          $canConvert.push(cell.name);
          this.prepareInt64Cols[cell.name] = true;
        }
      }
    });

    if (!($canConvert.length > 0)) return false;

    // console.log("$canConvert, convert to Int",$canConvert);

    // @ts-ignore
    this.data = map(o => {
      // @ts-ignore
      $canConvert.forEach(cell => {
        o[cell] = parseInt(o[cell]);
      });
      return o;
    }, this.data);
  }

  // @ts-ignore
  isNormalInt64Col(coll) {
    return this.prepareInt64Cols[coll];
  }

  /**
   * Преобразование массива в обьект для конструктора  DataProvider
   *
   * @param data
   * @returns {DataDecorator}
   */
  // @ts-ignore
  static convertArrayToDataProvider(data, sourceType) {
    const result = {
      data,
      meta: [],
      error: false,
      query: { drawCommands: false },
      rows: data.length,
      position: 0,
      countAll: 0,
    };
    // @ts-ignore
    Object.keys(data[0]).map(key => result.meta.push({ name: key, type: 'string' }));
    return new DataDecorator(result, sourceType);
  }

  isText() {
    if (this.text) {
      return true;
    }
    return false;
  }

  isError() {
    if (this.error) {
      return true;
    }
    return false;
  }

  getError() {
    return this.error;
  }

  // @ts-ignore
  update(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  getMeta() {
    return this.meta;
  }

  toString() {
    return JSON.stringify(this.data);
  }

  getColumnsHumanSort() {
    return this._humanSortCols;
  }

  // @ts-ignore
  setColumnsHumanSort($cols) {
    this._humanSortCols = $cols;
  }

  // @ts-ignore
  setSort($coll, $order) {
    // column : Number - this index of column, by which you want to sorter the table.
    // sortOrder : Boolean - defines the order of sorting (true for ascending, false for descending).
    this._sortBy = $coll;
    this._sortOrder = $order;
    if (is(Number, $order)) {
      this._sortOrder = !(parseInt($order) < 0);
    }
  }

  getSortByColl() {
    return this._sortBy;
  }

  getSortOrderBy() {
    return this._sortOrder;
  }
}