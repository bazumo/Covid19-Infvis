import {
  csv,
  interpolateSinebow,
  line,
  max,
  quantize,
  scaleSymlog,
  scaleTime,
  timeFormat
} from "d3";
import React, { useEffect, useState } from "react";
import { TimeSeriesData } from "./App";

export const CustomGraph: React.FC<{
  width: number;
  height: number;
  data?: TimeSeriesData[];
}> = ({ width, height, data }) => {
  if (!data) {
    return <div>Loading</div>;
  }

  const filteredData = data.filter(
    e => max(e.data.map(([y, x]) => x))! > 2000 && !!e.sub_unit_name
  );

  // Filter out data

  let CONTAINER_WIDTH = Math.min(width, 500);
  let CONTAINER_HEIGHT = Math.min(height, 300);
  let MARGIN_AXIS_BOTTOM = 20;
  let MARGIN_AXIS_LEFT = 50;

  if (width < 800) {
  }

  console.log(filteredData);

  const HEIGHT = CONTAINER_HEIGHT - MARGIN_AXIS_BOTTOM;
  const WIDTH = CONTAINER_WIDTH - MARGIN_AXIS_LEFT;

  const maxVal = max(
    filteredData.map(row => max(row.data.map(row => row[1]))!)
  )!;
  const minVal = 0;

  const yScale = scaleSymlog()
    .domain([minVal, maxVal * 10])
    .range([HEIGHT, 0]);

  var xScale = scaleTime()
    .domain([
      filteredData[0].data[0][0],
      filteredData[0].data[filteredData[0].data.length - 1][0]
    ])
    .range([0, WIDTH]);

  var xTicks = xScale.ticks(WIDTH / 100);
  var yTicks = [0, 1, 10, 100, 1000, 10000, 100000, 1000000];

  var formatFunction = timeFormat("%e %b");

  const lineFunction = line<[Date, number]>()
    .x((d: any) => {
      return xScale(d[0]);
    })
    .y((d: any) => {
      return yScale(d[1]);
    });

  const colors = quantize(interpolateSinebow, filteredData.length);

  return (
    <div className="d-flex align-items-center align-content-center vh-100 vw-100 justify-content-around flex-wrap">
      <div>
        <h1>This is a description</h1>
        <p>Lorem ipsum</p>
        <div>
          {filteredData.map((e, i) => (
            <p style={{ color: colors[i] }}>{e.unit_name}</p>
          ))}
        </div>
      </div>
      <div className="graph-container">
        <svg
          width={CONTAINER_WIDTH}
          height={CONTAINER_HEIGHT}
          viewBox={`${-MARGIN_AXIS_LEFT} 0 ${CONTAINER_WIDTH} ${CONTAINER_HEIGHT}`}
        >
          <g>
            {filteredData.map((d, i) => (
              <g key={i}>
                <path
                  stroke={colors[i]}
                  fill="transparent"
                  d={lineFunction(d.data)!}
                />
                {d.data.map(
                  ([x, y]) =>
                    y > 0 && (
                      <circle
                        fill={colors[i]}
                        stroke="#fff"
                        cx={xScale(x)}
                        cy={yScale(y)}
                        r="2"
                        onClick={() =>
                          alert(`${x.toISOString()}, ${d.unit_name}, ${y}`)
                        }
                      ></circle>
                    )
                )}
              </g>
            ))}
          </g>

          <g transform={`translate(0, ${HEIGHT})`}>
            <line x2={WIDTH} stroke="black"></line>

            {xTicks.map(v => (
              <g
                transform={`translate(${xScale(v)}, 0)`}
                fontSize="10"
                fontFamily="sans-serif"
                textAnchor="middle"
                key={v.getTime()}
              >
                <line y2={4} stroke="black"></line>
                <text y={9} dy="0.32em">
                  {formatFunction(v)}
                </text>
              </g>
            ))}
          </g>
          <g transform={`translate(0, 0)`}>
            <line y2={HEIGHT} stroke="black"></line>

            {yTicks.map(v => (
              <g
                transform={`translate(0, ${yScale(v)})`}
                fontSize="10"
                fontFamily="sans-serif"
                textAnchor="end"
                key={v}
              >
                <line x1={-4} stroke="black"></line>
                <text y={4} dx="-0.9em">
                  {v}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
};
