'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphDataPoint {
  year: number;
  balance: number;
}

interface InvestmentGraphProps {
  graphData: GraphDataPoint[];
}

export default function InvestmentGraph({ graphData }: InvestmentGraphProps) {
  // Prepare data for Chart.js
  const labels = graphData.map(point => `Year ${point.year}`);
  const data = graphData.map(point => point.balance);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Investment Balance',
        data,
        borderColor: 'rgb(59, 130, 246)', // Blue color
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)', // Gray color for text
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Investment Growth Over Time',
        color: 'rgb(255, 255, 255)', // White color
        font: {
          size: 18,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            return `Balance: $${value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Years',
          color: 'rgb(156, 163, 175)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Balance ($)',
          color: 'rgb(156, 163, 175)',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value: any) {
            return '$' + value.toLocaleString('en-US');
          },
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
    },
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6 border border-gray-700">
      <div className="h-96">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
