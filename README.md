# 🍳 HomeMade Food API

The **HomeMade Food API** is a comprehensive backend system built using **Express.js** and **Node.js**, designed to connect home chefs with food lovers through a seamless food delivery platform. It enables users to discover local chefs, order homemade meals, and provides chefs with powerful tools to manage their kitchen operations and track sales performance.

---

## ✨ Features

### 🔐 Authentication & Authorization

- **Multi-Platform Registration**: Users can register as customers or chefs via email/password, Google OAuth, or Facebook OAuth.
- **Email Verification**: OTP-based email verification system for account security.
- **Password Management**: Secure password reset functionality with OTP validation.
- **Role-Based Access Control**:
  - **User**: Browse meals, place orders, manage favorites, and write reviews.
  - **Chef**: Manage kitchen operations, add meals, process orders, and view analytics.
  - **Dual Role Support**: Users can seamlessly switch between customer and chef roles.

---

### 👨‍🍳 Chef Management

- **Chef Registration**: Extended registration with kitchen details, operating hours, and payment preferences.
- **Kitchen Operations**: Real-time kitchen status management (open/closed) with automated scheduling.
- **Profile Management**: Comprehensive chef profiles with social media integration and kitchen descriptions.
- **Location Services**: GPS-based kitchen address management for delivery calculations.
- **Payment Methods**: Multiple payment option support (cash, card, online).

---

### 🍽️ Meal Management

- **Meal Creation**: Chefs can add meals with multiple images, detailed descriptions, and categories.
- **Inventory Management**: Real-time stock tracking with automatic availability updates.
- **Pricing & Categories**: Flexible pricing with categorized meal organization (appetizer, main, dessert, beverage).
- **Meal Discovery**: Advanced search and filtering by category, price range, chef location, and ratings.
- **Favorites System**: Users can save favorite meals for quick reordering.
- **Recommendation Engine**: AI-powered meal recommendations based on user preferences and order history.

---

### 🛒 Order & Cart Management

- **Smart Cart System**: Chef-based cart organization with meal bundling from individual chefs.
- **Real-Time Availability**: Live stock checking and kitchen status validation during cart operations.
- **Flexible Checkout**: Multiple delivery addresses and payment method options.
- **Order Tracking**: Complete order lifecycle management from placement to delivery.
- **Order Status Updates**: Real-time status updates (ordered, preparing, ready, delivered, canceled).

---

### 📍 Location & Delivery Services

- **Address Management**: Multiple delivery address support with GPS coordinates.
- **Proximity Calculations**: Distance-based chef discovery and delivery feasibility.
- **Delivery Areas**: Chef-defined delivery zones and distance calculations.
- **Location Validation**: GPS coordinate validation and address verification.

---

### ⭐ Review & Rating System

- **Dual Review System**: Separate reviews for meals and chefs with detailed ratings.
- **Review Management**: Users can add, update, and manage their reviews.
- **Rating Analytics**: Automatic calculation of average ratings for meals and chefs.
- **Review Filtering**: Filter and sort reviews by rating, date, and relevance.

---

### 📊 Analytics & Insights

- **Sales Dashboard**: Comprehensive sales analytics for chefs including top-selling meals and revenue tracking.
- **Order Analytics**: Detailed order statistics and performance metrics.
- **Customer Insights**: User behavior analytics and ordering patterns.
- **Performance Tracking**: Kitchen efficiency and order fulfillment metrics.

---

## 🛠️ Tech Stack

- **Backend**: Express.js with modular architecture
- **Database**: MongoDB with Mongoose ODM for flexible data modeling
- **Authentication**: JWT (Access & Refresh Tokens), multi-provider OAuth integration
- **File Storage**: Cloudinary for optimized image storage and delivery
- **Email Services**: Nodemailer with OTP generation and verification
- **Security**: bcryptjs for password hashing, crypto-js for data encryption
- **Validation**: Joi for comprehensive input validation and sanitization
- **Location Services**: GPS coordinate validation and distance calculations
- **Date Management**: Moment.js and Luxon for precise time handling

---

## 🌟 Project Highlights

- **Clean Architecture**: Follows clean code principles with meaningful naming conventions and consistent formatting
- **Security First**: Comprehensive security measures including input validation, authentication, and data encryption
- **Scalable Design**: Modular architecture designed for easy scaling and feature additions
- **Performance Optimized**: Efficient database queries with proper indexing and caching strategies
- **Environment Management**: Secure handling of all sensitive data through environment variables
- **Production Ready**: Comprehensive error handling, logging, and monitoring capabilities

### 🏗️ Architecture Highlights

- **Modular Design**: Clean separation of concerns with organized modules for each feature
- **Middleware Pipeline**: Comprehensive middleware for authentication, authorization, validation, and file handling
- **Database Models**: Well-structured Mongoose schemas with proper relationships and indexing
- **Error Handling**: Global error handling with custom error classes and consistent response formats
- **API Features**: Advanced querying with pagination, sorting, filtering, and field selection
- **Environment Security**: All sensitive configurations managed through environment variables

### 📱 API Capabilities

- **RESTful Design**: Well-structured REST endpoints following industry standards
- **Search & Discovery**: Powerful search functionality with text search and location-based filtering
- **Real-Time Updates**: Live kitchen status and meal availability updates
- **File Upload Support**: Multi-file upload with validation and cloud storage integration
- **Pagination & Sorting**: Efficient data retrieval with customizable pagination and sorting options
- **Response Optimization**: Selective field retrieval and optimized response structures

---

## 🤝 Contributions

Feel free to contribute to this project by opening issues or submitting pull requests. For major changes, please open an issue first to discuss the proposed changes.

---

## 👥 Collaborators

- **[K7413dS433d](https://github.com/K7413dS433d)** - Backend Developer
- **[Toaa Mahmoud](https://github.com/ToaaMahmoud)** - Backend Developer
- **[Tasneem Helmy](https://github.com/Tasneemhelmy)** - Backend Developer
