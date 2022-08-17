import React from 'react';
import DragSliderAnimation from 'src/components/DragSliderAnimation/DragSliderAnimation';
import { GraphElements, ForceGraph } from 'src/components/ForceGraph';
import { useDispatchSimulationContext, useSimulationContext } from './SimulaitionProvider';

const data = {
  nodes: [
    { id: '0', type: 'FUND', details: { name: 's', manager: '', year: '2022', type: 'Venture Capital', isOpen: false } },
    { id: '1', type: 'FUND', details: { name: 's', manager: '', year: '2022', type: 'Venture Capital', isOpen: true } },
    { id: '2', type: 'FUND', details: { name: 's', manager: '', year: '2022', type: 'Venture Capital', isOpen: true } },
    { id: '3', type: 'FUND', details: { name: 's', manager: '', year: '2022', type: 'Venture Capital', isOpen: true } },
  ],
  links: [
    { source: '3', target: '0' },
    { source: '3', target: '1' },
    { source: '3', target: '2' },
    { source: '0', target: '2' },
    { source: '1', target: '2' },
  ],
} as GraphElements;

const Simulation: React.FC = () => {
  const { dispatch } = useDispatchSimulationContext();
  const { time } = useSimulationContext();

  return (
    <>
      <DragSliderAnimation value={time} onChange={(value) => dispatch({ type: 'setTime', payload: value })} />

      <button onClick={() => dispatch({ type: 'incrementTime', payload: 10 })}>Set time</button>

      <div className='App' style={{ width: '100vw', height: '100vh', backgroundImage: 'linear-gradient(rgb(11, 21, 64), rgb(35, 5, 38))' }}>
        <ForceGraph graphElements={data} />
      </div>
    </>
  );
};

export default Simulation;
