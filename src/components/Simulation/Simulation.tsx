/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Grid } from '@mui/material';
import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import DragSliderAnimation from 'src/components/DragSliderAnimation/DragSliderAnimation';
import { GraphElements, ForceGraph, GraphNode } from 'src/components/ForceGraph';
import { useDispatchSimulationContext, useSimulationContext } from './SimulaitionProvider';
import SimulationNode from './SimulationNode';
import SimulationTimeline from './SimulationTimeline';
import { SimulationEvent } from './types';

const nodeA = { id: '0', name: 'A' };
const nodeB = { id: '1', name: 'B' };
const nodeC = { id: '2', name: 'C' };
const nodeD = { id: '3', name: 'D' };

const nodes = [nodeA, nodeB, nodeC, nodeD] as GraphNode[];

const maxTime = 20;

const generateRandomEvents = () =>
  _(_.range(15).map(() => ({ node: nodes[_.random(0, nodes.length - 1)], startTime: _.random(0, maxTime) })))
    .orderBy((e) => e.startTime)
    .value() as SimulationEvent[];

// const events = [
//   { node: nodeA, startTime: 10 },
//   { node: nodeA, startTime: 19 },
//   { node: nodeA, startTime: 28 },
//   { node: nodeA, startTime: 37 },

// ] as SimulationEvent[];

const graphElements = {
  nodes: nodes.map((node) => ({ data: node })),
  links: [
    { source: nodeD.id, target: nodeA.id },
    { source: nodeD.id, target: nodeB.id },
    { source: nodeD.id, target: nodeC.id },
    { source: nodeA.id, target: nodeC.id },
    { source: nodeB.id, target: nodeC.id },
  ],
} as GraphElements;

const Simulation: React.FC = () => {
  const { dispatch } = useDispatchSimulationContext();
  const { time, events } = useSimulationContext();

  const fetchEvents = useCallback(() => dispatch({ type: 'setEvents', payload: generateRandomEvents() }), [dispatch]);

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <Grid direction='column' container style={{ width: '100vw', height: '100vh', backgroundImage: 'linear-gradient(rgb(11, 21, 64), rgb(35, 5, 38))' }}>
        <Button variant='contained' onClick={() => fetchEvents()}>
          Fetch Events
        </Button>

        <Grid item>
          <DragSliderAnimation value={time} onValueChanged={(value) => dispatch({ type: 'setTime', payload: value })} />
        </Grid>

        <Grid item>
          <Grid container direction='row'>
            <Grid item xs={6}>
              <ForceGraph graphElements={graphElements} renderNode={(node) => <SimulationNode node={node} />} />
            </Grid>
            <Grid item xs={6}>
              <SimulationTimeline events={events} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Simulation;
