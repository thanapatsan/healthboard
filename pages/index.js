import Image from "next/image";
import useSWR from "swr";
import { Chart } from "chart.js/auto";
import { Line } from "react-chartjs-2";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

// Chart.register;

export default function Home() {
  const { data, error, isLoading } = useSWR(
    "https://disease.sh/v3/covid-19/historical/all?lastdays=30",
    fetcher
  );

  let casesData = {},
    deathsData = {},
    recoveredData = {};

  if (isLoading) {
    return <span>Loading</span>;
  }

  casesData.label = Object.keys(data.cases);
  casesData.value = Object.values(data.cases);
  // casesdata = Object.values(data.cases);
  // deathsdata = Object.values(data.deaths);
  // recovereddata = Object.values(data.recovered);

  const casesChartData = {
    labels: casesData.label,
    datasets: [
      {
        label: "cases",
        data: casesData.value,
      },
    ],
  };

  return (
    <main className={`flex flex-wrap break-normal `}>
      {/* {isLoading && <h1>isLoading</h1>} */}
      {JSON.stringify(data)}
      <Line
        options={{
          responsive: true,
        }}
        data={casesChartData}
        className="max-w-md max-h-80 aspect-video"
      />
    </main>
  );
}
