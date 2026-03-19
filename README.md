# Full Stack Movie Platform

Welcome to the **Movie Platform**! This is a comprehensive, full-stack web application designed for discovering movies, TV shows, and actors, complete with user authentication, custom watchlists, and an administrative dashboard.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge&logoColor=white)](https://movie-platform-1-3xep.onrender.com/)

## Admin's credentials
email: `admin@example.com` <br>
pass: `admin123`

##

## 🌟 Project Highlights & Good Points

This application was built with modern web development practices and features several high-end user experience enhancements:

- **Endless Scrolling**: The Movies, TV Shows, and Search pages feature seamless infinite scrolling. This allows users to effortlessly discover vast amounts of content from the TMDB database without the friction of traditional pagination.
- **Beautiful & Dynamic UI**: The frontend utilizes GSAP and Motion for fluid animations, paired with Tailwind CSS and Shadcn for a premium, responsive design.
- **Robust Backend Architecture**: The backend efficiently proxies TMDB API calls, caching results in Redis to drastically improve load times and reduce external API rate limits. Additionally, Redis is used for JWT token blacklisting during user logouts to ensure secure session termination.
- **Comprehensive User Profiles**: Once authenticated securely via JWT, users can maintain their own specific Favorites, a custom Watchlist, and have their Watch History automatically tracked.
- **Admin Capabilities**: Includes a protected Admin Dashboard allowing owners to manually add custom movies (with ImageKit poster integration), and manage or ban users.

---

## 🚀 Recent Updates

We have recently upgraded CineBase with high-end cinematic features and technical polish:

- **Cinematic UI Redesign**: Re-engineered the Movie and TV detail pages for a more immersive, "backdrop-first" experience. Features refined vertical accents, glassmorphic info points, and high-contrast typography.
- **PWA Support**: CineBase is now a **Progressive Web App**. You can install it on your iOS, Android, or Desktop device for a standalone, app-like experience with offline capabilities.
- **Intelligent Data Labels**: Future releases now show smart labels like "Coming to Netflix" or "Digital Release" based on real-time production and provider data.
- **Navigation Polish**: Added automatic scroll-reset on page transitions and enhanced data fetching resilience using `Promise.allSettled`.

---

## 🏗️ Project Architecture

The project is divided into two distinct parts:

1. **Frontend**: A React 19 application built with Vite, utilizing Redux Toolkit for state management and Tailwind CSS for styling.
2. **Backend**: A Node.js and Express server, interacting securely with a MongoDB database using Mongoose, and Redis for request caching.

---

## 💻 Technologies Used

### Frontend Stack
- **React 19** & **Vite**
- **Tailwind CSS v4** & **Shadcn UI**
- **Redux Toolkit** (State Management)
- **React Router DOM** (Routing)
- **GSAP** & **Motion** (Animations)
- **Axios** (Data fetching)

### Backend Stack
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (Database)
- **Redis** & **ioredis** (Caching & Token Blacklisting)
- **JWT** & **Bcrypt.js** (Authentication & Security)
- **ImageKit** (Image upload & management)

---

## 🚀 How to Use / Getting Started

To run this project locally, you will need Node.js, a MongoDB instance, and preferably a Redis server.

### 1. Database & External Services Setup
- Setup a MongoDB database (e.g., MongoDB Atlas).
- Create an ImageKit account to get your keys for image uploads.
- (Optional but recommended) Run a local Redis server or setup a cloud Redis instance.
- Obtain an API key from TMDB (The Movie Database).

### 2. Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` folder based on `.env.example` (or configure `MONGO_URI`, `JWT_SECRET`, `PORT`, `REDIS_URL`, etc.)
4. Seed the initial admin user: `npm run seed:admin`
5. Start the development server: `npm run dev` (runs on port 5000 by default).

*For more details, see the [Backend README](./backend/README.md).*

### 3. Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development environment: `npm run dev`
4. The application will be available at `http://localhost:5173`.

*For more details, see the [Frontend README](./frontend/README.md).*

---

## 🙋‍♂️ Author

**Simerdeep Singh Gandhi**

- Portfolio: [https://simerdeep-portfolio.vercel.app/](https://simerdeep-portfolio.vercel.app/)
- GitHub: [@SimerdeepSingh4](https://github.com/SimerdeepSingh4)
- LinkedIn: [Simerdeep Singh Gandhi](https://www.linkedin.com/in/simerdeep-singh-gandhi/)

---

## ✨ Show Your Support

Give a ⭐️ if this project helped you!
