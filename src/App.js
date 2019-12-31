import React, { Component } from 'react';
import logo from './logo.svg';
import classnames from 'classnames';
import { throttle, debounce } from './throttle';
import EditState from './edit-state';
import './App.css';

const ROWS = 5;
const COLS = 5;

let dirtyState = false;
let blinkers = [];
for (let i = 0; i < ROWS; i++) {
  var row = [];
  for (let j = 0; j < COLS; j++) {
    row[j] = null;
  }
  blinkers.push(row);
}

function Cell(props) {
  return (
    <div
        className={classnames('cell', props.active ? 'active' : '')}
        data-row={props.row}
        data-col={props.col}
    ></div>
  );
}

function Row(props) {
  return (
    <div className='row'>
      {props.cols.map((active, i) => {
        return <Cell
            key={i}
            row={props.row}
            col={i}
            active={active}
        />;
      })}
    </div>
  )
}

function Grid(props) {
  return (
    <div className='grid'>
      {props.rows.map((cols, i) => {
        return <Row
            key={i}
            row={i}
            cols={cols}
        />;
      })}
    </div>
  );
}

function makeHandler(f) {
  return e => {
    e.preventDefault();
    f(e);
  };
}

function setCell(model, row, col, val) {
  return model.map((cells, r) => cells.map((v, c) => r == row && c == col ? val : v));
}

function getCoords(e) {
  //Handle wacky touch event objects
  if(e.changedTouches) {
    e = e.changedTouches[0];
  }

  const targetCell = document.elementFromPoint(e.clientX, e.clientY);
  if (!targetCell) {
    return [null, null];
  }

  return [targetCell.getAttribute('data-row'), targetCell.getAttribute('data-col')];
}

const postState = throttle(rows => {
  fetch(new Request('/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rows: ROWS,
      columns: COLS,
      pattern: rows
    })
  }))
}, 100);

class App extends Component {

  constructor() {
    super();

    this.state = {
      editState: EditState.NONE,
      blinkState: null,
      rows: new Array(ROWS)
              .fill(null)
              .map((_, row) => new Array(COLS)
                  .fill(null)
                  .map(() => 0))
    };

    // Christ, React events are just a shitty subset of DOM events. Don't use them.
    document.addEventListener('mouseup', makeHandler(e => this.up(e)));
    document.addEventListener('mousedown', makeHandler(e => this.down(e)));
    document.addEventListener('mousemove', makeHandler(e => this.move(e)));
    document.addEventListener('touchend', makeHandler(e => this.up(e)));
    document.addEventListener('touchstart', makeHandler(e => this.down(e)));
    document.addEventListener('touchmove', makeHandler(e => this.move(e)));
    document.addEventListener('keydown', makeHandler(e => this.key(e)));
  }

  down(e) {
    const [row, col] = getCoords(e);
    if (row == null) { return; }

    const cell = this.state.rows[row][col];
    dirtyState = true;

    let newRows;
    if (this.state.blinkState != null) {
      if (blinkers[row][col] == undefined) {
        // Set the blinker
        blinkers[row][col] = setInterval(() => {
          dirtyState = true;
          this.setState({
            rows: setCell(this.state.rows, row, col, Number(!this.state.rows[row][col]))
          });
        }, 1000 / this.state.blinkState);
      }
      else {
        // Remove the blinker
        clearInterval(blinkers[row][col]);
        blinkers[row][col] = null;
      }
      newRows = this.state.rows;
    }
    else {
      // Remove the blinker
      clearInterval(blinkers[row][col]);
      blinkers[row][col] = null;
      newRows = setCell(this.state.rows, row, col, Number(!cell));
    }

    this.setState({
      editState: cell ? EditState.CLEAR : EditState.DRAW,
      rows: newRows
    });
  }

  up() {
    this.setState({
      editState: EditState.NONE,
      rows: this.state.rows.slice(0)
    });
  }

  move(e) {
    if (this.state.editState === EditState.NONE) {
      return;
    }

    const [row, col] = getCoords(e);
    if (row == null) { return; }
    const curState = this.state.rows[row][col];
    if (this.state.editState === EditState.DRAW && curState) {
      return;
    }
    if (this.state.editState === EditState.CLEAR && !curState) {
      return;
    }

    dirtyState = true;

    let newRows;
    if (this.state.blinkState != null) {
      if (blinkers[row][col] == undefined && this.state.editState === EditState.DRAW) {
        // Set the blinker
        blinkers[row][col] = setInterval(() => {
          dirtyState = true;
          this.setState({
            rows: setCell(this.state.rows, row, col, Number(!this.state.rows[row][col]))
          });
        }, 1000 / this.state.blinkState);
      }
      else if (blinkers[row][col] != undefined && this.state.editState === EditState.CLEAR) {
        // Remove the blinker
        clearInterval(blinkers[row][col]);
        blinkers[row][col] = null;
      }
      newRows = this.state.rows;
    }
    else {
      // Remove the blinker
      clearInterval(blinkers[row][col]);
      blinkers[row][col] = null;
      newRows = setCell(this.state.rows, row, col, Number(this.state.editState === EditState.DRAW))
    }

    this.setState({
      editState: this.state.editState,
      rows: newRows
    });
  }

  key(e) {
    const num = parseInt(e.key);
    if (isNaN(num)) { return; }
    this.setState({
      blinkState: num == 0 ? null : num
    });
  }

  componentWillUpdate(_, nextState) {
    if (dirtyState) {
      postState(nextState.rows);
      dirtyState = false;
    }
  }

  render() {
    return (
      <div>
        <div className='blink-state'>{this.state.blinkState}</div>
        <Grid
          rows={this.state.rows}
        />
      </div>
    );
  }

}

export default App;
