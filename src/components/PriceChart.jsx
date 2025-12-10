import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Filler,
  Legend
);

const PriceChart = ({ priceHistory = [], timeframe = '24h', currentPrice = 0 }) => {
  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];

    const now = Date.now();
    let cutoffTime;

    switch (timeframe) {
      case '24h':
        cutoffTime = now - (24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = now - (24 * 60 * 60 * 1000);
    }

    return priceHistory.filter(point => point.timestamp >= cutoffTime);
  }, [priceHistory, timeframe]);

  // Calculate min/max for better scaling
  const { minPrice, maxPrice } = useMemo(() => {
    if (filteredData.length === 0) {
      return { minPrice: 0, maxPrice: 100 };
    }

    const prices = filteredData.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // 10% padding

    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding
    };
  }, [filteredData]);

  // Chart data
  const chartData = {
    datasets: [
      {
        label: 'Price',
        data: filteredData.map(point => ({
          x: point.timestamp,
          y: point.price
        })),
        borderColor: 'rgba(59, 130, 246, 1)', // var(--accent-blue)
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        borderWidth: 2
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(22, 24, 29, 0.95)', // var(--bg-card)
        titleColor: '#f8f9fa',
        bodyColor: '#f8f9fa',
        borderColor: '#2a2d36',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          },
          label: (context) => {
            return `$${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeframe === '24h' ? 'hour' : timeframe === '7d' ? 'day' : 'day',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd'
          }
        },
        grid: {
          color: 'rgba(42, 45, 54, 0.5)', // var(--border-primary) with opacity
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af', // var(--text-secondary)
          maxRotation: 0,
          autoSkipPadding: 20
        }
      },
      y: {
        min: minPrice,
        max: maxPrice,
        grid: {
          color: 'rgba(42, 45, 54, 0.5)',
          drawBorder: false
        },
        ticks: {
          color: '#9ca3af',
          callback: (value) => `$${value.toFixed(2)}`
        }
      }
    }
  };

  // Empty state
  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary, #9ca3af)',
        fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 12px' }}>
            <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 9l-5 5-4-4-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>No price data available</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Price history will appear once trading begins
          </div>
        </div>
      </div>
    );
  }

  // No data for selected timeframe
  if (filteredData.length === 0) {
    return (
      <div style={{
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary, #9ca3af)',
        fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>No data for {timeframe} timeframe</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Try a different timeframe
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PriceChart;
