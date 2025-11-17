# 🛍️ E-Commerce Store - Full Stack Application

An innovative, responsive, and interactive e-commerce frontend built with vanilla HTML, CSS, and JavaScript, featuring a Node.js/Express backend for authentication.

## ✨ Features

### Frontend Features
- **Product Display**: Beautiful product cards with images, titles, prices, and ratings
- **Search & Filter**: Real-time search and category filtering
- **Sorting**: Sort products by price (low to high, high to low) and rating
- **Favorites**: Add/remove products to favorites (stored in localStorage)
- **Product Details**: Modal popup showing detailed product information
- **Cart & Checkout**: Persistent cart with quantity controls and a full checkout form (shipping + payment)
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Fully responsive layout using Flexbox and CSS Grid
- **Smooth Animations**: Hover effects and transitions throughout
- **Floating Action Button**: Quick access to favorites sidebar
- **Real-Time Analytics**: Dashboard visualizations for revenue, orders, and category performance

### Authentication Features
- **User Registration**: Create new accounts with email and password
- **User Login**: Secure login with JWT token authentication
- **Protected Routes**: Dashboard accessible only to authenticated users
- **Token Storage**: JWT tokens stored securely in `sessionStorage`

### Dashboard Features
- **Order Management**: View every order with shipping details, status, and line items
- **Real-Time Analytics**: Revenue, total orders, AOV, category breakdowns, and trend charts
- **User Profile**: Display user information

### Backend Features
- **RESTful API**: Express.js backend with authentication, orders, and analytics endpoints
- **MongoDB Storage**: Mongoose models for users and orders (no more JSON flat files)
- **Password Hashing**: Secure password storage using bcrypt
- **JWT Tokens**: JSON Web Token generation for secure authentication
- **Analytics Aggregation**: On-demand calculations for revenue, orders, and category performance

## 📁 Project Structure

```
ecommerce/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # All styling including dark mode
│   ├── script.js           # Frontend JavaScript logic
│   └── data.json          # Mock product data
├── backend/
│   ├── index.js           # Express server, auth, orders, analytics
│   ├── package.json       # Backend dependencies
│   ├── ENV_SETUP.md       # Backend environment variable guide
│   └── package-lock.json
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A modern web browser

### Installation

1. **Clone or download this repository**

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`

4. **Open the frontend:**
   - Open `frontend/index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     cd frontend
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server frontend -p 8000
     ```
   - Then navigate to `http://localhost:8000` in your browser

### Alternative: Using a Live Server

If you're using VS Code, you can install the "Live Server" extension and right-click on `frontend/index.html` to open it with Live Server.

## 📖 Usage Guide

### For Users

1. **Browse Products**: View all available products on the home page
2. **Search**: Use the search bar to find specific products
3. **Filter**: Select a category from the dropdown to filter products
4. **Sort**: Choose a sorting option to organize products
5. **View Details**: Click on any product card to see detailed information
6. **Add to Favorites**: Click the heart icon to add products to favorites
7. **View Favorites**: Click the floating action button (FAB) to see your favorites
8. **Login/Signup**: Click the "Login" button to create an account or sign in
9. **Checkout**: Add items to your cart and go through the checkout form to place real orders
10. **Dashboard**: After logging in, access your dashboard to view detailed orders and analytics
11. **Dark Mode**: Toggle the theme using the moon/sun icon in the navigation bar

### For Developers

- `POST /auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /orders` - Create an order (requires `Authorization: Bearer <token>`)
  ```json
  {
    "items": [
      {
        "productId": 1,
        "title": "Wireless Headphones",
        "price": 79.99,
        "quantity": 2,
        "category": "Electronics",
        "image": "https://..."
      }
    ],
    "shipping": {
      "fullName": "John Doe",
      "phone": "+1 555-1234",
      "address": "123 Main Street",
      "city": "New York",
      "postalCode": "10001"
    },
    "paymentMethod": "card"
  }
  ```

- `GET /orders/me` - Fetch the authenticated user's orders
- `GET /analytics/overview` - Fetch revenue, order, and category analytics for the logged-in user
- `GET /health` - Health check endpoint

#### Frontend Configuration

The frontend is configured to connect to `http://localhost:3000` by default. To change this, modify the `API_BASE_URL` constant in `frontend/script.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

## 🎨 Design Features

- **Modern UI**: Clean, minimal design with a professional look
- **Color Palette**: Elegant color scheme with CSS variables for easy theming
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: Semantic HTML and ARIA labels where appropriate

## 🔒 Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens are used for authentication
- Tokens expire after 7 days
- **Important**: In production, change the `JWT_SECRET` in `backend/index.js` to a secure random string
- Consider using environment variables for sensitive data

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3 (with CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Canvas API (for charts)

### Backend
- Node.js
- Express.js
- bcrypt (password hashing)
- jsonwebtoken (JWT generation)
- CORS (Cross-Origin Resource Sharing)

## 📝 Code Structure

### Frontend (`script.js`)
- **Global Variables**: Products, favorites, user state
- **Theme Management**: Dark/light mode toggle
- **Product Management**: Loading, filtering, rendering
- **Favorites System**: localStorage-based favorites
- **Authentication**: Login/signup with API calls
- **Dashboard**: Purchase history and chart rendering

### Backend (`index.js`)
- **Express Setup**: Server configuration and middleware
- **User Management**: Reading/writing user data
- **Authentication**: Registration and login endpoints
- **Security**: Password hashing and JWT generation

## 🎯 Future Enhancements

Potential improvements for this project:
- Add a real database (MongoDB, PostgreSQL)
- Implement shopping cart functionality
- Add payment integration
- Include product reviews and ratings
- Add image upload functionality
- Implement email verification
- Add password reset functionality
- Include admin panel
- Add product management API
- Implement order management

## 🐛 Troubleshooting

### Backend won't start
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`

### Frontend can't connect to backend
- Ensure the backend server is running
- Check the `API_BASE_URL` in `script.js`
- Verify CORS is enabled in the backend
- Check browser console for errors

### Products not loading
- Ensure `data.json` is in the `frontend/` directory
- Check browser console for fetch errors
- Verify the file path is correct

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deployment options:
- **Easiest**: Vercel (Frontend) + Railway (Backend)
- **Alternative**: Netlify (Frontend) + Render (Backend)
- **Full Control**: VPS with Nginx + PM2

The backend has been configured to use environment variables for production. See [backend/ENV_SETUP.md](./backend/ENV_SETUP.md) for environment variable configuration.

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Built as a full-stack e-commerce demonstration project.

---

**Note**: This is a demonstration project. For production use, consider:
- Using a proper database
- Implementing proper error handling
- Adding input validation and sanitization
- Using environment variables for configuration
- Implementing rate limiting
- Adding HTTPS
- Setting up proper logging

