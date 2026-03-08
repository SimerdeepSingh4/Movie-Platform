# Movie Platform Frontend

This is the frontend application for the Full Stack Movie Platform. It provides a rich, interactive, and beautifully designed user interface for discovering movies and TV shows, managing user profiles, and an admin dashboard for content management.

## 🚀 Key Features

- **Modern UI/UX**: Built with React 19 and styled with Tailwind CSS 4, utilizing Shadcn UI components for a polished look.
- **Dynamic Animations**: Seamless, high-performance animations powered by GSAP and Motion.
- **Endless Scrolling**: Integrated infinite scrolling on the Movies, TV Shows, and Search pages for an uninterrupted browsing experience.
- **State Management**: Robust application state handled centrally via Redux Toolkit.
- **Routing**: Client-side routing with React Router DOM, featuring nested routes and protected admin sections.
- **Responsive Design**: Fully responsive layout ensuring a great experience on mobile, tablet, and desktop devices.
- **User Features**: Authentication flows, custom watchlist, favorites, and user watch history tracking.

---

## 🛠️ Technologies Used

- **Framework**: React 19, built with Vite
- **Styling**: Tailwind CSS v4, Class Variance Authority, Tailwind Merge, clsx
- **UI Components**: Radix UI, Shadcn, Lucide React (Icons)
- **Animations**: GSAP (`@gsap/react`), Motion (`motion`), `tw-animate-css`
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Notifications**: Sonner

---

## 📂 Folder Structure

The code is organized logically within the `src/` directory:

```text
src/
├── admin/          # Admin dashboard, layout, and user/movie management pages
├── assets/         # Static assets like images and global styles
├── auth/           # Login and Registration pages/components
├── components/     # Reusable global UI components (Layout, Navbar, etc.)
├── home/           # Homepage specific components and views
├── lib/            # Utility functions, API integration instances
├── movie/          # Movie discovery, details, and platform collection pages
├── pages/          # Generic pages like NotFoundScreen
├── person/         # Actor/Person details page
├── profile/        # User-specific pages (Watchlist, Favorites, History)
├── search/         # Search functionality and results page
├── store/          # Redux store configuration and slices
├── tv/             # TV Show discovery and details pages
├── user/           # User related components/UI
├── app.routes.jsx  # Central routing configuration
├── index.css       # Global styles and Tailwind configuration
└── main.jsx        # Application entry point
```

---

## ⚙️ Setup and Installation

### Prerequisites
- **Node.js**: v18+ recommended

### Steps to Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root of the `frontend` folder and add any required API URLs (e.g., backend URL).
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will usually be available at `http://localhost:5173`.

5. Build for production:
   ```bash
   npm run build
   ```
