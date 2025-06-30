# Portfolio Dashboard Backend

A robust Node.js backend API for the Dynamic Portfolio Dashboard that provides real-time stock portfolio data with comprehensive financial metrics from Yahoo Finance and Google Finance.

## 🚀 Current Features

- **JWT Authentication**: Secure API access with API key-based token generation
- **Portfolio Management**: Complete portfolio data with 25+ pre-configured stocks across multiple sectors
- **Real-time Data Integration**: Live stock prices and financial metrics from Yahoo Finance and Google Finance
- **Essential Financial Metrics**: P/E ratios, market cap, earnings, dividends, and key financial indicators
- **Sector-wise Analytics**: Portfolio grouping and analysis by sectors (Financial, Technology, Consumer, Power, etc.)
- **Advanced Caching**: Node-cache implementation for performance optimization
- **Rate Limiting**: Intelligent rate limiting to prevent API abuse
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Health Monitoring**: System health check endpoint

## 🛠 Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Data Sources**: Yahoo Finance API, Google Finance API
- **Caching**: Node-cache
- **Security**: Helmet, CORS, Rate Limiting
- **Utilities**: Shared HTTP client, optimized data processing
- **Validation**: Joi
- **Logging**: Morgan
- **Development**: Nodemon, ESLint, Prettier

## 📋 API Endpoints

### Authentication Endpoints
- `POST /api/auth/token` - Generate JWT token using API key
- `GET /api/auth/verify` - Verify JWT token validity

### Portfolio Endpoints
- `GET /api/portfolio` - Get complete portfolio data with all stocks and summary
- `GET /api/portfolio/sectors` - Get sector-wise portfolio summary
- `GET /api/portfolio/prices?symbols=` - Get real-time price updates for specific symbols

### Stock Endpoints
- `GET /api/stocks/:symbol` - Get detailed information for a specific stock

### System Endpoints
- `GET /health` - Health check endpoint

## 📊 Portfolio Data Structure

The backend currently manages a diversified portfolio with 25+ stocks across multiple sectors:

### **Sectors Included:**
- **Financial**: HDFC Bank, Bajaj Finance, ICICI Bank, Bajaj Holdings, SBI Life
- **Technology**: Affle India, LTI Mindtree, KPIT Tech, Tata Tech, BLS E-Services, Tanla
- **Consumer**: D-Mart, Tata Consumer, Pidilite
- **Power**: Tata Power, KPI Green, Suzlon, Gensol
- **Pipe**: Hariom Pipes, Astral, Polycab
- **Others**: Clean Science, Deepak Nitrite, Fine Organic, Gravita

### **Essential Financial Metrics Provided:**
- Current Market Price (CMP)
- Purchase Price and Quantity
- Investment Amount and Present Value
- Gain/Loss (Amount and Percentage)
- Portfolio Percentage
- P/E Ratio and Market Cap
- Day Change and Volume
- Dividend Yield and Financial Ratios
- Latest Earnings Information

*Optimized to return only essential fields needed by the frontend for improved performance.*

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Internet connection for fetching live market data

### Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   API_KEY=your_api_key_here

4. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Verify server is running**:
   Navigate to `http://localhost:3001/health`

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3001 |
| `NODE_ENV` | Environment mode | No | development |
| `FRONTEND_URL` | Frontend URL for CORS | No | http://localhost:3000 |
| `JWT_SECRET` | JWT signing secret | **Yes** | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | 7d |
| `API_KEY` | API key for token generation | **Yes** | - |

## 🔐 Authentication Flow

### 1. Generate JWT Token

