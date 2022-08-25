/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Grid } from '@mui/material';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import DragSliderAnimation from 'src/components/DragSliderAnimation/DragSliderAnimation';
import { GraphElements, ForceGraph, GraphNode } from 'src/components/ForceGraph';
import useInterval from 'src/hooks/useInterval';
import { PlayButton } from './PlayButton';
import { useDispatchSimulationContext, useSimulationContext } from './SimulaitionProvider';
import SimulationNode from './SimulationNode';
import SimulationTimeline from './SimulationTimeline';
import { SimulationEvent } from './types';

const nodeA = { id: '0', name: 'A' };
const nodeB = { id: '1', name: 'B' };
const nodeC = { id: '2', name: 'C' };
const nodeD = { id: '3', name: 'D' };

const nodes = [nodeA, nodeB, nodeC, nodeD] as GraphNode[];

const maxTime = 180;

const generateRandomEvents = () =>
  _(_.range(15).map(() => ({ node: nodes[_.random(0, nodes.length - 1)], startTime: _.random(0, maxTime) })))
    .orderBy((e) => e.startTime)
    .value() as SimulationEvent[];

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

  const rangeMax = 180;

  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div style={{ width: '100vw', height: '100vh' }}>
        <Grid container direction='column'>
          <Grid item xs={12}>
            <Button variant='contained' onClick={() => fetchEvents()}>
              Fetch Events
            </Button>
          </Grid>
          <Grid item xs={12} margin={6}>
            <Grid container direction='row' alignContent='stretch' alignItems='center'>
              <Grid item>
                <PlayButton
                  playing={playing}
                  setPlaying={setPlaying}
                  onStep={() => {
                    const incTime: number = time + rangeMax / 100;
                    if (incTime > rangeMax) {
                      dispatch({ type: 'setTime', payload: 0 });
                      return false;
                    }
                    dispatch({ type: 'setTime', payload: incTime });
                    return true;
                  }}
                />
              </Grid>
              <Grid item flexGrow={1}>
                <DragSliderAnimation
                  value={time}
                  onValueChanged={(value) => {
                    dispatch({ type: 'setTime', payload: value });
                    setPlaying(false);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container direction='row'>
              <Grid item xs={6} sx={{ height: '800px' }}>
                <ForceGraph graphElements={graphElements} renderNode={(node) => <SimulationNode node={node} />} />
              </Grid>
              <Grid item xs={6} padding={4}>
                <SimulationTimeline events={events} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default Simulation;
