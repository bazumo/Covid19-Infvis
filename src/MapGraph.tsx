import React, { useState } from "react";
import * as topojson from "topojson-client";
import { geoNaturalEarth1 } from "d3-geo";

import topology from "world-atlas/countries-50m.json";
import { TimeSeriesData } from "./App";
import { geoPath, scaleSqrt, max, scaleTime, timeFormat } from "d3";
import { Text } from "@vx/text";
import Slider from "@material-ui/core/Slider";
console.log(topology);

const bg = "#fecdce";
const purple = "#201c4e";

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
  data = []
}) => {
  const width = 1000; //Math.min(1000, w);
  const height = 500; //Math.min(500, h);
  const scaleFactor = 630;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / scaleFactor) * 100;

  const [hover, setHover] = useState<number>();

  /*
  const processedData = Object.values(
    data.reduce(
      (acc, row) => ({
        ...acc,
        [row.unit_name]: {
          ...row,
          data: row.data.map(
            ([k, v], i) =>
              [k, v + (acc[row.unit_name]?.data[i][1] ?? 0)] as [Date, number]
          )
        }
      }),
      {} as Record<string, TimeSeriesData>
    )
  );*/

  const processedData = data;

  const timeLength = processedData[0]?.data.length ?? 0;

  const [timeVal, setTimeVal] = useState(timeLength - 1);

  if (processedData.length == 0) {
    return null;
  }

  const maxVal = max(
    processedData.map(row => max(row.data.map(row => row[1]))!)
  )!;
  const minVal = 0;

  const scaleRadius = scaleSqrt()
    .range([1, 20])
    .domain([minVal, maxVal]);

  var timeScale = scaleTime()
    .domain([
      processedData[0].data[0][0],
      processedData[0].data[processedData[0].data.length - 1][0]
    ])
    .range([0, processedData[0].data.length]);

  var formatFunction = timeFormat("%e/%-m");

  const marks = processedData[0].data.map(([k, v], i) => ({
    value: i
  }));

  console.log("pd", processedData);

  const points: GeoJSON.Feature<
    GeoJSON.Point,
    { name: string; size: number; cases: number }
  >[] = processedData.map(row => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [row.long, row.lat]
      },
      properties: {
        name: [row.unit_name, row.sub_unit_name].filter(s => !!s).join(", "),
        size: scaleRadius(row.data[timeVal]?.[1]),
        cases: row.data[timeVal]?.[1]
      }
    };
  });

  const projection = geoNaturalEarth1().center([0, 0]);
  var geoGenerator = geoPath().projection(projection);

  return (
    <div className="vw-100 vh-100 d-flex align-content-center justify-content-center align-items-center">
      <div>
        <h2>From local outbreak to pandemic</h2>

        <svg width={width} height={height} style={{ minWidth: 1000 }}>
          <rect x={0} y={0} width={width} height={height} fill={bg} rx={14} />
          <g>
            {geojson.features.map((feature, i) => (
              <path
                key={`map-feature-${i}`}
                d={geoGenerator(feature.geometry)!}
                fill="#123"
                stroke={bg}
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
                    fill={hover === i ? "green" : "red"}
                    onPointerDown={event => {
                      setHover(i);
                    }}
                  />
                )
            )}
          </g>
          <g transform={`translate(20, ${height - 50})`}>
            {hover !== undefined && (
              <Text fontSize={24} fill={purple}>{`${[
                processedData[hover].unit_name,
                processedData[hover].sub_unit_name
              ]
                .filter(s => !!s)
                .join(", ")}: ${processedData[hover].data[timeVal][1]}`}</Text>
            )}
          </g>
        </svg>
        <Slider
          step={null}
          valueLabelFormat={i => {
            console.log(i, formatFunction(processedData[0].data[i][0]));
            return formatFunction(processedData[0].data[i][0]);
          }}
          marks={marks}
          max={processedData[0].data.length - 1}
          value={timeVal}
          onChange={(e, i) => setTimeVal(i as number)}
          valueLabelDisplay="on"
        />
      </div>
    </div>
  );
};
