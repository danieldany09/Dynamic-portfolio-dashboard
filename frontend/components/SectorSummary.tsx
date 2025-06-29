'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, PieChart } from 'lucide-react';
import { SectorSummary as SectorSummaryType } from '@/types/portfolio';
import { 
  formatCurrency, 
  formatPercentage, 
  getGainLossColor, 
  formatLargeNumber
} from '@/lib/utils';

interface SectorSummaryProps {
  sectors: SectorSummaryType[];
  isLoading?: boolean;
}

export default function SectorSummary({ sectors, isLoading }: SectorSummaryProps) {
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  const toggleSector = (sectorName: string) => {
    const newExpanded = new Set(expandedSectors);
    if (newExpanded.has(sectorName)) {
      newExpanded.delete(sectorName);
    } else {
      newExpanded.add(sectorName);
    }
    setExpandedSectors(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sector-wise Summary
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {sectors.length} sectors • Click to expand/collapse
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sectors.map((sector) => {
          const isExpanded = expandedSectors.has(sector.sector);
          const gainLossPercentage = sector.totalInvestment > 0 
            ? ((sector.totalGainLoss / sector.totalInvestment) * 100) 
            : 0;

          return (
            <div key={sector.sector} className="p-6">
              <button
                onClick={() => toggleSector(sector.sector)}
                className="w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {sector.sector}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({sector.stockCount} stocks)
                  </span>
                </div>
                <div className={`text-right ${getGainLossColor(sector.totalGainLoss)}`}>
                  <div className="font-medium">
                    {formatCurrency(sector.totalGainLoss)}
                  </div>
                  <div className="text-sm">
                    {formatPercentage(gainLossPercentage)}
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Total Investment
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(sector.totalInvestment)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Present Value
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(sector.totalPresentValue)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Gain/Loss
                  </div>
                  <div className={`font-semibold ${getGainLossColor(sector.totalGainLoss)}`}>
                    {formatCurrency(sector.totalGainLoss)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Gain/Loss %
                  </div>
                  <div className={`font-semibold ${getGainLossColor(gainLossPercentage)}`}>
                    {formatPercentage(gainLossPercentage)}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Stocks in {sector.sector}
                  </h4>
                  <div className="space-y-2">
                    {sector.stocks.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {stock.particulars}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {stock.symbol} • {formatLargeNumber(stock.quantity)} shares
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(stock.presentValue)}
                          </div>
                          <div className={`text-xs ${getGainLossColor(stock.gainLoss)}`}>
                            {formatCurrency(stock.gainLoss)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sectors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No sector data available</p>
        </div>
      )}
    </div>
  );
} 