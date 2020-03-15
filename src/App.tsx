import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.scss";
import { After100Graph } from "./After100Graph";
import { ParentSize } from "@vx/responsive";
import { useWindowSize } from "./useWindowSize";
import { MapGraph } from "./MapGraph";
import { csv } from "d3";

export interface TimeSeriesData {
  unit_name: string;
  sub_unit_name: string;
  lat: number;
  long: number;
  data: [Date, number][];
}

const dataset_url = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv`;

function App() {
  const { width, height } = useWindowSize();

  const [data, setData] = useState<TimeSeriesData[]>();

  useEffect(() => {
    csv(dataset_url).then(res => {
      console.log("RES", res);
      const d: TimeSeriesData[] = res.map(row => ({
        unit_name: row["Country/Region"]!,
        sub_unit_name: row["Province/State"]!,
        lat: parseFloat(row["Lat"]!),
        long: parseFloat(row["Long"]!),
        data: Object.entries(row)
          .filter(([k, _]) => parseInt(k) > 0)
          .map(([k, v]) => {
            // date is MM/DD/YY
            const parts = k.split("/").map(s => parseInt(s));
            const date = new Date(2000 + parts[2], parts[0] - 1, parts[1]);
            return [date, parseInt(v!)];
          })
      }));
      setData(d);
    });
  }, []);

  if (!width || !height) {
    return null;
  }
  return (
    <div>
      <section className="intro d-flex align-items-center align-content-center vh-100 vw-100 justify-content-center">
        <div>
          <h1>COVID-19 in Graphs</h1>
          <h2>
            How the world went from business as usual to pandemic emergency
          </h2>
        </div>
      </section>

      <section className="graph-2">
        <MapGraph width={width} height={height} data={data}></MapGraph>
      </section>

      <section className="d-flex align-items-center align-content-center vw-100 justify-content-center intersection">
        <div style={{ margin: "150px 20px" }}>
          <h2>Asia vs Europe</h2>
          <h3>Some countries seem to contain the spread better than other</h3>
        </div>
      </section>
      <section className="graph-1">
        <After100Graph
          width={width}
          height={height}
          data={data}
        ></After100Graph>
      </section>
    </div>
  );
}

export default App;
