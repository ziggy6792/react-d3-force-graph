import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { D3DragEvent, SimulationLinkDatum } from 'd3';
import { NodeInterface, GraphElements } from './types';
import { useSimulationContext } from 'src/components/Simulation/SimulaitionProvider';
import { TSelection } from 'src/d3Types';

type CardSVG = d3.Selection<SVGSVGElement, NodeInterface, d3.BaseType, unknown>;

type Simulation = d3.Simulation<NodeInterface, SimulationLinkDatum<NodeInterface>>;

type DragEvent = D3DragEvent<SVGCircleElement, NodeInterface, NodeInterface>;

const selectedColor = '#85054d';
const unselectedColor = '#18295e';

const generateCard = (cardElement: CardSVG) => {
  const cardGroup = cardElement.append('g');

  // Card Background
  cardGroup
    .append('rect')
    .classed('fund-label-card', true)
    .attr('fill', (d) => unselectedColor)
    .attr('width', 60)
    .attr('height', 60)
    .attr('rx', 20);

  // Card Contents
  const textOffset = 20;
  const initialOffset = 30;

  cardGroup
    .append('text')
    .attr('transform', 'translate(25, ' + (textOffset * 0 + initialOffset) + ')')
    .text((d) => d?.details?.name || null);

  cardGroup.selectAll('text').style('fill', 'white');
};

interface FundGraphGeneratorProps {
  graphElements: GraphElements;
  renderNode: (node: NodeInterface) => React.ReactNode;
}

const svgHeight = 800;

export const ForceGraph: React.FC<FundGraphGeneratorProps> = ({ graphElements, renderNode }) => {
  const svgRef = useRef(null);
  const [svg, setSvg] = useState<null | TSelection>(null);

  useEffect(() => {
    if (!svg) {
      setSvg(d3.select(svgRef.current));
      return;
    }

    const updateGraph = async () => {
      const links = graphElements.links.map((d) => Object.assign({}, d));
      const nodes = graphElements.nodes.map((d) => Object.assign({}, d));
      const drag = (simulation: Simulation) => {
        function dragStarted(event: DragEvent) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event: D3DragEvent<SVGCircleElement, NodeInterface, NodeInterface>) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragEnded(event: D3DragEvent<SVGCircleElement, NodeInterface, NodeInterface>) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }

        return d3.drag<SVGCircleElement, NodeInterface>().on('start', dragStarted).on('drag', dragged).on('end', dragEnded);
      };

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          'link',
          d3
            .forceLink(links)
            .id((d: any) => d.id)
            .distance(240)
        )
        .force('charge', d3.forceManyBody().strength(-240))
        .force('collide', d3.forceCollide(150))
        .force('center', d3.forceCenter(window.innerWidth / 2, svgHeight / 2));

      const nodeGroups = svg.selectAll('.node').data(nodes).call(drag(simulation));

      // Center nodes
      svg
        .selectAll('.node-container')
        .attr('opacity', 1)
        .data(nodes)
        .attr('transform', (d, index) => {
          const { width: nodeWidth, height: nodeHeight } = (nodeGroups.nodes()[index] as HTMLElement).getBoundingClientRect();
          return `translate(${-nodeWidth / 2},${-nodeHeight / 2})`;
        });

      const linkLines = svg
        .select('#graph-links')
        .selectAll('.link')
        .data(links)
        .join('line')
        .attr('class', 'link')
        .attr('stroke', '#FFF')
        .attr('stroke-opacity', 0.6);

      simulation.on('tick', () => {
        nodeGroups.attr('transform', (d) => {
          return `translate(${d.x},${d.y})`;
        });

        linkLines
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
      });
    };
    updateGraph();
  }, [graphElements, svg]);

  return (
    <>
      <svg ref={svgRef} width={'100%'} height={svgHeight} id='graph-svg'>
        <g id='graph-links' stroke='#999' strokeOpacity='0.6'></g>
        <g id='graph-labels'></g>
        {graphElements.nodes.map((node) => (
          <g className='node-container' key={node.id} opacity={0}>
            <g className='node'>{renderNode(node)}</g>
          </g>
        ))}
      </svg>
    </>
  );
};
