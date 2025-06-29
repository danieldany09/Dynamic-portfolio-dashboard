# Portfolio Dashboard Frontend

A modern, responsive React/Next.js frontend for the Dynamic Portfolio Dashboard that displays real-time stock portfolio data with comprehensive financial metrics.

## 🚀 Features

- **Real-time Portfolio Tracking**: Live updates every 15 seconds
- **Comprehensive Table View**: All required columns including CMP, P/E ratios, gains/losses
- **Sector-wise Grouping**: Expandable sector summaries with totals
- **Visual Indicators**: Color-coded gains/losses (green for profits, red for losses)
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic dark/light theme detection
- **Error Handling**: Graceful error handling with connection status indicators
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Built with Tailwind CSS for a clean, professional look

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: Axios
- **Table Component**: TanStack React Table
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📋 Portfolio Table Columns

The table displays the following columns as per the PRD:

1. **Particulars** - Stock name and symbol
2. **Purchase Price** - Original buy price
3. **Qty** - Number of shares
4. **Investment** - Total invested amount (Price × Qty)
5. **Portfolio (%)** - Percentage weight in portfolio
6. **NSE/BSE** - Exchange information
7. **CMP** - Current Market Price (from Yahoo Finance)
8. **Present Value** - Current total value (CMP × Qty)
9. **Gain/Loss** - Profit/Loss amount and percentage
10. **P/E Ratio** - Price-to-Earnings ratio (from Google Finance)
11. **Latest Earnings** - Recent earnings information

## 🎨 Visual Features

- **Color-coded Gains/Losses**: 
  - 🟢 Green for positive gains
  - 🔴 Red for losses
  - ⚪ Gray for break-even
- **Sortable Columns**: Click any column header to sort
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Skeleton loading for better UX
- **Auto-refresh Indicator**: Shows real-time update status

## 🏗 Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSpinner.tsx
│   ├── Header.tsx           # Dashboard header
│   ├── PortfolioSummary.tsx # Summary cards
│   ├── PortfolioTable.tsx   # Main data table
│   └── SectorSummary.tsx    # Sector grouping
├── lib/
│   ├── api.ts               # Backend API client
│   └── utils.ts             # Utility functions
├── types/
│   └── portfolio.ts         # TypeScript definitions
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running on port 3001

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NODE_ENV=development
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3001/api)
- `NODE_ENV`: Environment (development/production)

### API Integration

The frontend connects to your backend API endpoints:

- `GET /api/portfolio` - Complete portfolio data
- `GET /api/portfolio/sectors` - Sector-wise summary
- `GET /api/portfolio/prices` - Real-time price updates
- `GET /health` - Backend health check

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:

- **Mobile**: 640px and below
- **Tablet**: 641px - 1024px  
- **Desktop**: 1025px and above

Key responsive features:
- Collapsible table columns
- Mobile-optimized navigation
- Touch-friendly interactions
- Horizontal scrolling for large tables

## 🔄 Real-time Updates

- **Auto-refresh**: Every 15 seconds (as per PRD requirement)
- **Manual refresh**: Header refresh button
- **Connection status**: Visual indicators for backend connectivity
- **Error handling**: Graceful fallbacks when API is unavailable

## 🎯 Performance Optimizations

- **Memoization**: React.memo for expensive components
- **Lazy loading**: Code splitting with Next.js
- **Caching**: Browser-level caching for static assets
- **Optimized rendering**: Efficient table updates
- **Bundle optimization**: Tree shaking and minification

## 🐛 Error Handling

- **Connection errors**: Clear messaging when backend is unavailable
- **API failures**: Graceful degradation with cached data
- **Error boundaries**: Prevent complete app crashes
- **Retry mechanisms**: Automatic retry for failed requests

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Code Style

- **Prettier**: Code formatting
- **ESLint**: Code linting
- **TypeScript**: Type safety
- **Tailwind**: Utility-first CSS

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `.next` folder to your hosting provider
3. Configure environment variables
4. Start with `npm start`

## 🤝 Integration with Backend

Ensure your backend is running and accessible at the configured API URL. The frontend expects the following data structure from your backend APIs:

```typescript
// Portfolio data structure
interface PortfolioData {
  stocks: Stock[];
  summary: PortfolioSummary;
}

// Sector data structure
interface SectorData {
  sectors: SectorSummary[];
  summary: SectorOverallSummary;
}
```

## 📊 Features Checklist

- ✅ Portfolio table with all required columns
- ✅ Real-time updates every 15 seconds
- ✅ Color-coded gains/losses
- ✅ Sector grouping with summaries
- ✅ Responsive design
- ✅ TypeScript implementation
- ✅ Error handling and loading states
- ✅ Dark mode support
- ✅ Sortable table columns
- ✅ Connection status indicators

## 🔮 Future Enhancements

- 📈 Interactive charts with Recharts
- 🔔 Push notifications for price alerts
- 💾 Offline support with service workers
- 📊 Advanced filtering and search
- 🎨 Customizable dashboard layouts
- 📱 Progressive Web App (PWA) features

## 📄 License

This project is part of the Dynamic Portfolio Dashboard system.

---

**Happy Trading! 📈💰**
