# ShopWise - E-commerce Platform

A full-stack e-commerce platform built with React + Redux Toolkit frontend and Node.js + Express.js + MongoDB backend.

## 🚀 Features

### Authentication & Security
- **Complete user authentication system** with JWT tokens and refresh tokens
- **OTP verification** for signup and password reset via email
- **Google OAuth integration** for easy login
- **Secure password hashing** using bcrypt
- **Session management** with automatic token refresh
- **User data isolation** - each user's data is private and secure

### E-commerce Functionality
- **Server-side cart management** with database persistence
- **Order management system** with order tracking
- **User profile management** with address and contact information
- **Product search and filtering**
- **Responsive design** for all device types

### Backend API
- **RESTful API** with proper error handling
- **Protected routes** with JWT authentication middleware
- **Database models** for User, Product, Cart, and Order
- **Email notifications** for OTP and welcome messages
- **Rate limiting** and security headers

## 📁 Project Structure

```
ShopWise_7883/
├── my-app/                   # React Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── redux/           # Redux store and slices
│   │   ├── context/         # React context (Auth)
│   │   ├── services/        # API service layer
│   │   └── assets/          # Static assets
│   ├── package.json
│   └── .env                 # Frontend environment variables
└── backend/                 # Node.js Backend
    ├── models/              # Mongoose models
    ├── routes/              # Express routes
    ├── middleware/          # Custom middleware
    ├── utils/               # Utility functions
    ├── config/              # Configuration files
    ├── server.js            # Main server file
    ├── package.json
    ├── .env                 # Backend environment variables
    └── .env.example         # Environment template
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/shopwise
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   
   Server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd my-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will run on http://localhost:5173

## 🔧 API Routes

### Authentication Routes (`/api/auth`)
- `POST /signup` - Register new user (sends OTP)
- `POST /verify-otp` - Verify OTP and complete registration
- `POST /login` - User login
- `POST /forgot-password` - Send password reset OTP
- `POST /reset-password` - Reset password with OTP
- `POST /refresh-token` - Refresh access token
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `GET /google` - Google OAuth login
- `GET /google/callback` - Google OAuth callback

### Cart Routes (`/api/cart`) - Protected
- `GET /` - Get user's cart
- `POST /add` - Add item to cart
- `PUT /update/:productId` - Update item quantity
- `DELETE /remove/:productId` - Remove item from cart
- `POST /increase/:productId` - Increase item quantity
- `POST /decrease/:productId` - Decrease item quantity
- `DELETE /clear` - Clear entire cart

### Order Routes (`/api/orders`) - Protected
- `GET /` - Get user's orders (paginated)
- `GET /:orderId` - Get specific order
- `POST /` - Create new order
- `PUT /:orderId/cancel` - Cancel order
- `GET /search/:orderNumber` - Search order by number

### User Routes (`/api/user`) - Protected
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `DELETE /account` - Delete user account

### Product Routes (`/api/products`)
- `GET /` - Get all products (with search/filter)
- `GET /:id` - Get single product
- `GET /meta/brands` - Get available brands
- `GET /meta/categories` - Get available categories

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password hashing** using bcrypt
- **Rate limiting** to prevent abuse
- **CORS configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **Input validation** using express-validator
- **User data isolation** in database

## 📧 Email Configuration

The application uses nodemailer for sending emails. Configure your email settings in the backend `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use app password for Gmail
```

## 🔍 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - Your production callback URL
6. Update `.env` with your client ID and secret

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (MongoDB Atlas recommended)
2. Configure environment variables for production
3. Deploy to platforms like Heroku, Vercel, or DigitalOcean

### Frontend Deployment
1. Update `VITE_API_URL` to your production backend URL
2. Build the project: `npm run build`
3. Deploy the `dist` folder to platforms like Netlify, Vercel, or AWS S3

## 📝 Migration from Firebase

This project has been completely migrated from Firebase authentication to a custom backend:

### What was migrated:
- ✅ Firebase Auth → JWT-based authentication
- ✅ Client-side cart → Server-side cart with database persistence
- ✅ Simple auth → Complete auth system with OTP verification
- ✅ No user data persistence → Complete user profile management
- ✅ No order system → Full order management system

### Benefits of migration:
- **Better data control** - All user data is stored in your own database
- **Enhanced security** - Custom JWT implementation with refresh tokens
- **Scalability** - Can handle complex business logic and custom features
- **Cost efficiency** - No dependency on external services
- **Flexibility** - Complete control over authentication and user management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For support, create an issue in the repository.