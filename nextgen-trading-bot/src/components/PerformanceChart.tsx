'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceData {
  date: string;
  portfolio: number;
  benchmark: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

const timeRanges = [
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '1Y', value: '1Y' },
  { label: 'ALL', value: 'ALL' }
];

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
  const [showBenchmark, setShowBenchmark] = useState(true);

  if (!data || data.length === 0) return null;

  const calculateReturns = (data: PerformanceData[]) => {
    if (data.length === 0) return { totalReturn: 0, annualizedReturn: 0 };
    
    const initial = data[0].portfolio;
    const final = data[data.length - 1].portfolio;
    const totalReturn = ((final - initial) / initial) * 100;
    
    return { totalReturn, annualizedReturn: totalReturn };
  };

  const { totalReturn } = calculateReturns(data);
  const isPositive = totalReturn >= 0;

  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString();
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatTooltipValue(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Portfolio Performance
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={`text-xl font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Since Start
            </span>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-1 mt-4 sm:mt-0">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setSelectedTimeRange(range.value)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                selectedTimeRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line 
              type="monotone" 
              dataKey="portfolio" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={false}
              name="Portfolio"
            />
            
            {showBenchmark && (
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="S&P 500"
              />
            )}
            
            <ReferenceLine y={data[0]?.portfolio} stroke="#d1d5db" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showBenchmark}
              onChange={(e) => setShowBenchmark(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Show S&P 500 Benchmark</span>
          </label>
        </div>
        
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}