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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);


function generateMockIncomeSeries(range, cumulative = false) {
  let points = 30;
  if (range === "1W") points = 7;
  if (range === "1M") points = 30;
  if (range === "6M") points = 26; 
  if (range === "1Y") points = 12; 

  const labels = Array.from({ length: points }, (_, i) => {
    if (range === "1W") return `Day ${i + 1}`;
    if (range === "1M") return `Day ${i + 1}`;
    if (range === "6M") return `Week ${i + 1}`;
    if (range === "1Y") return `Month ${i + 1}`;
    return `T${i + 1}`;
  });
  
  let data = labels.map(() => Math.random() * 5 + 1); 

  if (cumulative) {
    let cumulativeSum = 0;
    data = data.map(value => {
      cumulativeSum += value;
      return cumulativeSum;
    });
  }

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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13, weight: '600' },
      bodyFont: { size: 13 },
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 1,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
          }
          return label;
        }
      }
    },
  },
  elements: {
    line: { 
      tension: 0.4, 
      borderWidth: 3,
      borderCapStyle: 'round',
      borderJoinStyle: 'round'
    },
    point: { 
      radius: 0,
      hoverRadius: 6,
      hoverBorderWidth: 2,
      hoverBorderColor: '#10b981',
      hoverBackgroundColor: '#10b981'
    },
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

export default function RentalIncomeChart({ range = "1M", series, cumulative = false }) {
  const generated = useMemo(() => generateMockIncomeSeries(range, cumulative), [range, cumulative]);

  const chartData = useMemo(() => {
    const labels = series?.labels || generated.labels;
    const values = series?.data || generated.data;
    
    const allZero = values.every(value => value === 0);
    
    return {
      labels,
      datasets: [
        {
          label: cumulative ? "Cumulative Income" : "Daily Income",
          data: values,
          borderColor: allZero ? "#9ca3af" : "#10b981",
          backgroundColor: allZero 
            ? "rgba(156,163,175,0.12)" 
            : cumulative
              ? "rgba(16,185,129,0.15)"
              : "rgba(16,185,129,0.08)",
          fill: true,
        },
      ],
    };
  }, [generated, series, cumulative]);

  const chartKey = `${range}-${cumulative}-${chartData.labels.length}-${chartData.datasets[0].data.slice(0,3).join(',')}`;

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
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontWeight: '500', marginBottom: '8px', color: '#ffffff' }}>No income data yet</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Start investing to see your rental income grow</div>
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




