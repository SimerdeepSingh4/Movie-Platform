# Movie Platform Backend API

This directory contains the backend server code for the Movie Platform. It is a robust RESTful API built with **Node.js** and **Express**, responsible for database interactions, user authentication, external API communication (TMDB API), and secure data operations.

## 🚀 Core Backend Features

- **Authentication System**: Secure user registration, login, and logout handling using **JWT (JSON Web Tokens)** and HTTP-only cookies. Passwords are encrypted utilizing `bcrypt.js`. Redis is utilized for JWT token blacklisting to instantly invalidate active tokens upon logout.
- **Database Management**: Utilizes **Mongoose** to strictly model business data (Users, custom admin Movies, Profiles, etc.) in **MongoDB**.
- **External API Proxy & Caching**: Acts as an intermediary middleware to safely fetch data from the **TMDB API** without exposing API keys to the client. Uses **Redis** (`ioredis`) to deeply cache requests and improve platform performance dramatically.
- **Media Uploads**: Interacts with the **ImageKit** SDK allowing admins to upload custom avatars or custom movie posters dynamically to CDN storage.
- **Role-Based Access Control (RBAC)**: Enforces Admin-only routing and endpoints for elevated privileges (e.g., banning users or uploading manual content).

---

## 📂 Backend Folder Structure

The code is strictly organized in the `backend/src/` (or similar) files based on standard MVC-like architecture principles:

```text
backend/
├── config/         # Database connection setup, Redis configuration
├── controllers/    # Route controllers handling the core business logic
├── middleware/     # Custom Express middlewares (Auth guards, Admin guards)
├── models/         # Mongoose Data Schemas (User, Movie, Favorite, etc.)
├── routes/         # Express router definitions mapping paths to controllers
├── scripts/        # Utility scripts (e.g., Admin user seeder)
├── server.js/app.js# Main Express server configuration and entry points
├── .env            # Environment Variables (ignored by Git)
└── package.json    # Backend specific Node.js dependencies
```

---

## 🛠️ Backend Technologies & Packages

The backend is built utilizing the following core libraries:

| Package | Description |
| :--- | :--- |
| **Express.js** | Core web framework to set up REST routes and middleware. |
| **Mongoose** | Elegant MongoDB object modeling and schema validation. |
| **JWT (jsonwebtoken)** | Signs and verifies user identity tokens. |
| **Bcrypt.js** | Hashes passwords securely before saving to DB. |
| **Axios** | Makes HTTP requests to external services like TMDB. |
| **ImageKit** | SDK used to upload and deliver images via their CDN. |
| **IORedis** | Robust, performance-focused Redis client for caching API responses & token blacklisting. |
| **Dotenv** | Injects `.env` secrets into Node's `process.env`. |
| **Cors & Cookie-Parser** | Configured for safe Cross-Origin requests and cookie parsing. |

---

## ⚙️ Dependencies Setup and Running Locally

### Prerequisites
- **Node.js**
- **MongoDB** (Local instance or external Atlas cluster)
- **Redis** (Local instance or cache store)

### Steps

1. **Install Backend Dependencies**:
   Navigate to the `backend` folder and run:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file referencing any `.example` available. You will critically need:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=development
   
   # Optional but required for caching features
   REDIS_URL=redis://localhost:6379
   ```

3. **Start the Express Server**:
   
   To start with `nodemon` for active development re-compiling:
   ```bash
   npm run dev
   ```

4. **Seed the Initial Data** (Optional):
   Run the seeding script to populate an administrative user:
   ```bash
   npm run seed:admin
   ```

---

## 📡 Key API Routes

- **`/api/auth`**: Endpoints for signing up, logging in, and logging out.
- **`/api/user`**: Endpoints for interacting with the logged-in user's profile, favorites list, and watch history.
- **`/api/movies`** and **`/api/tv`**: GET endpoints for aggregating categories (Trending, Popular, Details).
- **`/api/search`**: Search aggregators.
- **`/api/admin`**: Protected POST/PUT/DELETE routes strictly for content and user management.