/* eslint-disable react-hooks/exhaustive-deps */
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { NodeData, NodeInterface } from 'src/components/ForceGraph';
import { TSelection } from 'src/d3Types';
import { easeInterpolate } from 'src/utils/d3-utils';
import { useSimulationContext } from './SimulaitionProvider';

interface ISimulationNodeProps {
  node: NodeData;
}

const selectedColor = '#85054d';
const unselectedColor = '#18295e';

const SimulationNode: React.FC<ISimulationNodeProps> = ({ node }) => {
  const { activeNodes, eventDuration, time } = useSimulationContext();

  const svgRef = useRef(null);
  const [svg, setSvg] = useState<null | TSelection>(null);

  const easingColorScale = d3
    .scaleLinear()
    .domain([0, eventDuration])
    .interpolate(easeInterpolate(d3.easePolyInOut))
    .range([selectedColor, unselectedColor] as any[])
    .clamp(true);

  useEffect(() => {
    if (!svg) {
      setSvg(d3.select(svgRef.current));
      return;
    }
    svg.select('rect').attr('fill', () => {
      if (activeNodes?.find((n) => n === node)) {
        const colorX = Math.abs(node.startTime + 0.5 * eventDuration - time);
        return easingColorScale(colorX);
      }
      return unselectedColor;
    });
  }, [activeNodes, svg]);

  return (
    <svg ref={svgRef}>
      <rect width={60} height={60} rx={20}></rect>
      <text fill='white' x={30} y={30} textAnchor='middle' dominantBaseline='middle' fontSize='2em'>
        {node.name}
      </text>
    </svg>
  );
};

export default SimulationNode;
