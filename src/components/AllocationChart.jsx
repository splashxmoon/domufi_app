import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AllocationChart({ allocationData, labels = [], data = [], colors = [] }) {
  
  const chartLabels = allocationData?.labels || labels;
  const chartDataValues = allocationData?.data || data;
  const chartColors = allocationData?.colors || colors;

  
  const total = chartDataValues.reduce((sum, val) => sum + val, 0);
  const percentages = chartDataValues.map(val => total > 0 ? (val / total * 100) : 0);

  const chartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        data: chartDataValues,
        backgroundColor: chartColors.length ? chartColors : [
          '#3b82f6', 
          '#10b981', 
          '#8b5cf6', 
          '#f59e0b', 
          '#ef4444', 
          '#06b6d4', 
          '#84cc16', 
          '#f97316', 
          '#ec4899', 
          '#6366f1'  
        ],
        borderWidth: 0,
      },
    ],
  }), [chartLabels, chartDataValues, chartColors]);

  
  if (!chartDataValues || chartDataValues.length === 0 || chartDataValues.every(value => value === 0)) {
    return (
      <div style={{ 
        width: '100%', 
        height: 320, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'transparent', 
        borderRadius: '8px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#9ca3af', 
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          {}
          <div style={{ 
            marginBottom: '16px',
            color: '#6b7280', 
            opacity: 0.7,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.2104 15.8899C20.5742 17.3944 19.5792 18.7202 18.3123 19.7512C17.0454 20.7823 15.5452 21.4874 13.9428 21.8047C12.3405 22.1221 10.6848 22.0421 9.12055 21.5717C7.55627 21.1014 6.13103 20.255 4.96942 19.1066C3.80782 17.9582 2.94522 16.5427 2.45704 14.9839C1.96886 13.4251 1.86996 11.7704 2.169 10.1646C2.46804 8.55873 3.1559 7.05058 4.17245 5.77198C5.189 4.49338 6.50329 3.48327 8.0004 2.82995M21.2392 8.17311C21.6395 9.13958 21.8851 10.1613 21.9684 11.2008C21.989 11.4576 21.9993 11.586 21.9483 11.7017C21.9057 11.7983 21.8213 11.8897 21.7284 11.9399C21.6172 11.9999 21.4783 11.9999 21.2004 11.9999H12.8004C12.5204 11.9999 12.3804 11.9999 12.2734 11.9455C12.1793 11.8975 12.1028 11.821 12.0549 11.7269C12.0004 11.62 12.0004 11.48 12.0004 11.1999V2.79995C12.0004 2.52208 12.0004 2.38315 12.0605 2.27193C12.1107 2.17903 12.2021 2.09464 12.2987 2.05204C12.4144 2.00105 12.5428 2.01134 12.7996 2.03193C13.839 2.11527 14.8608 2.36083 15.8272 2.76115C17.0405 3.2637 18.1429 4.00029 19.0715 4.92888C20.0001 5.85747 20.7367 6.95986 21.2392 8.17311Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontWeight: '500', marginBottom: '8px', textAlign: 'center', width: '100%' }}>No investments yet</div>
          <div style={{ textAlign: 'center', width: '100%' }}>Start investing to see your allocation breakdown</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div style={{ 
        width: '100%', 
        height: 320, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Doughnut 
          data={chartData} 
          options={{ 
            maintainAspectRatio: false, 
            cutout: '60%',
            plugins: { 
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 13 },
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00';
                    return `${label}: $${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percentage}%)`;
                  }
                }
              }
            } 
          }} 
        />
      </div>
      
      {}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {chartLabels.map((label, index) => {
          const percentage = percentages[index];
          const color = chartColors[index] || chartData.datasets[0].backgroundColor[index];
          
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  flex: 1
                }}>
                  {label}
                </span>
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: color,
                marginLeft: '12px'
              }}>
                {percentage.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
