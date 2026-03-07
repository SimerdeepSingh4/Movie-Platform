# Movie Platform Backend

This is the backend server for the Full Stack Movie Platform. It is a robust RESTful API built with **Node.js** and **Express**, designed to handle user authentication, manage movie data (via TMDB API), and store user preferences like favorites and watch history in **MongoDB**.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure Sign Up, Log In, and Log Out using **JWT (JSON Web Tokens)**.
- **Movie Data Integration**: Acts as a proxy and aggregator for the **TMDB API** to fetch Trending, Popular, Movies, TV Shows, and detailed metadata.
- **Search**: Real-time search capabilities for movies, TV shows, and actors.
- **Media Handling**: Integration with **ImageKit** for managing image uploads (e.g., user avatars or custom movie posters).
- **Performance**: Implements caching strategies using **Redis** (via `ioredis`) to optimize API response times and reduce external API calls.

### User Features
- **Favorites List**: Users can add or remove movies from their personal favorites list.
- **Watch History**: Automatically tracks movies and trailers watched by the user.
- **Profile Management**: Secure management of user credentials.

### Admin Dashboard
- **Content Management**: Admin users can add, edit, or delete custom movie entries.
- **User Management**: Admins can view user lists and ban/delete users.

---

## 🛠️ Tech Stack & Key Packages

The backend is built using the following key technologies and libraries:

| Package | Description |
| :--- | :--- |
| **Express.js** | Fast, unopinionated, minimalist web framework for Node.js. |
| **Mongoose** | Elegant MongoDB object modeling for Node.js. |
| **JWT (jsonwebtoken)** | Used for securely transmitting information between parties as a JSON object. |
| **Bcrypt.js** | Library to help hash passwords before saving them to the database. |
| **Axios** | Promise-based HTTP client for making requests to the TMDB API. |
| **ImageKit** | SDK for image optimization and transformation. |
| **IORedis** | A robust, performance-focused Redis client for Node.js used for caching. |
| **Dotenv** | Zero-dependency module that loads environment variables from a `.env` file. |
| **Cors** | Middleware to enable Cross-Origin Resource Sharing. |
| **Cookie-Parser** | Parse Cookie header and populate `req.cookies`. |

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** (v14+ recommended)
- **MongoDB** (Local or Atlas URI)
- **Redis** (Local or Cloud instance)

### Steps

1. **Clone the repository** (if you haven't already) and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root of the `backend` directory and add the following variables:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development

   # Redis Configuration (Optional but recommended)
   REDIS_URL=redis://localhost:6379
   ```

4. **Run the Server**:
   
   For development (uses `nodemon` for hot-reloading):
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

5. **Seed Admin User**:
   To create an initial admin account, run the seed script:
   ```bash
   npm run seed:admin
   ```

---

## 📡 API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /signup`: Register a new user.
- `POST /login`: Authenticate user and return token.
- `POST /logout`: Clear auth cookies/tokens.

### Movies & TV (`/api/v1/movie`, `/api/v1/tv`)
- `GET /trending`: Get trending content.
- `GET /:id/details`: Get detailed info for a specific movie/show.
- `GET /:id/trailers`: Get YouTube trailer links.
- `GET /:id/similar`: Get similar content recommendations.
- `GET /:category`: Get movies by category (popular, top_rated, etc.).

### Search (`/api/v1/search`)
- `GET /:query`: Search for movies, TV shows, or people.

### User (`/api/v1/user`)
- `GET /profile`: Get current user profile.
- `POST /favorites`: Add to favorites.
- `DELETE /favorites`: Remove from favorites.
- `GET /history`: Get watch history.

### Admin (`/api/v1/admin`)
- `POST /movie`: Add a new movie manually.
- `PUT /movie/:id`: Update movie details.
- `DELETE /movie/:id`: Delete a movie.
- `GET /users`: List all users.
- `DELETE /users/:id`: Ban/Delete a user.

---

## 📂 Folder Structure

```text
backend/
├── config/         # Database and external service configuration
├── controllers/    # Logic for handling API requests
├── middleware/     # Auth checks, error handling, validation
├── models/         # Mongoose schemas (User, Movie, etc.)
├── routes/         # API route definitions
├── services/       # Business logic (TMDB service, ImageKit service)
├── utils/          # Helper functions (token generation, error classes)
├── scripts/        # Database seeding scripts
├── server.js       # Entry point of the application
└── package.json    # Dependencies and scripts
```

## 🛡️ Security Practices

- **Password Hashing**: All user passwords are hashed using `bcryptjs` before storage.
- **JWT Authentication**: Stateless authentication using JSON Web Tokens.
- **Environment Variables**: Sensitive keys are stored in `.env` and not committed to version control.
- **CORS**: Configured to allow requests only from the frontend application.

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.