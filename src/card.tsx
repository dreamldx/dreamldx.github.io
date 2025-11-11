import {useState} from "react";
import TicTacToe from "./tictactoe.tsx";


interface CardProps {
  id: String
}



function Card(props: CardProps) {
  const colors = ["bg-red-200", "bg-yellow-200", "bg-emerald-200", "bg-cyan-200", "bg-indigo-200", "bg-purple-200", "bg-rose-200"];
  const [color, _] = useState( colors[Math.floor(Math.random() * colors.length)])

  return (
    <div className={ "text-sm place-content-center h-full w-full " + color}>
      <TicTacToe />
    </div>
  )
}

export default Card