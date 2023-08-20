import Image from "next/image";
import useSWR from "swr";
import { Chart } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useState } from "react";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

// Chart.register;

export default function Home() {
  const [dayRange, setDayrange] = useState(30);

  const { data, error, isLoading } = useSWR(
    `https://disease.sh/v3/covid-19/historical/all?lastdays=${dayRange}`,
    fetcher
  );

  let casesData = {},
    deathsData = {},
    recoveredData = {};

  if (isLoading) {
    return <span>Loading</span>;
  }

  if (error) {
    return <span>{JSON.stringify(error)}</span>;
  }

  casesData.label = Object.keys(data.cases);
  casesData.value = Object.values(data.cases);

  const casesChartData = {
    labels: casesData.label,
    datasets: [
      {
        label: "cases",
        data: casesData.value,
      },
    ],
  };

  deathsData.label = Object.keys(data.deaths);
  deathsData.value = Object.values(data.deaths);

  const deathsChartData = {
    labels: deathsData.label,
    datasets: [
      {
        label: "deaths",
        data: deathsData.value,
      },
    ],
  };

  recoveredData.label = Object.keys(data.recovered);
  recoveredData.value = Object.values(data.recovered);

  const recoveredChartData = {
    labels: recoveredData.label,
    datasets: [
      {
        label: "recovered",
        data: recoveredData.value,
      },
    ],
  };

  return (
    <main className="container mt-8 mx-auto">
      <div className="flex flex-row gap-2">
        <button onClick={() => setDayrange(10)}>10 days</button>
        <button onClick={() => setDayrange(30)}>30 days</button>
        <button onClick={() => setDayrange(60)}>60 days</button>
        <button onClick={() => setDayrange(90)}>90 days</button>
      </div>

      <div className="flex flex-row gap-2">
        {isLoading ? (
          <>loagin</>
        ) : (
          <>
            <ValueCard
              label={"cases"}
              timestamp={casesData["label"].slice(-1)}
              value={casesData["value"].slice(-1)}
            />
            <ValueCard
              label={"deaths"}
              timestamp={deathsData["label"].slice(-1)}
              value={deathsData["value"].slice(-1)}
            />
            <ValueCard
              label={"recovered"}
              timestamp={recoveredData["label"].slice(-1)}
              value={recoveredData["value"].slice(-1)}
            />
          </>
        )}
      </div>

      <div className="flex flex-row gap-4">
        <section>
          <Line
            options={{
              responsive: true,
              elements: { point: { radius: 0 } },
            }}
            data={casesChartData}
            className=""
          />
          <DataTable data={Object.entries(data.cases)} />
        </section>

        <section>
          <Line
            options={{
              responsive: true,
              elements: { point: { radius: 0 } },
            }}
            data={deathsChartData}
            className=""
          />
          <DataTable data={Object.entries(data.deaths)} />
        </section>

        <section>
          <Line
            options={{
              responsive: true,
              elements: { point: { radius: 0 } },
            }}
            data={recoveredChartData}
            className=""
          />
          <DataTable data={Object.entries(data.recovered)} />
        </section>
      </div>
    </main>
  );
}

function DataTable({ data }) {
  return (
    <table className="prose">
      <thead>
        <tr>
          <th>วันที่</th>
          <th>จำนวน</th>
        </tr>
      </thead>
      <tbody>
        {data.toReversed().map((item, key) => (
          <tr key={key}>
            <td>
              {new Intl.DateTimeFormat("th-TH").format(new Date(item[0]))}
            </td>
            <td>{new Intl.NumberFormat().format(item[1])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ValueCard({ label, value, timestamp }) {
  return (
    <span>
      <p>{label}</p>
      <p>{value}</p>
      <p>{timestamp}</p>
    </span>
  );
}
