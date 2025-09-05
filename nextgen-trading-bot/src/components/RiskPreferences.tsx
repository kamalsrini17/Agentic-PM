'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertTriangle } from 'lucide-react';

interface RiskPreferencesProps {
  riskTolerance: number;
  timeHorizon: string;
  onRiskChange: (risk: number) => void;
  onTimeHorizonChange: (timeHorizon: string) => void;
}

const timeHorizonOptions = [
  { value: '1week', label: '1 Week', description: 'Short-term momentum plays' },
  { value: '2weeks', label: '2 Weeks', description: 'Swing trading opportunities' },
  { value: '1month', label: '1 Month', description: 'Monthly trend following' },
  { value: '3months', label: '3 Months', description: 'Quarterly growth strategies' },
  { value: '6months', label: '6 Months', description: 'Medium-term value plays' },
  { value: '12months', label: '12 Months', description: 'Long-term growth focus' }
];

const riskLevels = [
  { level: 1, label: 'Very Conservative', description: 'Minimal risk, steady returns', color: 'bg-green-500' },
  { level: 2, label: 'Conservative', description: 'Low risk, stable growth', color: 'bg-green-400' },
  { level: 3, label: 'Moderate-Conservative', description: 'Balanced with safety focus', color: 'bg-yellow-400' },
  { level: 4, label: 'Moderate', description: 'Balanced risk and return', color: 'bg-yellow-500' },
  { level: 5, label: 'Balanced', description: 'Equal risk and growth focus', color: 'bg-orange-400' },
  { level: 6, label: 'Moderate-Aggressive', description: 'Growth with some risk', color: 'bg-orange-500' },
  { level: 7, label: 'Aggressive', description: 'Higher risk for growth', color: 'bg-red-400' },
  { level: 8, label: 'Very Aggressive', description: 'High risk, high reward', color: 'bg-red-500' },
  { level: 9, label: 'Speculative', description: 'Maximum growth potential', color: 'bg-red-600' },
  { level: 10, label: 'High Risk', description: 'Extreme risk tolerance', color: 'bg-red-700' }
];

export default function RiskPreferences({
  riskTolerance,
  timeHorizon,
  onRiskChange,
  onTimeHorizonChange
}: RiskPreferencesProps) {
  const currentRiskLevel = riskLevels.find(r => r.level === riskTolerance) || riskLevels[4];

  return (
    <motion.div 
      className="max-w-3xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Risk Tolerance */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Risk Tolerance</h3>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Conservative</span>
            <span className="text-sm font-medium text-gray-700">Aggressive</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              value={riskTolerance}
              onChange={(e) => onRiskChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        </div>

        <motion.div 
          className="p-4 rounded-xl border-2 border-gray-100"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center mb-2">
            <div className={`w-4 h-4 rounded-full ${currentRiskLevel.color} mr-3`} />
            <span className="font-semibold text-gray-900">{currentRiskLevel.label}</span>
          </div>
          <p className="text-gray-600 text-sm">{currentRiskLevel.description}</p>
          
          {riskTolerance >= 8 && (
            <div className="mt-3 flex items-center text-amber-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">High risk warning: Potential for significant losses</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Time Horizon */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center mb-6">
          <Clock className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Trading Time Horizon</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {timeHorizonOptions.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => onTimeHorizonChange(option.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                timeHorizon === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-semibold text-gray-900 mb-1">
                {option.label}
              </div>
              <div className="text-sm text-gray-600">
                {option.description}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected Time Horizon Info */}
        <motion.div 
          className="mt-6 p-4 bg-blue-50 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h4 className="font-semibold text-blue-900 mb-2">
            Selected: {timeHorizonOptions.find(o => o.value === timeHorizon)?.label}
          </h4>
          <p className="text-blue-800 text-sm">
            {timeHorizonOptions.find(o => o.value === timeHorizon)?.description}
          </p>
        </motion.div>
      </div>

      {/* Risk-Time Horizon Compatibility */}
      <motion.div 
        className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="font-semibold text-gray-900 mb-3">Strategy Compatibility</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Risk Level:</span>
            <span className="ml-2 text-gray-600">{currentRiskLevel.label}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Time Horizon:</span>
            <span className="ml-2 text-gray-600">{timeHorizonOptions.find(o => o.value === timeHorizon)?.label}</span>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-white rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">AI Recommendation:</span> Your risk and time horizon settings are 
            {riskTolerance <= 5 && (timeHorizon === '1week' || timeHorizon === '2weeks') ? 
              ' well-suited for conservative short-term strategies.' :
              riskTolerance >= 7 && (timeHorizon === '6months' || timeHorizon === '12months') ?
              ' ideal for aggressive long-term growth strategies.' :
              ' compatible and will be optimized for balanced performance.'
            }
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}