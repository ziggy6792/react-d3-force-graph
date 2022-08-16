/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
// import { BaseType, Selection } from 'd3-selection';
// import { scaleLinear } from 'd3-scale';
// import { drag } from 'd3-drag';
// import { interpolate } from 'd3-interpolate';
import * as d3 from 'd3';
import './DragSliderAnimation.css';
import useInterval from 'src/hooks/useInterval';

type Selection<T extends d3.BaseType = SVGSVGElement> = d3.Selection<T | null, unknown, null, undefined>;

const margin = { right: 50, left: 50 };

const maxTimeValue = 180;

const DragSliderAnimation: React.FC = () => {
  // Maybe don't need this
  const [svg, setSvg] = useState<null | Selection>(null);

  const svgRef = useRef<null | SVGSVGElement>(null);
  const handleRef = useRef<null | SVGCircleElement>(null);
  const labelRef = useRef<null | SVGTextElement>(null);
  const sliderRef = useRef<null | SVGGElement>(null);

  const [moving, setMoving] = useState(false);
  const [timeValue, setTimeValue] = useState(0);

  // ToDo: move memos to hook
  const { width, height } = useMemo(() => {
    if (!svg) {
      return {};
    }
    return { width: +svg.attr('width') - margin.left - margin.right, height: +svg.attr('height') };
  }, [svg]);

  const x = useMemo(() => {
    return d3.scaleLinear().domain([0, maxTimeValue]).range([0, width]).clamp(true);
  }, [svg]);

  const updateAnimation = useCallback(
    (newTimeValue: number) => {
      if (!svg) return;
      svg.style('background-color', d3.hsl(newTimeValue, 0.8, 0.8) as any);
      d3.select(handleRef.current).attr('cx', x(newTimeValue));
      d3.select(labelRef.current).attr('x', x(newTimeValue)).text(Math.floor(newTimeValue));
      setTimeValue(newTimeValue);
    },
    [svg]
  );

  // Draw initial d3
  useEffect(() => {
    if (!svg) {
      setSvg(d3.select(svgRef.current));
      return;
    }

    const slider = svg.selectAll('.slider').attr('transform', 'translate(' + margin.left + ',' + height / 2 + ')') as Selection<SVGGElement>;

    slider
      .selectAll('.track-lines')
      .selectAll('line')
      .data(['track', 'track-inset', 'track-overlay'])
      .join('line')
      .attr('class', (d) => `${d}`)
      .attr('x1', x.range()[0])
      .attr('x2', x.range()[1]);

    slider
      .selectAll('.ticks')
      .attr('transform', 'translate(0,' + 18 + ')')
      .selectAll('text')
      .data(x.ticks(10))
      .join('text')
      .attr('x', x)
      .attr('text-anchor', 'middle')
      .text(function (d) {
        return d;
      });

    slider.call(
      d3.drag().on('drag', function (event) {
        // const me = d3.select(this);
        // ToDo: not sure why i need to substract the margin
        updateAnimation(x.invert(event.x - margin.left));
        setMoving(false);
      })
    );

    slider.selectAll('.handle').attr('r', 9);

    slider
      .selectAll('.label')
      .attr('text-anchor', 'middle')
      .text('0')
      .attr('transform', 'translate(0,' + -25 + ')');

    updateAnimation(0);
  }, [svg]);

  useInterval(() => {
    if (moving) {
      let currValInternal: number = timeValue;
      let targetValue = +svg.attr('width') - margin.left - margin.right;

      currValInternal = currValInternal + targetValue / 300;
      if (currValInternal > maxTimeValue) {
        setMoving(false);
        currValInternal = 0;

        console.log('Slider moving: ' + moving);
      }
      updateAnimation(currValInternal);
    }
  }, 100);

  return (
    <div>
      <svg ref={svgRef} width='960' height='500'>
        <g ref={sliderRef} className='slider'>
          <g className='track-lines'></g>
          <g className='ticks'></g>
          <circle ref={handleRef} className='handle'></circle>
          <text ref={labelRef} className='label'></text>
        </g>
      </svg>
      <button
        id='play-button'
        onClick={() => {
          setMoving((prevValue) => !prevValue);
        }}
      >
        {moving ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default DragSliderAnimation;
