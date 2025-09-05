'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Target, BarChart3, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { TradingStrategy } from '@/lib/strategyEngine';

interface StrategyRecommendationsProps {
  strategy: TradingStrategy;
  capital: number;
}

export default function StrategyRecommendations({
  strategy,
  capital
}: StrategyRecommendationsProps) {
  if (!strategy) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Strategy Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl">
        <div className="flex items-center mb-4">
          <Target className="h-8 w-8 mr-3" />
          <h2 className="text-3xl font-bold">{strategy.name}</h2>
        </div>
        <p className="text-blue-100 text-lg mb-6">{strategy.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold">{formatPercent(strategy.riskMetrics.expectedReturn)}</div>
            <div className="text-blue-200 text-sm">Expected Annual Return</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{strategy.riskMetrics.sharpeRatio}</div>
            <div className="text-blue-200 text-sm">Sharpe Ratio</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{formatPercent(strategy.riskMetrics.volatility)}</div>
            <div className="text-blue-200 text-sm">Volatility</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{formatPercent(-strategy.riskMetrics.maxDrawdown)}</div>
            <div className="text-blue-200 text-sm">Max Drawdown</div>
          </div>
        </div>
      </div>

      {/* Allocation Breakdown */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-2xl font-semibold text-gray-900">Portfolio Allocation</h3>
        </div>

        {/* Visual Allocation */}
        <div className="mb-8">
          <div className="flex rounded-xl overflow-hidden h-12 mb-4">
            <motion.div 
              className="bg-blue-500 flex items-center justify-center text-white font-semibold"
              style={{ width: `${strategy.allocation.smallCap}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${strategy.allocation.smallCap}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {strategy.allocation.smallCap > 15 && `${strategy.allocation.smallCap}%`}
            </motion.div>
            <motion.div 
              className="bg-blue-300 flex items-center justify-center text-white font-semibold"
              style={{ width: `${strategy.allocation.midCap}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${strategy.allocation.midCap}%` }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              {strategy.allocation.midCap > 15 && `${strategy.allocation.midCap}%`}
            </motion.div>
            <motion.div 
              className="bg-gray-300 flex items-center justify-center text-gray-700 font-semibold"
              style={{ width: `${strategy.allocation.cash}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${strategy.allocation.cash}%` }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              {strategy.allocation.cash > 8 && `${strategy.allocation.cash}%`}
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
              <div className="font-semibold text-gray-900">Small-Cap Stocks</div>
              <div className="text-gray-600">{strategy.allocation.smallCap}% • {formatCurrency(capital * strategy.allocation.smallCap / 100)}</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-blue-300 rounded-full mx-auto mb-2"></div>
              <div className="font-semibold text-gray-900">Mid-Cap Stocks</div>
              <div className="text-gray-600">{strategy.allocation.midCap}% • {formatCurrency(capital * strategy.allocation.midCap / 100)}</div>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <div className="font-semibold text-gray-900">Cash Reserve</div>
              <div className="text-gray-600">{strategy.allocation.cash}% • {formatCurrency(capital * strategy.allocation.cash / 100)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Positions */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-2xl font-semibold text-gray-900">Sample Positions</h3>
        </div>

        <div className="grid gap-4">
          {strategy.samplePositions.map((position, index) => (
            <motion.div
              key={position.symbol}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="font-bold text-lg text-gray-900 mr-3">{position.symbol}</span>
                  <span className="text-gray-600">{position.name}</span>
                </div>
                <p className="text-sm text-gray-600">{position.rationale}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{position.allocation}%</div>
                <div className="text-sm text-gray-500">{formatCurrency(capital * position.allocation / 100)}</div>
                <div className="text-xs text-gray-400">{position.marketCap}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Backtesting Results */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-2xl font-semibold text-gray-900">Historical Performance</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {formatPercent(strategy.backtestResults.totalReturn)}
            </div>
            <div className="text-sm text-green-700">Total Return</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {strategy.backtestResults.winRate}%
            </div>
            <div className="text-sm text-blue-700">Win Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {formatPercent(strategy.backtestResults.avgTrade)}
            </div>
            <div className="text-sm text-purple-700">Avg Trade</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600">
              {formatPercent(-strategy.backtestResults.maxDrawdown)}
            </div>
            <div className="text-sm text-orange-700">Max Drawdown</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> Past performance is not indicative of future results. 
            These backtesting results are based on historical market data and algorithmic modeling. 
            Actual trading results may vary significantly.
          </p>
        </div>
      </div>

      {/* Trading Rules */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-2xl font-semibold text-gray-900">Trading Rules & Risk Management</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Position Sizing</h4>
            <p className="text-gray-600 mb-6">{strategy.tradingRules.positionSizing}</p>
            
            <h4 className="font-semibold text-gray-900 mb-4">Entry Signals</h4>
            <ul className="space-y-2">
              {strategy.tradingRules.entrySignals.map((signal, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {signal}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Exit Signals</h4>
            <ul className="space-y-2 mb-6">
              {strategy.tradingRules.exitSignals.map((signal, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <CheckCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                  {signal}
                </li>
              ))}
            </ul>
            
            <h4 className="font-semibold text-gray-900 mb-4">Risk Management</h4>
            <ul className="space-y-2">
              {strategy.tradingRules.riskManagement.map((rule, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <Shield className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}