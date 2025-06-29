'use client';

import React, { useMemo } from 'react';
import { Stock } from '@/types/portfolio';
import SimpleLoader from '@/components/ui/SimpleLoader';

interface SimplePortfolioTableProps {
  stocks: Stock[];
  isLoading?: boolean;
}

export default function SimplePortfolioTable({ stocks, isLoading }: SimplePortfolioTableProps) {
  // Group stocks by sector
  const groupedStocks = useMemo(() => {
    const groups = stocks.reduce((acc, stock) => {
      const sector = stock.sector || 'Others';
      if (!acc[sector]) {
        acc[sector] = [];
      }
      acc[sector].push(stock);
      return acc;
    }, {} as Record<string, Stock[]>);

    return groups;
  }, [stocks]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getGainLossClass = (value: number) => {
    if (value > 0) return 'gain';
    if (value < 0) return 'loss';
    return 'neutral';
  };

  // Simple alternating sector colors - just light gray and white
  const getSectorColors = (sectorIndex: number) => {
    const isEven = sectorIndex % 2 === 0;
    return {
      header: isEven ? 'bg-gray-100' : 'bg-white',
      row: isEven ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50',
      summary: isEven ? 'bg-gray-200' : 'bg-gray-100'
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <SimpleLoader size="md" text="Loading portfolio data..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                Particulars
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Investment
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Portfolio (%)
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider">
                NSE/BSE
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                CMP
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Present Value
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                P/E Ratio
              </th>
              <th className="px-6 py-4 text-right text-sm font-bold text-gray-800 uppercase tracking-wider">
                Latest Earnings
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {Object.entries(groupedStocks).map(([sector, sectorStocks], sectorIndex) => {
              const sectorColors = getSectorColors(sectorIndex);
              const sectorInvestment = sectorStocks.reduce((sum, stock) => sum + stock.investment, 0);
              const sectorPresentValue = sectorStocks.reduce((sum, stock) => sum + stock.presentValue, 0);
              const sectorGainLoss = sectorPresentValue - sectorInvestment;
              const sectorPercentage = sectorStocks.reduce((sum, stock) => sum + stock.portfolioPercentage, 0);

              return (
                <React.Fragment key={sector}>
                  {/* Sector Separator - Grid line between sectors */}
                  {sectorIndex > 0 && (
                    <tr>
                      <td colSpan={11} className="h-0">
                        <div className="border-t-2 border-gray-300"></div>
                      </td>
                    </tr>
                  )}

                  {/* Sector Header Row */}
                  <tr className={`${sectorColors.header} border-l-4 border-gray-400`}>
                    <td colSpan={11} className="px-6 py-4">
                                              <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-900">{sector} Sector</span>
                            <span className="ml-3 text-sm font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                              {sectorStocks.length} stock{sectorStocks.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-600 mb-1">Sector Performance</div>
                          <div className={`text-lg font-bold ${getGainLossClass(sectorGainLoss)}`}>
                            {formatCurrency(sectorGainLoss)} ({formatPercentage((sectorGainLoss / sectorInvestment) * 100)})
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Sector Stocks */}
                  {sectorStocks.map((stock, stockIndex) => (
                    <tr key={stock.symbol} className={`${sectorColors.row} transition-colors border-l-4 border-gray-200 ${stockIndex < sectorStocks.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{stock.particulars}</div>
                          <div className="text-sm text-gray-600 font-medium">{stock.symbol}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">
                        {formatCurrency(stock.purchasePrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">
                        {stock.quantity.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(stock.investment)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">
                        {stock.portfolioPercentage.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded border">
                          {stock.exchange}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(stock.cmp)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(stock.presentValue)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold">
                        <div className={getGainLossClass(stock.gainLoss)}>
                          <div>{formatCurrency(stock.gainLoss)}</div>
                          <div className="text-xs">
                            ({formatPercentage(stock.gainLossPercentage)})
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">
                        {typeof stock.peRatio === 'number' && stock.peRatio > 0 
                          ? stock.peRatio.toFixed(2) 
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {stock.latestEarnings || 'N/A'}
                      </td>
                    </tr>
                  ))}

                  {/* Sector Summary Row */}
                  <tr className={`${sectorColors.summary} border-t-2 border-gray-300 border-l-4 border-gray-400`}>
                    <td className="px-6 py-4 font-bold text-gray-900" colSpan={3}>
                      <div className="flex items-center">
                        <span className="text-lg font-bold">{sector} Total</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                      {formatCurrency(sectorInvestment)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {sectorPercentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                      {formatCurrency(sectorPresentValue)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-lg">
                      <div className={getGainLossClass(sectorGainLoss)}>
                        <div>{formatCurrency(sectorGainLoss)}</div>
                        <div className="text-sm">
                          ({formatPercentage((sectorGainLoss / sectorInvestment) * 100)})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4" colSpan={2}></td>
                  </tr>

                  {/* Bottom spacing for sector */}
                  <tr>
                    <td colSpan={11} className="h-3 bg-gray-50"></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {stocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No portfolio data available</p>
        </div>
      )}
    </div>
  );
} 