'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import CapitalInput from '@/components/CapitalInput';
import RiskPreferences from '@/components/RiskPreferences';
import StrategyRecommendations from '@/components/StrategyRecommendations';
import { generateStrategy } from '@/lib/strategyEngine';

interface OnboardingData {
  capital: number;
  riskTolerance: number;
  timeHorizon: string;
  strategy?: any;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    capital: 50000,
    riskTolerance: 5,
    timeHorizon: '3months'
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      if (currentStep === 2) {
        // Generate strategy after preferences are set
        const strategy = generateStrategy(data.capital, data.riskTolerance, data.timeHorizon);
        setData(prev => ({ ...prev, strategy }));
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/20">
        <nav className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/" className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">NextGen Trading Bot</span>
          </Link>
          <div className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </nav>
      </header>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-full bg-white/30 rounded-full h-2">
            <motion.div 
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Let's Set Up Your Trading Bot
                  </h1>
                  <p className="text-xl text-gray-600 mb-12">
                    First, tell us how much capital you'd like to allocate for trading.
                  </p>
                  <CapitalInput
                    value={data.capital}
                    onChange={(capital) => updateData({ capital })}
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Configure Your Preferences
                  </h1>
                  <p className="text-xl text-gray-600 mb-12">
                    Help us understand your risk tolerance and investment timeline.
                  </p>
                  <RiskPreferences
                    riskTolerance={data.riskTolerance}
                    timeHorizon={data.timeHorizon}
                    onRiskChange={(riskTolerance) => updateData({ riskTolerance })}
                    onTimeHorizonChange={(timeHorizon) => updateData({ timeHorizon })}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Your AI-Generated Strategy
                  </h1>
                  <p className="text-xl text-gray-600 mb-12">
                    Based on your inputs, here's your personalized trading strategy.
                  </p>
                  <StrategyRecommendations
                    strategy={data.strategy}
                    capital={data.capital}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Ready to Start Trading!
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Your bot is configured and ready to go. You can start with paper trading 
                    to see how it performs before using real money.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-xl font-semibold mb-4">Paper Trading</h3>
                      <p className="text-gray-600 mb-6">
                        Test your strategy with virtual money to see how it performs.
                      </p>
                      <Link href="/dashboard?mode=paper" className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors inline-block">
                        Start Paper Trading
                      </Link>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-xl font-semibold mb-4">Live Trading</h3>
                      <p className="text-gray-600 mb-6">
                        Connect your broker and start trading with real money.
                      </p>
                      <Link href="/dashboard?mode=live" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block">
                        Go Live
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-white/50'
              }`}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === totalSteps}
              className={`flex items-center px-8 py-3 rounded-lg font-medium transition-colors ${
                currentStep === totalSteps
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === totalSteps ? 'Complete' : 'Next'}
              {currentStep < totalSteps && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}