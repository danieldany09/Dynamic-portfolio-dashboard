# Portfolio Dashboard Frontend

A modern, responsive Next.js frontend for the Dynamic Portfolio Dashboard that displays real-time stock portfolio data with comprehensive financial metrics.

## 🚀 Current Features

- **Portfolio Overview**: Dashboard with portfolio summary statistics (Total Investment, Current Value, Gain/Loss, Return %)
- **Detailed Stock Table**: Complete table with all required 11 columns as per PRD
- **Sector-wise Grouping**: Stocks grouped by sector with calculated sector summaries (client-side grouping from portfolio data)
- **Visual Indicators**: Color-coded gains/losses (green for profits, red for losses)
- **Responsive Design**: Works across desktop, tablet, and mobile devices
- **Connection Status**: Visual indicators for backend connectivity
- **Error Handling**: Graceful error handling with user-friendly messages
- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Clean, professional design with Tailwind CSS
- **JWT Authentication**: Secure API communication with JWT tokens
- **Single API Integration**: Currently uses `GET /api/portfolio` for all data display

## 🛠 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Runtime**: React 19
- **Styling**: Tailwind CSS v4
- **Data Fetching**: Axios with interceptors
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
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Skeleton loading for better UX
- **Auto-refresh Indicator**: Shows real-time update status

## 🏗 Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Main dashboard page with portfolio summary
├── components/
│   ├── ui/
│   │   └── SimpleLoader.tsx # Loading spinner component
│   └── SimplePortfolioTable.tsx # Main portfolio table with sector grouping
├── lib/
│   ├── api.ts               # Backend API client with JWT auth
│   └── utils.ts             # Essential utility functions
├── types/
│   └── portfolio.ts         # TypeScript type definitions
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 3001

### Installation

1. **Clone and navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_JWT_TOKEN=your_jwt_token_here
   NODE_ENV=development
   ```

   **Getting JWT Token**: You'll need to obtain a JWT token from your backend authentication system. The token is required for all API calls. check the backend documentation (README.md) for how to generate/obtain this token.

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3001/api)
- `NEXT_PUBLIC_JWT_TOKEN`: JWT token for API authentication (required)
- `NODE_ENV`: Environment (development/production)

### API Integration

The frontend connects to your backend API with JWT authentication:

**✅ Currently Implemented & Working:**
- `GET /api/portfolio` - Complete portfolio data with stocks and summary

**🚧 Available in Backend but not used in Frontend yet:**
- `GET /api/portfolio/sectors` - Sector-wise portfolio summary  
- `GET /api/portfolio/prices?symbols=` - Real-time price updates for specific symbols
- `GET /api/stocks/{symbol}` - Detailed information for a specific stock

**Note**: The frontend currently uses only one API endpoint. Other backend endpoints are available but not integrated in the frontend yet. The API client has been optimized to include only essential functionality.

All API requests include JWT authentication headers and have built-in error handling with retry mechanisms.

## 🔄 Data Updates

- **Manual refresh**: Header refresh button to fetch latest portfolio data
- **Connection status**: Visual indicators for backend connectivity  
- **Error handling**: Graceful fallbacks when API is unavailable
- **Auto-refresh**: Currently disabled (code exists but commented out in `page.tsx` - can be enabled for 15-second intervals)


### Available Scripts

- `npm run dev` - Start development server (default port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style & Tools

- **ESLint**: Code linting with Next.js configuration
- **TypeScript**: Full type safety with strict mode
- **Tailwind CSS**: Utility-first CSS framework v4
- **Next.js**: App Router with React 19

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

Ensure your backend is running and accessible at the configured API URL. The frontend uses only the `/api/portfolio` endpoint and expects the following data structure:

```typescript
// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

// Portfolio data structure
interface PortfolioData {
  stocks: Stock[];
  summary: PortfolioSummary;
}

// Stock data structure (as used in the table)
interface Stock {
  particulars: string;
  symbol: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPercentage: number;
  exchange: string;
  cmp: number; // Current Market Price
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  peRatio: number | string;
  latestEarnings: string;
  sector: string;
}
```

**Note**: Sector grouping and summaries are currently calculated client-side from the stock data. Each stock includes a `sector` field, and the frontend groups stocks by sector and calculates sector-level totals automatically.

