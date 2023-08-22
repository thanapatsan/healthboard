import Head from "next/head";
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
      // console.log("dayformref", dayFormRef.current?.value);
      setDayrange(dayFormRef.current?.value);
    },
    []
  );

  let casesData = {},
    deathsData = {},
    recoveredData = {};

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <h1 className="text-center font-bold text-2xl text-slate-500">
          กำลังโหลด...
        </h1>
      </div>
    );
  }

  if (error) {
    console.log({ error });
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <h1 className="text-center font-bold text-xl text-red-500">
          ไม่สามารถโหลดข้อมูลได้ กรุณารีเฟรชหน้าเว็บ
        </h1>
      </div>
    );
  }

  casesData.label = Object.keys(data.cases);
  casesData.value = Object.values(data.cases);

  const casesChartData = {
    labels: casesData.label,
    datasets: [
      {
        label: "cases",
        data: casesData.value,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
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
        borderColor: "#64748b",
        backgroundColor: "#64748b",
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
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <>
      <Head>
        <title>สถิติผู้ป่วย - HealthBoard</title>
      </Head>
      <main
        className={`lg:container px-2 sm:px-4 mx-auto ${sarabun.className}`}
      >

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 my-4 ">
          <div className="flex items-center basis-full lg:basis-auto">
            <h1 className="items-center text-2xl h-fit">
              สถิติผู้ป่วย COVID-19 ทั่วโลก
            </h1>
          </div>
          <div className="flex flex-row gap-2 flex-wrap">
            <button
              onClick={() => setDayrange(15)}
              className={
                `flex-1 btn ` + (dayRange == 15 ? "btn-active btn-primary" : "")
              }
            >
              15 วัน
            </button>
            <button
              onClick={() => setDayrange(30)}
              className={
                `flex-1 btn ` + (dayRange == 30 ? "btn-active btn-primary" : "")
              }
            >
              30 วัน
            </button>
            <button
              onClick={() => setDayrange(90)}
              className={
                `flex-1 btn ` + (dayRange == 90 ? "btn-active btn-primary" : "")
              }
            >
              90 วัน
            </button>
          </div>
          <form onSubmit={formHandler()} className="flex flex-row gap-2">
            <input
              type="number"
              ref={dayFormRef}
              placeholder="จำนวนวัน"
              className="flex-1 input input-bordered"
            />
            <button type="submit" className="btn">
              เปลี่ยน
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 my-8">
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
      <footer className="flex flex-col justify-center items-center my-2">
        <span className="text-center text-slate-500 ">
          ข้อมูลจาก{" "}
          <a
            href="https://disease.sh/docs/#/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            disease.sh
          </a>
        </span>
      </footer>
    </>
  );
}

function DataTable({ data }) {
  return (
    <table className="prose w-full my-4">
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
