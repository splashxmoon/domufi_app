import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);


function generateMockSeries(range) {
  let points = 30;
  if (range === "1M") points = 30;
  if (range === "6M") points = 26; 
  if (range === "1Y") points = 12;

  const labels = Array.from({ length: points }, (_, i) => `T${i + 1}`);
  
  const data = labels.map(() => 0);

  return { labels, data };
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  elements: {
    line: { tension: 0.25, borderWidth: 2 },
    point: { radius: 0 },
  },
  scales: {
    x: {
      type: "category",
      grid: { display: false },
      ticks: { 
        color: "#cbd5e1", 
        autoSkip: true, 
        maxTicksLimit: 8,
        font: { size: 12, weight: '500' },
        padding: 8
      },
    },
    y: {
      grid: { 
        color: "rgba(255,255,255,0.03)",
        drawBorder: false
      },
      ticks: { 
        color: "#cbd5e1",
        font: { size: 12, weight: '500' },
        padding: 8,
        callback: function(value) {
          return '$' + value.toFixed(0);
        }
      },
      beginAtZero: true,
      min: 0,
    },
  },
  layout: {
    padding: {
      bottom: 12,
      left: 8,
      right: 8,
      top: 8
    }
  },
};

export default function PerformanceChart({ range = "1M", series }) {
  const generated = useMemo(() => generateMockSeries(range), [range]);

  const chartData = useMemo(() => {
    const labels = series?.labels || generated.labels;
    const values = series?.data || generated.data;
    
    
    const allZero = values.every(value => value === 0);
    
    return {
      labels,
      datasets: [
        {
          label: "Portfolio",
          data: values,
          borderColor: allZero ? "#9ca3af" : "#10b981",
          backgroundColor: allZero ? "rgba(156,163,175,0.12)" : "rgba(16,185,129,0.12)",
          fill: true,
        },
      ],
    };
  }, [generated, series]);

  const chartKey = `${range}-${chartData.labels.length}-${chartData.datasets[0].data.slice(0,3).join(',')}`;

  
  const values = series?.data || generated.data;
  const allZero = values.every(value => value === 0);

  if (allZero) {
    return (
      <div style={{ 
        width: "100%", 
        height: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          <div style={{ 
            marginBottom: '16px',
            color: '#6b7280',
            opacity: 0.7,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontWeight: '500', marginBottom: '8px' }}>No performance data yet</div>
          <div>Start investing to see your portfolio performance</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 320, paddingBottom: '8px' }}>
      <Line key={chartKey} data={chartData} options={defaultOptions} />
    </div>
  );
}
