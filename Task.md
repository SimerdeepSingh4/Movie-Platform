# Full Stack Movie Platform – Project Task

## Project Overview

Build a **full-stack movie discovery platform** where users can explore movies and TV shows, search content in real time, watch trailers, and manage their movie preferences.

The platform will use the **TMDB (The Movie Database) API** for movie data and a **custom backend** for handling user data such as favorites, watch history, and authentication.

This project will help you understand how to build a **real-world production-level application** using modern technologies like **React, Redux Toolkit, API integration, backend development, authentication, and performance optimization**.

---

# Tech Stack

### Frontend

- React.js
- Redux Toolkit
- React Router
- TMDB API
- Debouncing
- Infinite Scroll
- Responsive UI

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Additional Tools

- Axios / Fetch
- Loader animations
- Error handling
- Responsive design

---

# Core Features

## Movie Data Integration

Fetch movie and TV show data using **TMDB API** and organize it into sections:

- Trending
- Popular
- Movies
- TV Shows
- People
- Images / Media

All sections must display **dynamic data from the API**.

---

## Real-Time Search

Users should be able to search for:

- Movies
- TV Shows
- Actors / People

Requirements:

- Real-time search results
- **Debouncing** to prevent unnecessary API calls
- Results sorted by relevance

---

## Movie Trailer Feature

Each movie should include a **trailer preview**.

Requirements:

- Fetch trailer via **YouTube links**
- Display trailer inside the app
- Open trailer in **modal or preview player**

If a trailer is unavailable, show:

> "Trailer for this movie is currently unavailable."
> 

The app **must not crash**.

---

## Loader & Skeleton UI

When data is loading:

- Display **loader animation or skeleton screen**
- Keep UI smooth and responsive.

---

## User Authentication

Users should be able to:

- Sign Up
- Log In
- Log Out

Authentication must use **JWT tokens**.

---

## Favorites Feature

Users can:

- Add movies to **Favorites**
- Remove movies
- View favorite movies in a **Favorites section**

Favorites must be stored in the **backend database**.

---

## Watch History

When a user:

- Opens a movie page
- Watches a trailer

That movie should be saved in **Recent Watch History**.

Users must be able to view their **recently watched movies**.

Data must be stored in the **database**.

---

## Admin Panel

Create a separate **Admin Dashboard**.

Admin can:

- Add movies
- Edit movie details
- Delete movies
- View users
- Ban users
- Delete users

### Movie Fields

Admin must provide:

- Movie Title
- Poster Image URL
- Description
- Movie ID
- Release Date
- Trailer YouTube Link
- Genre
- Category

The trailer should display using the **YouTube link**.

---

# Backend CRUD Operations

| Operation | Description |
| --- | --- |
| Create | Admin adds movies |
| Read | Fetch movies and users |
| Update | Edit movie details |
| Delete | Remove movies |

---

# Error Handling

The application must handle missing data:

- Missing poster → show **placeholder image**
- Missing description → `"Description not available"`
- Missing trailer → `"Trailer not available"`

The UI should **never break**.

---

# Infinite Scrolling

Instead of pagination:

- Implement **Infinite Scroll**
- Load more movies when the user reaches the bottom.Responsive Design

---

The application must work smoothly on:

- Desktop
- Tablet
- Mobile

---

# UI & UX Expectations

The interface should be:

- Clean and modern
- Interactive
- Smooth animations
- Well-spaced layout
- Attractive movie cards

Students are encouraged to **improve UI creatively**.

---

# Performance Optimizations

Implement:

- **Debouncing** for search
- **Lazy loading**
- Efficient API usage
- Proper state management with **Redux Toolkit**

---

# Bonus Features

Optional improvements:

- Dark / Light mode
- Movie ratings
- Genre filters
- Bookmark system
- Watchlist