import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const nSquareToWin = 5;

function Square(props) {
  return (props.win) ? (
    <button className="square square-highlight" onClick={props.onClick}>
      {props.value}
    </button>
  ) : (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>  
  )  ;
}

class SquareRow extends React.Component {
  render() {
    let squareRow = this.props.row.map((square, idx) => {
      let k = "s" + idx;
      let win = false;
      let winner = this.props.winner;
      let rowIdx = this.props.rowIdx;
      if (winner) {
        if (winner.direction === "ToRight" &&
          idx >= winner.x && idx <= winner.x + nSquareToWin - 1 && rowIdx === winner.y) {
            win = true;
        }
        if (winner.direction === "ToDown" &&
            rowIdx >= winner.y && rowIdx <= winner.y + nSquareToWin - 1 && idx === winner.x) {
            win = true;
        }
        if (winner.direction === "ToRightDown" &&
          idx >= winner.x && idx <= winner.x + nSquareToWin - 1 && idx - winner.x === rowIdx - winner.y) {
            win = true;
        }
        if (winner.direction === "ToLeftDown" &&
          idx <= winner.x && idx >= winner.x - nSquareToWin + 1 && winner.x - idx === rowIdx - winner.y) {
            console.log(winner.x+' '+winner.y+' '+idx+' '+rowIdx+' '+nSquareToWin);
            win = true;
        }
      }
      return (
        <Square win={win} value={square} onClick={() => this.props.onClick(this.props.rowIdx, idx)} key={k} />
      )
    })
    return (
      <div className="board-row">
        {squareRow}
      </div>
    )
  }
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
      />
    );
  }
  render() {
    let board;
    board = this.props.squares.map((row, idx) => {
      let k = "r" + idx;
      return (
        <SquareRow winner={this.props.winner} rowIdx={idx} row={row} onClick={this.props.onClick} key={k}/>
      )
    })
    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let tmpArr = Array(20);
    for (let i = 0; i < 20; i++) {
      tmpArr[i] = Array(20).fill(null);
    }
    this.state = {
      history: [{
        squares: tmpArr,
        location: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      isDescending: true,
    };
    this.sort = this.sort.bind(this);
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }
  handleClick(i, j) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();
    current.squares.map((row, idx) => {
      squares[idx] = current.squares[idx].slice();
      return true;
    })
    if (calculateWinner(squares) || squares[i][j]) {
      return;
    }
    squares[i][j] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: {x: i, y: j}
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  sort() {
    this.setState({isDescending: !this.state.isDescending});
  }
 
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const desc = move ?
        'Bước #' + move + ' (' + step.location.x + ',' + step.location.y + ')' :
        'Start';
      return (this.state.stepNumber === move) ? (
        <li key={move}>
          <button className="bold" onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      ) : (
        <li key={move}>
        <button onClick={() => this.jumpTo(move)}>{desc}</button>
      </li>
      );
    });
    if (!this.state.isDescending) {
      moves = moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner.val;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    let arrow = this.state.isDescending ? '↓' : '↑'
    return (
      
        <div className="game">
          <div className="game-board">
            <Board
              squares={current.squares}
              onClick={(i, j) => this.handleClick(i, j)}
              winner={winner}
            />
          </div>
          <div className="game-info">
          <div>
              <button onClick={this.sort}>Sort {arrow}</button>
          </div>
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
        
        
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  let win;
  for (let i = 0; i < squares.length; i++) {
    for (let j = 0; j < squares[i].length; j++) {
      if (!squares[i][j]) continue;
      if (j <= squares[i].length - nSquareToWin) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i][j + k] !== squares[i][j + k + 1]) {
            win = false;
          }
        }
        
        if ( j !== 0 && j < 15 ) {
          if (squares[i][j-1] !== squares[i][j] && squares[i][j-1] === squares[i][j+5] && squares[i][j-1])  {
            win = false;
          }
        }
        
        if (win)
        {
        return {val: squares[i][j], x: j, y: i, direction: 'ToRight'};
        }
      }
      if (i <= squares.length - nSquareToWin) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i + k][j] !== squares[i + k + 1][j]) {
            win = false
          }
        }
        
        if ( i !== 0 && i < 15 ) {
          if (squares[i-1][j] !== squares[i][j] && squares[i-1][j] === squares[i+5][j] && squares[i-1][j]) {
            win = false
          }
        }
        
        if (win)
        {
         return {val: squares[i][j], x: j, y: i, direction: 'ToDown'};
        }
      }
      if (j <= squares[i].length - nSquareToWin && i <= squares.length - nSquareToWin) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i + k][j + k] !== squares[i + k + 1][j + k + 1]) {
            win = false
          }
        }

        if ( i !== 0 && j!== 0 && i < 15 && j < 15 ) {
          if (squares[i-1][j-1] !== squares[i][j] && squares[i-1][j-1] === squares[i+5][j+5] && squares[i-1][j-1]) {
            win = false
          }
        }

        if (win) 
        {
          return {val: squares[i][j], x: j, y: i, direction: 'ToRightDown'};
        }
      }
      if (i <= squares.length - nSquareToWin && j >= nSquareToWin - 1) {
        win = true;
        for (let k = 0; k < nSquareToWin - 1; k++) {
          if (squares[i + k][j - k] !== squares[i + k + 1][j - k - 1]) {
            win = false
          }
        }

        if ( i !== 0 && j!== 0 && i < 15 && j > 4 && j !== 19 ) {
          if (squares[i-1][j+1] !== squares[i][j] && squares[i-1][j+1] === squares[i+5][j-5] && squares[i-1][j+1]) {
            win = false
          }
        }
        if (win){
          return {val: squares[i][j], x: j, y: i, direction: 'ToLeftDown'};
        } 
      }
    }
  }
  return null;
}