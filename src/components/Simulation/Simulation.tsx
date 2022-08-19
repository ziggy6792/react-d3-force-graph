import { Grid } from '@mui/material';
import React, { useEffect } from 'react';
import DragSliderAnimation from 'src/components/DragSliderAnimation/DragSliderAnimation';
import { GraphElements, ForceGraph, NodeData } from 'src/components/ForceGraph';
import { useDispatchSimulationContext, useSimulationContext } from './SimulaitionProvider';
import SimulationNode from './SimulationNode';
import SimulationTimeline from './SimulationTimeline';

const nodes = [
  { id: '0', name: 'A', startTime: 10 },
  { id: '1', name: 'B', startTime: 20 },
  { id: '2', name: 'C', startTime: 30 },
  { id: '3', name: 'D', startTime: 40 },
] as NodeData[];

const graphElements = {
  nodes: nodes.map((data) => ({ data })),
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

  useEffect(() => {
    dispatch({ type: 'serNodes', payload: nodes });
  }, [dispatch]);

  return (
    <>
      <Grid direction='column' container style={{ width: '100vw', height: '100vh', backgroundImage: 'linear-gradient(rgb(11, 21, 64), rgb(35, 5, 38))' }}>
        <Grid item>
          <DragSliderAnimation value={time} onChange={(value) => dispatch({ type: 'setTime', payload: value })} />
        </Grid>

        <Grid item>
          <Grid container direction='row'>
            <Grid item xs={6}>
              <ForceGraph graphElements={graphElements} renderNode={(node) => <SimulationNode node={node} />} />
            </Grid>
            <Grid item xs={6}>
              <SimulationTimeline events={graphElements.nodes} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Simulation;
