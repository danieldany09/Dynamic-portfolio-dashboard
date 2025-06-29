'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Stock } from '@/types/portfolio';
import { 
  formatCurrency, 
  formatPercentage, 
  getGainLossColor, 
  formatLargeNumber,
  getTimeAgo 
} from '@/lib/utils';

interface PortfolioTableProps {
  stocks: Stock[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<Stock>();

export default function PortfolioTable({ stocks, isLoading }: PortfolioTableProps) {
  const columns = useMemo(() => [
    columnHelper.accessor('particulars', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold text-left hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Particulars
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          <div className="text-gray-900 dark:text-gray-100">{row.original.particulars}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.symbol}</div>
        </div>
      ),
    }),
    columnHelper.accessor('purchasePrice', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Purchase Price
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="text-right">{formatCurrency(getValue())}</div>
      ),
    }),
    columnHelper.accessor('quantity', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Qty
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="text-right">{formatLargeNumber(getValue())}</div>
      ),
    }),
    columnHelper.accessor('investment', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Investment
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="text-right font-medium">{formatCurrency(getValue())}</div>
      ),
    }),
    columnHelper.accessor('portfolioPercentage', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Portfolio (%)
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="text-right">{formatPercentage(getValue())}</div>
      ),
    }),
    columnHelper.accessor('exchange', {
      header: 'NSE/BSE',
      cell: ({ getValue }) => (
        <div className="text-center">
          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
            {getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('cmp', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          CMP
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ getValue, row }) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(getValue())}</div>
          {row.original.dayChangePercent && (
            <div className={`text-xs ${getGainLossColor(row.original.dayChangePercent)}`}>
              {formatPercentage(row.original.dayChangePercent)}
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('presentValue', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Present Value
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ getValue }) => (
        <div className="text-right font-medium">{formatCurrency(getValue())}</div>
      ),
    }),
    columnHelper.accessor('gainLoss', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-blue-600"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Gain/Loss
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ getValue, row }) => (
        <div className={`text-right font-medium ${getGainLossColor(getValue())}`}>
          <div>{formatCurrency(getValue())}</div>
          <div className="text-xs">
            ({formatPercentage(row.original.gainLossPercentage)})
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('peRatio', {
      header: 'P/E Ratio',
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <div className="text-right">
            {typeof value === 'number' && value > 0 
              ? value.toFixed(2) 
              : 'N/A'}
          </div>
        );
      },
    }),
    columnHelper.accessor('latestEarnings', {
      header: 'Latest Earnings',
      cell: ({ getValue }) => (
        <div className="text-right text-sm">{getValue() || 'N/A'}</div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-11 gap-4">
                  {[...Array(11)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Portfolio Holdings
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {stocks.length} stocks • Last updated: {getTimeAgo(stocks[0]?.lastUpdated || '')}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No portfolio data available</p>
        </div>
      )}
    </div>
  );
} 