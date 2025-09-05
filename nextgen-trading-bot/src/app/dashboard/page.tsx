'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { TrendingUp, DollarSign, BarChart3, Clock, Settings, Play, Pause } from 'lucide-react';
import PerformanceChart from '@/components/PerformanceChart';
import PositionsTable from '@/components/PositionsTable';
import { generateMockPortfolioData, generateMockPositions } from '@/lib/mockData';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get('mode') || 'paper';
  const [isActive, setIsActive] = useState(mode === 'paper');
  const [portfolioData, setPortfolioData] = useState(generateMockPortfolioData());
  const [positions, setPositions] = useState(generateMockPositions());

  // Simulate real-time updates
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPortfolioData(prev => {
        const lastValue = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 1000; // Random change
        const newValue = Math.max(0, lastValue.portfolio + change);
        
        return [...prev.slice(-29), {
          ...lastValue,
          date: new Date().toISOString(),
          portfolio: newValue,
          benchmark: lastValue.benchmark + (change * 0.7) // Benchmark moves less
        }];
      });

      // Update positions with small random changes
      setPositions(prev => prev.map(pos => ({
        ...pos,
        currentPrice: pos.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        unrealizedPnL: pos.unrealizedPnL + (Math.random() - 0.5) * 100
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive]);

  const currentValue = portfolioData[portfolioData.length - 1]?.portfolio || 0;
  const initialValue = portfolioData[0]?.portfolio || 0;
  const totalReturn = ((currentValue - initialValue) / initialValue) * 100;
  const totalPnL = currentValue - initialValue;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trading Dashboard</h1>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mode === 'paper' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {mode === 'paper' ? 'Paper Trading' : 'Live Trading'}
                  </span>
                  <span className={`flex items-center text-sm ${
                    isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      isActive ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isActive ? 'Pause Bot' : 'Start Bot'}
              </button>
              
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Return</p>
                <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Positions</p>
                <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>
        </div>

        {/* Performance Chart */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PerformanceChart data={portfolioData} />
        </motion.div>

        {/* Positions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <PositionsTable positions={positions} />
        </motion.div>

        {/* Strategy Info */}
        <motion.div 
          className="mt-8 bg-white p-6 rounded-xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Strategy</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Strategy Name</p>
              <p className="text-gray-900">Balanced Momentum Growth</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Risk Level</p>
              <p className="text-gray-900">Moderate (5/10)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Time Horizon</p>
              <p className="text-gray-900">3 Months</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current Focus:</strong> The bot is currently focusing on mid-cap technology stocks 
              with strong earnings momentum and small-cap healthcare companies showing breakout patterns.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}