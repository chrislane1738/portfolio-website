'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface PeerChartProps {
  targetTicker: string;
  targetPE: number;
  peerPEs: { ticker: string; pe: number }[];
  peerAveragePE: number;
  peerMedianPE: number;
  fairEstimatePE: number;
}

export default function PeerChart({ 
  targetTicker, 
  targetPE, 
  peerPEs, 
  peerAveragePE, 
  peerMedianPE, 
  fairEstimatePE 
}: PeerChartProps) {
  // Prepare data for the chart
  const allCompanies = [
    { ticker: targetTicker, pe: targetPE, isTarget: true },
    ...peerPEs.map(p => ({ ...p, isTarget: false }))
  ].filter(c => c.pe > 0);

  const labels = allCompanies.map(company => company.ticker);
  const dataValues = allCompanies.map(company => company.pe);
  const backgroundColors = allCompanies.map(company => 
    company.isTarget ? 'rgba(59, 130, 246, 0.8)' : 'rgba(156, 163, 175, 0.8)'
  );
  const borderColors = allCompanies.map(company => 
    company.isTarget ? 'rgba(59, 130, 246, 1)' : 'rgba(156, 163, 175, 1)'
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'P/E Ratio',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Peer P/E Comparison',
        color: '#ffffff',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed.y.toFixed(2)}`;
          }
        }
      },
      annotation: {
        annotations: {
          averageLine: {
            type: 'line' as const,
            yMin: peerAveragePE,
            yMax: peerAveragePE,
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: `Peer Average: ${peerAveragePE.toFixed(2)}`,
              enabled: true,
              position: 'end' as const,
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              color: 'white',
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
          },
          medianLine: {
            type: 'line' as const,
            yMin: peerMedianPE,
            yMax: peerMedianPE,
            borderColor: 'rgb(234, 179, 8)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: `Peer Median: ${peerMedianPE.toFixed(2)}`,
              enabled: true,
              position: 'end' as const,
              backgroundColor: 'rgba(234, 179, 8, 0.8)',
              color: 'white',
              font: {
                size: 12,
                weight: 'bold' as const,
              },
            },
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#B0B0B0',
          maxRotation: 45,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#B0B0B0',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Peer P/E Comparison</h3>
      
      <div className="h-96">
        <Bar data={data} options={options} />
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-gray-300">{targetTicker} (Target)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
          <span className="text-gray-300">Peer Companies</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-red-500 border-dashed border-t-2 mr-2"></div>
          <span className="text-gray-300">Peer Average</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-yellow-500 border-dashed border-t-2 mr-2"></div>
          <span className="text-gray-300">Peer Median</span>
        </div>
      </div>
    </div>
  );
}