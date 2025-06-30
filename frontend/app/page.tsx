'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import PortfolioAPI from '@/lib/api';
import { PortfolioData } from '@/types/portfolio';
import SimplePortfolioTable from '@/components/SimplePortfolioTable';
import SimpleLoader from '@/components/ui/SimpleLoader';

export default function Dashboard() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    try {
      setError(null);
      const data = await PortfolioAPI.getPortfolio();
      setPortfolioData(data);
      console.log('all data', data);
      setLastUpdated(new Date().toLocaleString('en-IN'));
      setIsConnected(true);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      setIsConnected(false);
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await fetchPortfolioData();
    setIsLoading(false);
  }, [fetchPortfolioData]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every 15 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (isConnected && !isLoading) {
  //       fetchPortfolioData();
  //     }
  //   }, 15000);

  //   return () => clearInterval(interval);
  // }, [isConnected, isLoading, fetchPortfolioData]);

  const getGainLossClass = (value: number) => {
    if (value > 0) return 'portfolio-gain';
    if (value < 0) return 'portfolio-loss';
    return 'text-gray-900 font-bold';
  };

  const formatCurrency = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const formatPercentage = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 mx-4 mt-4 rounded-lg">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Dashboard</h1>
              <p className="text-sm text-gray-600">
                Real-time portfolio tracking • Last updated: {lastUpdated || 'Loading...'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className={`flex items-center gap-2 text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium shadow-md transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-red-800 font-semibold text-lg">Connection Error</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-red-500 text-xs mt-2">Make sure your backend server is running on port 3001</p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Summary Stats */}
        {portfolioData && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Total Investment</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{portfolioData.summary.totalInvestment.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Current Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{portfolioData.summary.totalCurrentValue.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Total Gain/Loss</div>
                <div className={`text-2xl ${getGainLossClass(portfolioData.summary.totalGainLoss)}`}>
                  {formatCurrency(portfolioData.summary.totalGainLoss)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Overall Return</div>
                <div className={`text-2xl ${getGainLossClass(portfolioData.summary.overallGainLossPercent)}`}>
                  {formatPercentage(portfolioData.summary.overallGainLossPercent)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Table */}
        {portfolioData ? (
          <SimplePortfolioTable stocks={portfolioData.stocks} isLoading={isLoading} />
        ) : isLoading ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <SimpleLoader size="lg" text="Fetching real-time data from Yahoo Finance and Google Finance..." />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-16 text-center">
            <p className="text-gray-600 text-lg">No portfolio data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
