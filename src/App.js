import React, { Component } from 'react';
import logo from './logo.svg';
import classnames from 'classnames';
import './App.css';

const ROWS = 5;
const COLS = 5;

function Cell(props) {
  return (
    <div
        className={classnames('cell', props.active ? 'active' : '')}
        onClick={props.onClick}
    ></div>
  );
}

function Row(props) {
  return (
    <div className='row'>
      {props.cols.map((active, i) => {
        return <Cell
            onClick={props.onClick.bind(null, i)}
            key={i}
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
            onClick={props.onClick.bind(null, i)}
            key={i}
            row={i}
            cols={cols}
        />;
      })}
    </div>
  );
}

function toggleCell(model, row, col) {
  return model.map((cells, r) => cells.map((val, c) => r == row && c == col ? !val : val));
}

class App extends Component {

  constructor() {
    super();

    this.state = {
      rows: new Array(ROWS)
              .fill(null)
              .map((_, row) => new Array(COLS)
                  .fill(null)
                  .map(() => false))
    };
  }

  handleClick(row, col) {
    this.setState({ rows: toggleCell(this.state.rows, row, col) });
  }

  render() {
    return <Grid
      rows={this.state.rows}
      onClick={(row, col) => this.handleClick(row, col)}
    />
  }

}

export default App;