```bash
POST /api/auth/token
Content-Type: application/json

{
  "apiKey": "your_api_key_here" 
  #This apiKey you are giving should match with API_KEY in .env file
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

### 2. Use JWT Token in Requests

```bash
GET /api/portfolio
Authorization: Bearer your_jwt_token_here
```

## 📖 API Documentation

### Get Portfolio Data

```bash
GET /api/portfolio
Authorization: Bearer <jwt_token>
```

**Response:**
```json structure
{
  "success": true,
  "data": {
    "stocks": [],
    "summary": {
      "totalStocks": 0,
      "totalInvestment": 0,
      "totalCurrentValue": 0,
      "totalGainLoss": 0,
      "overallGainLossPercent": 0
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Stock Endpoints
- `GET /api/stocks/:symbol` - Get detailed information for a specific stock

### Get Sector Summary

```bash
GET /api/portfolio/sectors
Authorization: Bearer <jwt_token>
```

### Get Real-time Prices

```bash
GET /api/portfolio/prices?symbols=HDFCBANK.NS,ICICIBANK.NS
Authorization: Bearer <jwt_token>
```

## 🏗 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── constants.js          # Configuration constants
│   ├── controllers/
│   │   ├── authController.js     # JWT token generation
│   │   ├── portfolioController.js # Portfolio data management
│   │   └── stockController.js    # Individual stock operations
│   ├── middleware/
│   │   ├── errorHandler.js       # Global error handling
│   │   ├── jwtAuth.js           # JWT authentication middleware
│   │   └── rateLimiter.js       # API rate limiting
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── portfolio.js         # Portfolio routes
│   │   └── stocks.js            # Stock routes
│   ├── services/
│   │   ├── dataAggregationService.js # Portfolio data aggregation
│   │   ├── googleFinanceService.js   # Google Finance integration
│   │   └── yahooFinanceService.js    # Yahoo Finance integration
│   ├── utils/
│   │   ├── cache.js             # Caching utilities
│   │   ├── dataValidator.js     # Data validation utilities
│   │   └── httpClient.js        # Shared HTTP client utilities
│   └── index.js                 # Main server entry point
├── package.json
└── README.md
```

## ⚡ Performance Features

### Caching Strategy
- **Portfolio Data**: Cached for 30 seconds
- **Stock Prices**: Cached for 15 seconds
- **Stock Details**: Cached for 60 seconds
- **Sector Summary**: Cached for 30 seconds

### Rate Limiting
- **General Endpoints**: 100 requests per 15 minutes
- **Stock Data Endpoints**: 20 requests per minute

### Error Handling
- Graceful fallback when external APIs fail
- Comprehensive error messages
- Automatic retry mechanisms
- Connection timeout handling

## 🔧 Configuration

### Rate Limiting Configuration

```javascript
// General endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
});

// Stock data endpoints
const stockDataLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // requests per window
});
```

### Cache Configuration

```javascript
const CACHE_TTL = {
  PORTFOLIO: 30,      // seconds
  STOCK_PRICE: 15,    // seconds
  STOCK_DETAILS: 60,  // seconds
  SECTOR_SUMMARY: 30  // seconds
};
```

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (Jest)
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Development Workflow

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test API endpoints**:
   ```bash
   curl http://localhost:3001/health
   ```

3. **Generate JWT token**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/token \
     -H "Content-Type: application/json" \
     -d '{"apiKey":"your_api_key_here"}'
   ```

4. **Test portfolio endpoint**:
   ```bash
   curl http://localhost:3001/api/portfolio \
     -H "Authorization: Bearer your_jwt_token_here"
   ```


### Yahoo Finance Integration
- **Real-time Prices**: Current market prices, day changes, volume
- **Financial Metrics**: P/E ratios, market cap, financial ratios
- **Historical Data**: 52-week high/low, averages
- **Earnings**: Latest earnings data and estimates

### Google Finance Integration
- **Fundamentals**: P/E ratios, additional financial metrics (as backup)
- **Earnings**: Earnings announcements and dates
- **Market Data**: Supplementary market information

## 📊 Implementation Status

### ✅ Fully Implemented
- JWT authentication with API key
- Portfolio data aggregation from Yahoo Finance
- Real-time price updates
- Sector-wise portfolio analysis
- Comprehensive financial metrics
- Caching and rate limiting
- Error handling and logging
- CORS and security headers

### 🚧 Partially Implemented
- Google Finance integration (P/E ratios working as backup)
- Historical data analysis

### ❌ Not Yet Implemented
- User portfolio management (currently hard-coded)
- Database integration
- Advanced analytics and alerts

## 🐛 Troubleshooting

### Common Issues

1. **"JWT_SECRET is not set" error**:
   - Ensure `JWT_SECRET` is set in your `.env` file
   - Restart the server after adding environment variables

2. **"Invalid API key" error**:
   - Verify `API_KEY` matches the value in your `.env` file
   - Check for extra spaces or characters in the API key

3. **External API failures**:
   - Check internet connectivity
   - External APIs may have rate limits or temporary outages
   - The system will return cached data or fallback values

4. **CORS errors**:
   - Ensure `FRONTEND_URL` is correctly set
   - Check that the frontend is running on the specified URL

### Performance Optimization

- **Caching**: Data is cached to reduce external API calls
- **Rate Limiting**: Prevents API abuse and ensures fair usage
- **Compression**: Gzip compression for faster response times
- **Error Handling**: Graceful degradation when external services fail

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": object|array,
  "timestamp": "ISO-8601-timestamp",
  "error": "error-message" // Only present if success is false
}
```

## 🔮 Future Roadmap

### Short Term (Next 1-2 months)
- Enable real-time auto-refresh in frontend
- Integrate additional backend API endpoints
- Add interactive charts with Recharts
- Implement dark mode support

### Medium Term (3-6 months)
- Database integration for dynamic portfolio management
- User authentication and multiple portfolios
- Advanced filtering and search capabilities
- Historical performance analytics

### Long Term (6+ months)
- Mobile application development
- Machine learning price predictions
- Portfolio optimization algorithms
- Social features and portfolio sharing

