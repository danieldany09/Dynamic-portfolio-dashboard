'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Activity } from 'lucide-react';
import { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
  isLoading?: boolean;
}

export default function PortfolioSummary({ summary, isLoading }: PortfolioSummaryProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isPositiveGain = summary.totalGainLoss > 0;
  const isNegativeGain = summary.totalGainLoss < 0;

  const summaryCards = [
    {
      title: 'Total Stocks',
      value: summary.totalStocks.toString(),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Total Investment',
      value: formatCurrency(summary.totalInvestment),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Current Value',
      value: formatCurrency(summary.totalCurrentValue),
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
    },
    {
      title: 'Total Gain/Loss',
      value: formatCurrency(summary.totalGainLoss),
      icon: isPositiveGain ? TrendingUp : isNegativeGain ? TrendingDown : Activity,
      color: isPositiveGain ? 'text-green-600' : isNegativeGain ? 'text-red-600' : 'text-gray-600',
      bgColor: isPositiveGain ? 'bg-green-50' : isNegativeGain ? 'bg-red-50' : 'bg-gray-50',
      iconBg: isPositiveGain ? 'bg-green-100' : isNegativeGain ? 'bg-red-100' : 'bg-gray-100',
    },
    {
      title: 'Overall Return',
      value: formatPercentage(summary.overallGainLossPercent),
      icon: isPositiveGain ? TrendingUp : isNegativeGain ? TrendingDown : Activity,
      color: isPositiveGain ? 'text-green-600' : isNegativeGain ? 'text-red-600' : 'text-gray-600',
      bgColor: isPositiveGain ? 'bg-green-50' : isNegativeGain ? 'bg-red-50' : 'bg-gray-50',
      iconBg: isPositiveGain ? 'bg-green-100' : isNegativeGain ? 'bg-red-100' : 'bg-gray-100',
    },
    {
      title: 'Profit/Loss Per Stock',
      value: formatCurrency(summary.totalStocks > 0 ? summary.totalGainLoss / summary.totalStocks : 0),
      icon: Activity,
      color: summary.totalStocks > 0 && summary.totalGainLoss > 0 ? 'text-green-600' : 
            summary.totalStocks > 0 && summary.totalGainLoss < 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {summaryCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className={`rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg ${card.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
              </div>
              <div className={`p-3 rounded-full ${card.iconBg}`}>
                <IconComponent className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            
            {/* Additional context for gain/loss cards */}
            {(card.title.includes('Gain/Loss') || card.title.includes('Return')) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  {isPositiveGain ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : isNegativeGain ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Activity className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="text-xs text-gray-600">
                    {isPositiveGain ? 'Profitable' : isNegativeGain ? 'Loss' : 'Break-even'}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 