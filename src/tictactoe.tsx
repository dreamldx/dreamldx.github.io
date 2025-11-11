import {MouseEventHandler, useState, type MouseEvent} from "react";

interface SquareProps {
  value: string;
  onSquareClick: MouseEventHandler<HTMLButtonElement>;
}

function Square({value, onSquareClick}: SquareProps) {
  return (
    <button className="h-5 w-5 bg-white border-black border-1"
            onClick={onSquareClick} >
      {value}
    </button>
  );
}

function Board({xIsNext, squares, onPlay}) {
  function handleClick(x: React.MouseEvent<HTMLButtonElement>, i: Number) {
    onPlay(i)
  }

  return (
    <>
      {
        [1, 2, 3].map(i => {
          return (
            <>
              <div className={'cancelDrag'}>
              {
                [1, 2, 3].map(j => {
                  return (
                    <Square value={squares[i + j * 3]} onSquareClick={(x) => handleClick(x, i + j * 3) }/>
                  )
                })
              }
              </div>
            </>
          )
        })
      }
    </>
  )
}

function TicTacToe() {
  const [xIsNext, setXIsNext] = useState(true);
  const [currentMove, setCurrentMove] = useState(0);
  const [currentSquares, setCurrentSquares] = useState<String[]>(Array(9).fill(' '));
  const handlePlay = (i) => {
    setCurrentSquares((prev):String[] => {
      (prev[i] = 'X')
      return [...prev]
    })
  }
  return (
    <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
  )
}

export default TicTacToe;
