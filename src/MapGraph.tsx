import React, { useState } from "react";
import * as topojson from "topojson-client";
import { geoNaturalEarth1 } from "d3-geo";

import topology from "world-atlas/countries-50m.json";
import { TimeSeriesData } from "./App";
import {
  geoPath,
  scaleSqrt,
  max,
  scaleTime,
  timeFormat,
  rgb,
  scaleSymlog,
} from "d3";
import { Text } from "@vx/text";
import Slider from "@material-ui/core/Slider";
import { PatternWaves } from "@vx/pattern";

const water_color = "#2a2c45";
const land_color = "#ccc";
const selected_color = "#abab35";
const infected_color = "red";

const geojson: GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon
> = topojson.feature(
  topology as any,
  (topology as any).objects.countries
) as any;
console.log(geojson);

interface Props {
  width: number;
  height: number;
  data?: TimeSeriesData[];
}
export const MapGraph: React.FC<Props> = ({
  width: w,
  height: h,
  data = [],
}) => {
  const width = 1000;
  const height = 500;

  const [hover, setHover] = useState<number>();

  const processedData = data;

  const timeLength = processedData[0]?.data.length ?? 0;
  const [timeVal, setTimeVal] = useState(timeLength - 1);

  if (processedData.length == 0) {
    return null;
  }

  const maxVal = max(
    processedData.map((row) => max(row.data.map((row) => row[1]))!)
  )!;
  const minVal = 0;

  const scaleRadius = scaleSqrt().range([1, 30]).domain([minVal, maxVal]);

  var timeScale = scaleTime()
    .domain([
      processedData[0].data[0][0],
      processedData[0].data[processedData[0].data.length - 1][0],
    ])
    .range([0, processedData[0].data.length]);

  const firstDate = processedData[0].data[0][0];
  const lastDate = processedData[0].data[processedData[0].data.length - 1][0];
  const longFormat = timeFormat("%e. %b");

  var formatFunction = timeFormat("%e/%-m");

  const marks = processedData[0].data.map(([k, v], i) => ({
    value: i,
  }));

  console.log("pd", processedData);

  const points: GeoJSON.Feature<
    GeoJSON.Point,
    { name: string; size: number; cases: number }
  >[] = processedData.map((row) => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [row.long, row.lat],
      },
      properties: {
        name: [row.unit_name, row.sub_unit_name].filter((s) => !!s).join(", "),
        size: scaleRadius(row.data[timeVal]?.[1]),
        cases: row.data[timeVal]?.[1],
      },
    };
  });

  const projection = geoNaturalEarth1().center([0, 0]);
  var geoGenerator = geoPath().projection(projection);

  return (
    <div className="vw-100 vh-100 d-flex align-content-center justify-content-center align-items-center">
      <div>
        <h2>From local outbreak to pandemic</h2>

        <svg width={width} height={height} style={{ minWidth: 1000 }}>
          <PatternWaves
            id="Waves"
            height={10}
            width={10}
            stroke={rgb(water_color).brighter(1).hex()}
            strokeWidth={1}
          />

          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={water_color}
            rx={14}
          />
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#Waves)"
            rx={14}
          />
          <g>
            {geojson.features.map((feature, i) => (
              <path
                key={`map-feature-${i}`}
                d={geoGenerator(feature.geometry)!}
                fill={land_color}
                stroke={water_color}
                strokeWidth={0.5}
              />
            ))}
            {points.map(
              (p, i) =>
                p.properties.cases > 0 && (
                  <circle
                    key={p.properties.name}
                    cx={geoGenerator.centroid(p)![0]}
                    cy={geoGenerator.centroid(p)![1]}
                    r={p.properties.size}
                    fill={hover === i ? selected_color : infected_color}
                    onPointerDown={(event) => {
                      setHover(i);
                    }}
                  />
                )
            )}
          </g>
          <g transform={`translate(20, ${height - 50})`}>
            {hover !== undefined && (
              <Text fontSize={24} fill={selected_color}>{`${[
                processedData[hover].unit_name,
                processedData[hover].sub_unit_name,
              ]
                .filter((s) => !!s)
                .join(", ")}: ${processedData[hover].data[timeVal][1]}`}</Text>
            )}
          </g>

          <g
            transform={`translate(${width - 90}, ${height - 40})`}
            style={{ fontSize: "20px" }}
          >
            <rect
              className="legend-box"
              x="0"
              y="0"
              rx={14}
              height="76"
              fill="transparent"
              width="76"
            ></rect>

            {[1, 50000, 200000, 500000, 1000000].map((v, i) => (
              <>
                <circle
                  cy={20 - scaleRadius(v)}
                  cx={20}
                  r={scaleRadius(v)}
                  stroke={infected_color}
                  fill="transparent"
                ></circle>
              </>
            ))}
            {[1, 50000, 200000, 500000, 1000000].map((v, i) => (
              <>
                <text
                  fontSize={10}
                  fill="#ccc"
                  y={20 - scaleRadius(v) * 2}
                  x="2.5em"
                >
                  {v}
                </text>
              </>
            ))}
            <text fontSize={10} fill="#ccc" y={35} x="-2em">
              Total Cases in region
            </text>
          </g>
        </svg>
        <Slider
          step={null}
          valueLabelFormat={(i) => {
            console.log(i, formatFunction(processedData[0].data[i][0]));
            return formatFunction(processedData[0].data[i][0]);
          }}
          marks={marks}
          max={processedData[0].data.length - 1}
          value={timeVal}
          onChange={(e, i) => setTimeVal(i as number)}
          valueLabelDisplay="on"
        />
        <div className="small" style={{ marginTop: -15, color: "#ccc" }}>
          Timeline from {longFormat(firstDate)} to {longFormat(lastDate)}
        </div>
      </div>
    </div>
  );
};
