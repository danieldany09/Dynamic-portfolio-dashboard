# Dynamic Portfolio Dashboard

A comprehensive, real-time stock portfolio tracking system that displays live market data, financial metrics, and performance analytics for Indian stock markets. Built with a modern React/Next.js frontend and a robust Node.js backend.

## 📋 Project Overview

This portfolio dashboard provides:
- **Real-time stock tracking** with live prices from Yahoo Finance
- **Essential financial metrics** including P/E ratios, market cap, earnings data
- **Sector-wise portfolio analysis** across Financial, Technology, Consumer, Power, and other sectors
- **Secure JWT authentication** for API access
- **Responsive web interface** that works on desktop, tablet, and mobile
- **Professional portfolio management** with gain/loss tracking and performance analytics

### Live Demo Features
- Portfolio summary with total investment, current value, and overall returns
- Detailed stock table with 11+ columns of financial data
- Sector grouping with individual sector performance summaries
- Color-coded gains/losses for quick visual analysis
- Real-time connection status and error handling

## 🏗 Architecture

The system consists of three main components:

**Frontend (Next.js)**: React-based dashboard displaying portfolio data, stock tables, and sector analysis with secure JWT authentication.

**Backend (Node.js)**: Express.js API server handling authentication, portfolio data aggregation, and external API integration with caching and rate limiting.

**Data Sources**: Yahoo Finance for live stock prices and market data, Google Finance for P/E ratios and financial metrics.

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **Data Fetching**: Axios with JWT authentication
- **UI Components**: Custom components with Lucide icons
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Data Sources**: Yahoo Finance API, Google Finance API
- **Caching**: Node-cache for performance
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon, ESLint, Prettier

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- Internet connection for live market data
- knowledge of environment variables

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Dynamic-portfolio-dashboard
```

### 2. Backend Setup (Required First)
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values (see Backend Setup section)

# Start backend server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your JWT token (see Frontend Setup section)

# Start frontend server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:3001/health

## 📋 Detailed Setup Instructions

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**:
   Create `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # Authentication (REQUIRED)
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   API_KEY=your_secure_api_key_here
   ```

3. **Generate secure values**:
   ```bash
   
   # Choose API key for token generation
   API_KEY=portfolioDashboardApiKey
   ```

4. **Start backend server**:
   ```bash
   npm run dev
   ```

5. **Verify backend is running**:
   ```bash
   curl http://localhost:3001/health
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   npm install
   ```

2. **Generate JWT token** (backend must be running):
   ```bash
   curl -X POST http://localhost:3001/api/auth/token \
     -H "Content-Type: application/json" \
     -d '{"apiKey":"your_secure_api_key_here"}'
   ```

3. **Configure environment variables**:
   Create `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_JWT_TOKEN=your_generated_jwt_token_here
   NODE_ENV=development
   ```

4. **Start frontend server**:
   ```bash
   npm run dev
   ```

5. **Access the dashboard**:
   Open http://localhost:3000 in your browser

## 🔐 Authentication Flow

### Step 1: Generate JWT Token
The backend requires JWT authentication for all portfolio data requests.

```bash
POST http://localhost:3001/api/auth/token
Content-Type: application/json

{
  "apiKey": "your_secure_api_key_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token generated successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

### Step 2: Use Token in Frontend
Add the token to your frontend `.env.local` file:
```env
NEXT_PUBLIC_JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Portfolio Data Structure

The system currently manages a diversified portfolio with 25+ stocks across multiple sectors:

### Included Sectors & Stocks
- **Financial (5 stocks)**: HDFC Bank, Bajaj Finance, ICICI Bank, Bajaj Holdings, SBI Life
- **Technology (6 stocks)**: Affle India, LTI Mindtree, KPIT Tech, Tata Tech, BLS E-Services, Tanla
- **Consumer (3 stocks)**: D-Mart, Tata Consumer, Pidilite
- **Power (4 stocks)**: Tata Power, KPI Green, Suzlon, Gensol
- **Pipe (3 stocks)**: Hariom Pipes, Astral, Polycab
- **Others (4 stocks)**: Clean Science, Deepak Nitrite, Fine Organic, Gravita

### Financial Metrics Displayed
- **Current Market Price (CMP)** - Live prices from Yahoo Finance
- **Purchase Price & Quantity** - Your original investment details
- **Investment & Present Value** - Total invested vs current worth
- **Gain/Loss** - Profit/loss in amount and percentage
- **Portfolio Percentage** - Each stock's weight in your portfolio
- **P/E Ratio** - Price-to-earnings ratio from Google Finance
- **Latest Earnings** - Recent earnings information
- **Exchange** - NSE/BSE listing information

## 📖 API Documentation

### Backend Endpoints

#### Authentication
```bash
POST /api/auth/token     # Generate JWT token
GET  /api/auth/verify    # Verify token validity
```

#### Portfolio Data
```bash
GET /api/portfolio                    # Complete portfolio data with essential metrics
GET /api/portfolio/sectors            # Sector-wise summary
GET /api/portfolio/prices?symbols=    # Real-time prices for specific symbols
```

#### Stock Information
```bash
GET /api/stocks/:symbol         # Individual stock details with data
```

#### System
```bash
GET /health    # Backend health check
```

### API Response Format
All API responses follow this consistent structure:
```json
{
  "success": boolean,
  "data": object|array,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "error-message"  // Only present if success is false
}
```

### Example Portfolio Response
```json
{
  "success": true,
  "data": {
    "stocks": [
      {
        "particulars": "HDFC Bank",
        "symbol": "HDFCBANK.NS",
        "purchasePrice": 1490,
        "quantity": 50,
        "investment": 74500,
        "portfolioPercentage": 8.25,
        "exchange": "NSE",
        "cmp": 1650.30,
        "presentValue": 82515,
        "gainLoss": 8015,
        "gainLossPercentage": 10.76,
        "peRatio": 19.2,
        "latestEarnings": "EPS: ₹42.3",
        "sector": "Financial"
      }
    ],
    "summary": {
      "totalStocks": 25,
      "totalInvestment": 952000,
      "totalCurrentValue": 1048500,
      "totalGainLoss": 96500,
      "overallGainLossPercent": 10.14
    }
  }
}
```

## 💻 Usage Examples

### 1. View Portfolio Dashboard
1. Start both backend and frontend servers
2. Open http://localhost:3000
3. View portfolio summary cards showing total investment, current value, and returns
4. Browse the detailed stock table with sector groupings
5. Monitor real-time connection status

### 2. Auto updated and Manual Data Refresh
- Automatically refreshes for each 15 seconds to fetch the live data
- Click the "Refresh Data" button in the header
- Backend fetches latest prices from Yahoo Finance
- Table updates with new market prices and calculations

### 3. Understanding the Interface
- **Green values**: Profitable positions (gains)
- **Red values**: Loss-making positions
- **Sector headers**: Show sector performance summaries
- **Connection indicator**: Shows backend connectivity status

### 4. API Testing
```bash
# Test backend health
curl http://localhost:3001/health

# Generate JWT token
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"your_api_key_here"}'

