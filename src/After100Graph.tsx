import {
  csv,
  interpolateSinebow,
  line,
  max,
  quantize,
  scaleSymlog,
  scaleTime,
  timeFormat,
  scaleLinear,
  schemeCategory10
} from "d3";
import React, { useEffect, useState } from "react";
import { TimeSeriesData } from "./App";

export const After100Graph: React.FC<{
  width: number;
  height: number;
  data?: TimeSeriesData[];
}> = ({ width, height, data }) => {
  if (!data) {
    return <div>Loading</div>;
  }

  const additionalInfo: Record<string, { color: string }> = {
    Japan: {
      color: schemeCategory10[0]
    },
    Singapore: { color: schemeCategory10[0] },
    Italy: { color: schemeCategory10[1] },
    Switzerland: { color: schemeCategory10[1] },
    Germany: { color: schemeCategory10[1] }
  };

  const filteredData = data
    .filter(e => Object.keys(additionalInfo).includes(e.unit_name))
    .map(e => ({ ...e, data: e.data.filter(t => t[1] >= 100) }));

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

  const yScale = scaleSymlog()
    .domain([100, maxVal * 10])
    .range([HEIGHT, 0]);

  var xScale = scaleLinear()
    .domain([0, max(filteredData.map(r => r.data.length))! - 1])
    .range([0, WIDTH]);

  var xTicks = xScale.ticks(WIDTH / 100);
  var yTicks = [0, 1, 10, 100, 1000, 10000, 100000, 1000000];

  var formatFunction = timeFormat("%e %b");

  const lineFunction = line<[Date, number]>()
    .x((d: any, i) => {
      return xScale(i);
    })
    .y((d: any) => {
      return yScale(d[1]);
    });

  const colors = quantize(interpolateSinebow, filteredData.length);

  return (
    <div className="d-flex align-items-center align-content-center vh-100 vw-100 justify-content-around flex-wrap">
      <div style={{ maxWidth: 300 }}>
        <h2>Development after 100ths case</h2>
        <p>
          Development of case numbers after the 100th case in selected Asian and
          European countries
        </p>
        <div>
          {filteredData.map((e, i) => (
            <p style={{ color: additionalInfo[e.unit_name].color }}>
              {e.unit_name}
            </p>
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
                  stroke={additionalInfo[d.unit_name].color}
                  fill="transparent"
                  d={lineFunction(d.data)!}
                />
                {d.data.map(
                  ([_, y], j) =>
                    y > 0 && (
                      <circle
                        fill={additionalInfo[d.unit_name].color}
                        stroke="#fff"
                        cx={xScale(j)}
                        cy={yScale(y)}
                        r="2"
                        onClick={() => alert(`${j}, ${d.unit_name}, ${y}`)}
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
                key={v}
              >
                <line y2={4} stroke="black"></line>
                <text y={9} dy="0.32em">
                  {`${v} days`}
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
