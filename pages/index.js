import Image from "next/image";
import useSWR from "swr";
import { Chart } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { useCallback, useRef, useState } from "react";
import { Sarabun } from "next/font/google";

const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["400", "700"] });

export default function Home() {
  Chart.register;
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const [dayRange, setDayrange] = useState(30);

  const { data, error, isLoading } = useSWR(
    `https://disease.sh/v3/covid-19/historical/all?lastdays=${dayRange}`,
    fetcher
  );

  const dayFormRef = useRef(null);
  const formHandler = useCallback(
    () => (event) => {
      event.preventDefault();

      console.log("dayformref", dayFormRef.current?.value);
      setDayrange(dayFormRef.current?.value);
    },
    []
  );

  let casesData = {},
    deathsData = {},
    recoveredData = {};

  if (isLoading) {
    return <span>Loading</span>;
  }

  if (error) {
    return <span>{JSON.stringify(error.code)}</span>;
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
    <main className={`container px-2 sm:px-4 mx-auto ${sarabun.className}`}>
      <div className="fixed top-0 right-0 m-8 p-3 text-xs font-mono text-white h-6 w-6 rounded-full flex items-center justify-center bg-gray-700 sm:bg-pink-500 md:bg-orange-500 lg:bg-green-500 xl:bg-blue-500">
        <div className="block  sm:hidden md:hidden lg:hidden xl:hidden">xs</div>
        <div className="hidden sm:block  md:hidden lg:hidden xl:hidden">sm</div>
        <div className="hidden sm:hidden md:block  lg:hidden xl:hidden">md</div>
        <div className="hidden sm:hidden md:hidden lg:block  xl:hidden">lg</div>
        <div className="hidden sm:hidden md:hidden lg:hidden xl:block">xl</div>
      </div>

      <div className="flex flex-row gap-2 my-4">
        <button onClick={() => setDayrange(10)}>15 days</button>
        <button onClick={() => setDayrange(30)}>30 days</button>
        <button onClick={() => setDayrange(90)}>90 days</button>
        <form onSubmit={formHandler()}>
          <input type="number" ref={dayFormRef} className="border" />
          <input type="submit" />
        </form>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 my-4">
        <ValueCard
          label={"ติดเชื้อ"}
          timestamp={casesData["label"].slice(-1)}
          value={casesData["value"].slice(-1)}
          className={"bg-red-400"}
        />
        <ValueCard
          label={"เสียชีวิต"}
          timestamp={deathsData["label"].slice(-1)}
          value={deathsData["value"].slice(-1)}
          className={"bg-slate-400"}
        />
        <ValueCard
          label={"หายแล้ว"}
          timestamp={recoveredData["label"].slice(-1)}
          value={recoveredData["value"].slice(-1)}
          className={"bg-blue-400"}
        />
      </div>

      <div className="w-full flex flex-col md:flex-row columns-3 gap-4 my-4">
        <section className="md:w-1/3">
          <h2 className="text-2xl">ติดเชื้อ</h2>
          <Line
            options={{
              responsive: true,
              elements: { point: { radius: 0 } },
            }}
            data={casesChartData}
          />

          <DataTable data={Object.entries(data.cases)} />
        </section>
        <section className="md:w-1/3">
          <h2 className="text-2xl">เสียชีวิต</h2>

          <Line
            options={{
              responsive: true,
              elements: { point: { radius: 0 } },
            }}
            data={deathsChartData}
          />
          <DataTable data={Object.entries(data.deaths)} />
        </section>
        <section className="md:w-1/3">
          <h2 className="text-2xl">หายแล้ว</h2>

          <Line
            options={{
              responsive: true,
              elements: { point: { radius: 0 } },
            }}
            data={recoveredChartData}
          />
          <DataTable data={Object.entries(data.recovered)} />
        </section>
      </div>
    </main>
  );
}

function DataTable({ data }) {
  return (
    <table className="prose w-full">
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

function ValueCard({ label, value, timestamp, className }) {
  return (
    <span className={`py-4 px-6 ${className}`}>
      <p>{label}</p>
      <p className="text-4xl py-2 font-semibold">
        {new Intl.NumberFormat().format(value)}
      </p>
      <p>{new Intl.DateTimeFormat("th-TH").format(new Date(timestamp))}</p>
    </span>
  );
}
