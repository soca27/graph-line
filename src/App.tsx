import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Decimation
} from "chart.js";
import type { DecimationOptions } from "chart.js";
import { DateTime } from "luxon";
import "chartjs-adapter-luxon";
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Decimation,
  zoomPlugin
);

function valueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return typeof value === "undefined" ? defaultValue : value;
}

let _seed = 10;
function rand(min: number | undefined, max: number | undefined) {
  min = valueOrDefault(min, 0);
  max = valueOrDefault(max, 0);
  _seed = (_seed * 9301 + 49297) % 233280;
  return min + (_seed / 233280) * (max - min);
}

export default function App() {
  const canvasRef = React.useRef(undefined);
  const chartRef = React.useRef(undefined);
  const NUM_POINTS = 100000;
  const [decimation, setDecimation] = React.useState<DecimationOptions>({
    enabled: true,
    algorithm: "lttb",
  });

  const data = React.useMemo(() => {
    const start = DateTime.fromISO("2021-04-01T00:00:00Z").toMillis();

    const latitude = [];
    const latitude2 = [];
    for (let i = 0; i < NUM_POINTS; ++i) {
      // 99.9% data di range [-10, 10), 0.1% data di range [-90, 90)
      const range = Math.random() < 0.001 ? 90 : 10;
      const sign = Math.random() < 0.5 ? -1 : 1;
      const value = sign * rand(0, range); // rand(0, 10) atau rand(0, 90), dikali +/-
      latitude.push({ x: start + i * 300000, y: value });
    }
    for (let i = 0; i < NUM_POINTS; ++i) {
      const range = Math.random() < 0.001 ? 90 : 10;
      const sign = Math.random() < 0.5 ? -1 : 1;
      const value = sign * rand(0, range);
      latitude2.push({ x: start + i * 300000, y: value });
    }
    return {
      datasets: [
        {
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderWidth: 3,
          data: latitude,
          label: "Large Dataset Latitude 1",
        },
        {
          borderColor: "rgb(33, 23, 121)",
          backgroundColor: "rgba(21, 34, 150, 0.5)",
          borderWidth: 3,
          data: latitude2,
          label: "Large Dataset Latitude 2",
        }
      ]
    };
  }, []);
  
  React.useEffect(() => {
    chartRef.current = new ChartJS(canvasRef.current, {
      type: "line",
      data: data,
      options: {
        responsive: true,
        // Turn off animations and data parsing for performance
        animation: false,
        parsing: false,
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false
        },
        plugins: {
          decimation: decimation,
          zoom: {
            pan: {
              enabled: true,
              mode: "x"
            },
            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              mode: "x"
            }
          }
        },
        scales: {
          x: {
            border: {
              display: true
            },
            type: "time",
            grid: {
              color: "#808080"
            }
          },
          y: {
            grid: {
              color: "#808080"
            }
          }
        }
      }
    });

    return () => {
      chartRef.current.destroy();
    };
  }, [data, decimation]);

  const actions = [
    {
      name: "LTTB decimation (30000 samples)",
      handler() {
        setDecimation({
          enabled: true,
          algorithm: "lttb",
          samples: 30000
        });
      }
    },
    {
      name: "LTTB decimation (50000 samples)",
      handler() {
        setDecimation({
          enabled: true,
          algorithm: "lttb",
          samples: 50000
        });
      }
    }
  ];

  return (
    <>
      <div>
        {actions.map((action) => (
          <button key={action.name} type="button" onClick={action.handler}>
            {action.name} 
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} className="h-screen w-screen"  />
    </>
  );
}
