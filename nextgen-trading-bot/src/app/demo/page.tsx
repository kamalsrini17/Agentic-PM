'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import CapitalInput from '@/components/CapitalInput';
import { generateStrategy } from '@/lib/strategyEngine';

export default function DemoPage() {
  const [capital, setCapital] = useState(75000);
  const [showStrategy, setShowStrategy] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);

  const handleGenerateStrategy = () => {
    const generatedStrategy = generateStrategy(capital, 6, '3months');
    setStrategy(generatedStrategy);
    setShowStrategy(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">NextGen Trading Bot</span>
          </Link>
          <Link href="/onboarding" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              See Your Strategy in Action
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Enter your capital amount and see how our AI creates a personalized trading strategy just for you.
            </motion.p>
          </div>

          {!showStrategy ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CapitalInput
                value={capital}
                onChange={setCapital}
              />
              
              <div className="text-center mt-8">
                <button
                  onClick={handleGenerateStrategy}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Generate My Strategy
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Strategy Results */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Personalized Strategy</h2>
                
                {strategy && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">
                          {strategy.riskMetrics.expectedReturn.toFixed(1)}%
                        </div>
                        <div className="text-sm text-blue-700">Expected Annual Return</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">
                          {strategy.allocation.smallCap}%
                        </div>
                        <div className="text-sm text-green-700">Small-Cap Allocation</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">
                          {strategy.allocation.midCap}%
                        </div>
                        <div className="text-sm text-purple-700">Mid-Cap Allocation</div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-3">{strategy.name}</h3>
                      <p className="text-gray-600 mb-4">{strategy.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Sharpe Ratio:</span>
                          <span className="ml-2 text-gray-600">{strategy.riskMetrics.sharpeRatio}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Max Drawdown:</span>
                          <span className="ml-2 text-gray-600">{strategy.riskMetrics.maxDrawdown.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl">
                      <h3 className="font-semibold mb-3">Sample Positions for ${capital.toLocaleString()}</h3>
                      <div className="grid gap-3">
                        {strategy.samplePositions.slice(0, 3).map((position, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{position.symbol}</span>
                              <span className="ml-2 text-blue-100 text-sm">{position.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{position.allocation}%</div>
                              <div className="text-blue-200 text-sm">
                                ${((capital * position.allocation) / 100).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start Trading?</h3>
                  <p className="text-gray-600">
                    This is just a preview. Create your account to access the full platform with real-time trading.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/onboarding" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowStrategy(false);
                      setCapital(50000 + Math.floor(Math.random() * 100000));
                    }}
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors"
                  >
                    Try Different Amount
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}