# Get portfolio data
curl http://localhost:3001/api/portfolio \
  -H "Authorization: Bearer your_jwt_token_here"
```

## 🔧 Configuration

### Backend Configuration
- **Caching**: Portfolio data cached for 30 seconds, prices for 15 seconds
- **Rate Limiting**: 100 requests per 15 minutes (general), 20 per minute (stock data)
- **Security**: CORS enabled, Helmet security headers, JWT expiration
- **External APIs**: Yahoo Finance (primary), Google Finance (P/E ratios)

### Frontend Configuration
- **Auto-refresh**: can be enabled in `page.tsx`
- **Error Handling**: Comprehensive error messages and connection status
- **Responsive Design**: Supports desktop, tablet, and mobile devices
- **Real-time Updates**: Manual refresh with visual loading states

## 🐛 Troubleshooting

### Common Backend Issues

1. **"JWT_SECRET is not set" error**:
   ```bash
   # Add to backend/.env
   JWT_SECRET=your_minimum_32_character_secret_key_here
   ```

2. **"Invalid API key" error**:
   ```bash
   # Ensure API_KEY in .env matches the key used in token generation
   API_KEY=your_secure_api_key
   ```

3. **External API failures**:
   - Check internet connection
   - Yahoo Finance/Google Finance may have temporary outages
   - System returns cached data or fallback values

### Common Frontend Issues

1. **"Access token is required" error**:
   ```bash
   # Generate new JWT token and add to frontend/.env.local
   NEXT_PUBLIC_JWT_TOKEN=your_valid_jwt_token
   ```

2. **"Failed to load portfolio data" error**:
   - Ensure backend is running on port 3001
   - Check if JWT token is valid and not expired
   - Verify API_URL in frontend environment variables

3. **Empty portfolio or connection issues**:
   - Check browser console for specific error messages
   - Verify CORS settings in backend
   - Ensure both servers are running

### Performance Issues
- **Slow loading**: Backend caches data for faster responses
- **Rate limiting**: Reduce API request frequency if hitting limits
- **Memory usage**: Restart servers if experiencing memory issues

## 🧪 Development Guide

### Available Scripts

**Backend:**
```bash
npm run dev     # Development with nodemon
npm start       # Production server
npm run lint    # ESLint checking
npm run format  # Code formatting
npm test        # Run tests
```

**Frontend:**
```bash
npm run dev     # Development server (port 3000)
npm run build   # Production build
npm start       # Production server
npm run lint    # ESLint checking
```

### Project Structure

**Backend Structure :**
- `src/controllers/` - Streamlined business logic and API handlers
- `src/routes/` - Essential API endpoint definitions
- `src/services/` - external API integrations (Yahoo Finance, Google Finance)
- `src/middleware/` - Authentication, rate limiting, error handling
- `src/utils/` - Shared utilities including HTTP client and data helpers

**Frontend Structure:**
- `app/` - Next.js app directory with pages and layouts
- `components/` - React components for UI
- `lib/` - API client and utility functions
- `types/` - TypeScript type definitions

### Development Workflow
1. **Start backend**: `cd backend && npm run dev`
2. **Generate JWT token**: Use POST /api/auth/token
3. **Start frontend**: `cd frontend && npm run dev`
4. **Test changes**: Both servers auto-reload on code changes
5. **Debug**: Check browser console and terminal logs

## 📈 Current Implementation Status

### ✅ Fully Working
- **Backend**: JWT authentication, portfolio data aggregation, Yahoo Finance integration, caching, rate limiting
- **Frontend**: Portfolio dashboard, stock table, sector grouping, responsive design, error handling
- **Integration**: Secure API communication, real-time data display, connection monitoring

### ❌ Future Enhancements
- **Database integration**: Currently uses hard-coded portfolio data
- **User management**: Multiple portfolios, user accounts
- **Advanced analytics**: Charts, historical data, performance metrics
- **WebSocket updates**: Real-time price streaming


## 📄 License

This project is part of the Dynamic Portfolio Dashboard system for educational and portfolio tracking purposes.

---

## 🙋‍♂️ Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are correctly set
3. Ensure both backend and frontend servers are running
4. Check browser console and terminal logs for specific error messages

For development questions, refer to the detailed API documentation and project structure sections above.

