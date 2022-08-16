/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
// import { BaseType, Selection } from 'd3-selection';
// import { scaleLinear } from 'd3-scale';
// import { drag } from 'd3-drag';
// import { interpolate } from 'd3-interpolate';
import * as d3 from 'd3';
import './DragSliderAnimation.css';
import useInterval from 'src/hooks/useInterval';

type Selection = d3.Selection<SVGSVGElement | null, unknown, null, undefined>;
type TSelection<T extends d3.BaseType> = d3.Selection<T | null, unknown, null, undefined>;

interface ISelections {
  handle: TSelection<SVGCircleElement>;
  label: TSelection<SVGTextElement>;
  slider: TSelection<SVGGElement>;
}

const margin = { right: 50, left: 50 };

const maxTimeValue = 180;

const DragSliderAnimation: React.FC = () => {
  const svgRef = useRef<null | SVGSVGElement>(null);
  const [svg, setSvg] = useState<null | Selection>(null);

  const [moving, setMoving] = useState(false);
  const [timeValue, setTimeValue] = useState(0);

  const [selections, setSelections] = useState<ISelections>(null);

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
      if (!selections) return;
      selections.handle.attr('cx', x(newTimeValue));
      selections.label.attr('x', x(newTimeValue)).text(Math.floor(newTimeValue));
      setTimeValue(newTimeValue);
    },
    [svg, selections]
  );

  // Draw initial d3
  useEffect(() => {
    if (!svg) {
      setSvg(d3.select(svgRef.current));
      return;
    }

    // let rect = svg.selectAll('.myRect').join('rect').attr('class', 'myRect').attr('width', 10).attr('height', 10).attr('fill', 'red');

    let slider = svg
      .selectAll('.slider')
      .data([''])
      .join('g')
      .attr('transform', 'translate(' + margin.left + ',' + height / 2 + ')') as d3.Selection<SVGGElement, unknown, null, undefined>;

    slider.selectAll('.track').data(['']).join('line').attr('class', 'track').attr('x1', x.range()[0]).attr('x2', x.range()[1]);
    slider.selectAll('.track-inset').data(['']).join('line').attr('class', 'track-inset').attr('x1', x.range()[0]).attr('x2', x.range()[1]);
    slider.selectAll('.track-overlay').data(['']).join('line').attr('class', 'track-overlay').attr('x1', x.range()[0]).attr('x2', x.range()[1]);

    // .select(function () {
    //   // ToDo: fix any
    //   return (this as any)!.parentNode.appendChild((this as any)!.cloneNode(true)) as any;
    // })
    // .attr('class', 'track-inset')
    // .select(function () {
    //   return (this as any)!.parentNode.appendChild((this as any)!.cloneNode(true));
    // })
    // .attr('class', 'track-overlay');

    slider
      .selectAll('.ticks')
      .data([''])
      .join('g')
      .attr('class', 'ticks')
      .attr('transform', 'translate(0,' + 18 + ')')
      .selectAll('text')
      .data(x.ticks(10))
      .join('text')
      .attr('x', x)
      .attr('text-anchor', 'middle')
      .text(function (d) {
        return d;
      });

    // const handle = slider.insert('circle').attr('class', 'handle').attr('r', 9);

    const handle = slider.selectAll('.handle').data(['']).join('circle').attr('class', 'handle').attr('r', 9) as TSelection<SVGCircleElement>;

    var label = slider
      .selectAll('.label')
      .data([''])
      .join('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .text('0')
      .attr('transform', 'translate(0,' + -25 + ')') as TSelection<SVGTextElement>;

    setSelections({ handle, label, slider });
  }, [svg]);

  // Add drag handler
  useEffect(() => {
    if (!selections) return;

    const { slider } = selections;

    slider.call(
      d3.drag().on('drag', function (event) {
        // const me = d3.select(this);
        // ToDo: not sure why i need to substract the margin
        updateAnimation(x.invert(event.x - margin.left));
        setMoving(false);
      })
    );

    // cool effect but remove for mow
    // slider
    //   .transition() // Gratuitous intro!
    //   .duration(750)
    //   .tween('hue', function () {
    //     var i = d3.interpolate(20, 0);
    //     return function (t) {
    //       updateAnimation(i(t));
    //     };
    //   });
    updateAnimation(0);
  }, [selections]);

  useInterval(() => {
    if (moving) {
      let currValInternal: number = timeValue;
      let targetValue = +svg.attr('width') - margin.left - margin.right;

      console.log('step');

      currValInternal = currValInternal + targetValue / 300;
      if (currValInternal > maxTimeValue) {
        setMoving(false);
        currValInternal = 0;

        console.log('Slider moving: ' + moving);
      }
      updateAnimation(currValInternal);
    }
  }, 100);

  // Step time when moving
  // useEffect(() => {
  //   if (!svg) return;

  //   let timer = null;

  //   let currValInternal: number = timeValue;
  //   let targetValue = +svg.attr('width') - margin.left - margin.right;

  //   const step = () => {
  //     console.log('step');

  //     currValInternal = currValInternal + targetValue / 300;
  //     if (currValInternal > maxTimeValue) {
  //       setMoving(false);
  //       currValInternal = 0;
  //       clearInterval(timer);
  //       console.log('Slider moving: ' + moving);
  //     }
  //     updateAnimation(currValInternal);
  //   };

  //   if (moving) {
  //     timer = setInterval(step, 100);
  //     console.log('set interval');
  //   }
  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [moving]);

  return (
    <div>
      <svg ref={svgRef} width='960' height='500'>
        {/* <g className='slider'></g> */}
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
