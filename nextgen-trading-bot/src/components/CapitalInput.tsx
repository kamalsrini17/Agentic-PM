'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Info, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CapitalInputProps {
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
}

export default function CapitalInput({
  value,
  onChange,
  minValue = 10000,
  maxValue = 1000000
}: CapitalInputProps) {
  const [inputValue, setInputValue] = useState(formatCurrency(value));
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(formatCurrency(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(rawValue) || 0;
    
    setInputValue(formatCurrency(numericValue));
    
    if (numericValue >= minValue && numericValue <= maxValue) {
      onChange(numericValue);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  const getCapitalTier = (amount: number) => {
    if (amount < 25000) return { name: 'Starter', color: 'bg-green-100 text-green-800' };
    if (amount < 100000) return { name: 'Growth', color: 'bg-blue-100 text-blue-800' };
    if (amount < 500000) return { name: 'Advanced', color: 'bg-purple-100 text-purple-800' };
    return { name: 'Professional', color: 'bg-gold-100 text-gold-800' };
  };

  const getStrategyPreview = (amount: number) => {
    const tier = getCapitalTier(amount);
    const strategies = {
      'Starter': {
        allocation: { smallCap: 30, midCap: 70 },
        approach: 'Conservative growth with focus on established mid-cap companies',
        expectedReturn: '8-12% annually'
      },
      'Growth': {
        allocation: { smallCap: 40, midCap: 60 },
        approach: 'Balanced approach with moderate small-cap exposure',
        expectedReturn: '12-16% annually'
      },
      'Advanced': {
        allocation: { smallCap: 50, midCap: 50 },
        approach: 'Aggressive growth with equal small-cap and mid-cap allocation',
        expectedReturn: '15-20% annually'
      },
      'Professional': {
        allocation: { smallCap: 45, midCap: 55 },
        approach: 'Sophisticated strategy with advanced risk management',
        expectedReturn: '18-25% annually'
      }
    };
    return strategies[tier.name as keyof typeof strategies];
  };

  const tier = getCapitalTier(value);
  const preview = getStrategyPreview(value);

  return (
    <motion.div 
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        {/* Capital Input */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Trading Capital Amount
          </label>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <DollarSign className="h-6 w-6 text-gray-400" />
            </div>
            
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className={`block w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isValid ? 'border-gray-200' : 'border-red-300'
              }`}
              placeholder="Enter amount"
            />
          </div>
          
          {!isValid && (
            <motion.p 
              className="mt-3 text-sm text-red-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Amount must be between ${formatCurrency(minValue)} and ${formatCurrency(maxValue)}
            </motion.p>
          )}
          
          <div className="mt-3 flex justify-between text-sm text-gray-500">
            <span>Min: ${formatCurrency(minValue)}</span>
            <span>Max: ${formatCurrency(maxValue)}</span>
          </div>
        </div>

        {/* Capital Tier Display */}
        <motion.div 
          className="mb-8 p-4 bg-gray-50 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Capital Tier</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${tier.color}`}>
              {tier.name}
            </span>
          </div>
        </motion.div>

        {/* Strategy Preview */}
        {isValid && (
          <motion.div 
            className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-lg font-semibold text-blue-900">
                Recommended Strategy Preview
              </h4>
            </div>
            
            {/* Allocation Chart */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                <span>Small-Cap vs Mid-Cap Allocation</span>
                <span className="font-medium">Optimized for ${formatCurrency(value)}</span>
              </div>
              <div className="flex rounded-lg overflow-hidden h-3">
                <div 
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${preview.allocation.smallCap}%` }}
                />
                <div 
                  className="bg-blue-300 transition-all duration-500"
                  style={{ width: `${preview.allocation.midCap}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Small-Cap: {preview.allocation.smallCap}%</span>
                <span>Mid-Cap: {preview.allocation.midCap}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-blue-900">Approach: </span>
                <span className="text-sm text-blue-800">{preview.approach}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-blue-900">Expected Return: </span>
                <span className="text-sm text-blue-800 font-semibold">{preview.expectedReturn}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US');
}