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

interface Props {
  width: number;
  height: number;
  data?: TimeSeriesData[];
}

const continents = {
  asia: {
    color: schemeCategory10[0]
  },
  europe: {
    color: schemeCategory10[1]
  }
};

const additionalInfo: Record<string, { color: string }> = {
  Japan: {
    color: schemeCategory10[0]
  },
  "Korea, South": { ...continents.asia },

  Singapore: { ...continents.asia },
  Italy: { ...continents.europe },
  Switzerland: { ...continents.europe },
  Germany: { ...continents.europe }
};

export const After100Graph: React.FC<Props> = ({ width, height, data }) => {
  const [selected, setSelected] = useState<string>();
  if (!data) {
    return <div>Loading</div>;
  }

  const filteredData = data
    .filter(e => Object.keys(additionalInfo).includes(e.unit_name))
    .map(e => ({ ...e, data: e.data.filter(t => t[1] >= 100) }));

  // Filter out data

  let CONTAINER_WIDTH = Math.min(width, 600);
  let CONTAINER_HEIGHT = Math.min(height, 300);
  let MARGIN_AXIS_BOTTOM = 50;
  let MARGIN_AXIS_LEFT = 90;
  let MARGIN_AXIS_RIGHT = 90;

  const HEIGHT = CONTAINER_HEIGHT - MARGIN_AXIS_BOTTOM;
  const WIDTH = CONTAINER_WIDTH - MARGIN_AXIS_LEFT - MARGIN_AXIS_RIGHT;

  const oneThirdIncreaseData = filteredData
    .reduce(
      (a, d) => (a.length < d.data.length ? d.data : a),
      [] as [Date, number][]
    )
    .slice();

  for (let i = 1; i < oneThirdIncreaseData.length; i++) {
    oneThirdIncreaseData[i] = [
      oneThirdIncreaseData[i][0],
      oneThirdIncreaseData[i - 1][1] * 1.3333333333333333333333333
    ];
  }

  console.log(oneThirdIncreaseData);
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

  return (
    <div className="d-flex align-items-center align-content-center vh-100 vw-100 justify-content-around flex-wrap">
      <div style={{ maxWidth: 300 }}>
        <h2>Development after 100ths case</h2>
        <p>
          Development of case numbers after the 100th case in selected{" "}
          <span style={{ color: continents.asia.color }}>Asian</span> and{" "}
          <span style={{ color: continents.europe.color }}>European</span>{" "}
          countries
        </p>
        <div>
          {filteredData.map((e, i) => (
            <p
              style={{
                color: additionalInfo[e.unit_name].color,
                cursor: "pointer",
                fontWeight: selected === e.unit_name ? "bold" : "normal"
              }}
              onClick={() => setSelected(e.unit_name)}
            >
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
                  strokeWidth={selected === d.unit_name ? 2 : 1}
                  d={lineFunction(d.data)!}
                  style={{ pointerEvents: "none" }}
                />
                {d.data.map(
                  ([_, y], j) =>
                    y > 0 && (
                      <circle
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelected(d.unit_name)}
                        fill={additionalInfo[d.unit_name].color}
                        stroke="#fff"
                        cx={xScale(j)}
                        cy={yScale(y)}
                        r="2"
                      ></circle>
                    )
                )}
              </g>
            ))}
          </g>

          <g>
            <path
              id="oneThirdIncreaseLine"
              stroke="#CCC"
              fill="transparent"
              strokeWidth={1}
              d={lineFunction(oneThirdIncreaseData)!}
              style={{ pointerEvents: "none" }}
            />
            <text x={340} dy="-0.5em" fontSize="10px" fill="#CCC">
              <textPath xlinkHref="#oneThirdIncreaseLine">
                33% daily increase
              </textPath>
            </text>
          </g>

          <text
            transform="rotate(-90)"
            y={0}
            x={-HEIGHT / 2}
            dy="-3em"
            style={{ textAnchor: "middle" }}
          >
            Cases
          </text>

          <g transform={`translate(0, ${HEIGHT})`}>
            <line x2={WIDTH} stroke="black"></line>
            <text y={0} x={WIDTH / 2} dy="2em" style={{ textAnchor: "middle" }}>
              Days since 100 cases
            </text>

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
