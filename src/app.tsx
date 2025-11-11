import './app.css'
import layoutJson from  './layout.json'
import RGL, {type Layout, WidthProvider} from 'react-grid-layout';
import {useState} from "react";
import Card from "./card.tsx";

const ReactGridLayout = WidthProvider(RGL);

function generateCardWithProps(layout: Layout) {
  return (
    <div key={layout.i} className={"border-black shadow-lg text-xs"} data-grid={layout}>
      <Card id={layout.i} />
    </div>
  )
}

function App() {
  const [layouts, setLayouts] = useState<Layout[]>([])
  const addCards = () => {
    setLayouts((prev):Layout[] => [...prev, {
      i: String(prev.length + 1),
      x: 0,
      y: -1,
      w: 1,
      h: 5
    }])
  }

  const onLayoutChange = (layout: Layout[]) => {
    setLayouts(layout)
  }

  return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-col bg-gray-100 p-2 flex gap-2 border-b border-gray-300">
          <button className="px-2 py-1 bg-blue-400 text-white rounded hover:bg-blue-600 shadow-lg " onClick={addCards}>Add</button>
        </div>

        <ReactGridLayout
          className={"layout bg-gray-200 flex-grow"}
          layout={layoutJson}
          cols={4} // Number of columns in the grid
          rowHeight={30} // Height of each row
          width={1200} // Total width of the grid
          onLayoutChange={onLayoutChange}
          draggableCancel={".cancelDrag"}
        >
          {
            layouts.map(layout => generateCardWithProps(layout))
          }
        </ReactGridLayout>
        </div>
  );
}

export default App 