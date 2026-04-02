import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AuthInitializer from './auth/components/AuthInitializer';
import Layout from './components/Layout';

// Lazy load all pages
const Home = lazy(() => import('./home/pages/Home'));
const Search = lazy(() => import('./search/pages/Search'));
const MovieDetails = lazy(() => import('./movie/pages/MovieDetails'));
const Movies = lazy(() => import('./movie/pages/Movies'));
const PlatformCollection = lazy(() => import('./movie/pages/PlatformCollection'));
const TvShows = lazy(() => import('./tv/pages/TvShows'));
const TvDetails = lazy(() => import('./tv/pages/TvDetails'));
const PersonDetails = lazy(() => import('./person/pages/PersonDetails'));
const Favorites = lazy(() => import('./profile/pages/Favorites'));
const Watchlist = lazy(() => import('./profile/pages/Watchlist'));
const History = lazy(() => import('./profile/pages/History'));
const NotFoundScreen = lazy(() => import('./pages/NotFoundScreen'));

// Auth (keeping eager as they are small and entry points)
import Login from '../src/auth/pages/Login';
import Register from '../src/auth/pages/Register';

// Admin
import AdminGuard from './admin/components/AdminGuard';
import AdminLayout from './admin/components/AdminLayout';
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const UserManagement = lazy(() => import('./admin/pages/UserManagement'));
const MovieManagement = lazy(() => import('./admin/pages/MovieManagement'));

export const router = createBrowserRouter([
    {
        element: <AuthInitializer />,
        children: [
            {
                path: "/",
                element: <Layout />,
                children: [
                    {
                        index: true,
                        element: <Home />
                    },
                    {
                        path: "search",
                        element: <Search />
                    },
                    {
                        path: "movie/:id",
                        element: <MovieDetails />
                    },
                    {
                        path: "movies",
                        element: <Movies />
                    },
                    {
                        path: "platform/:providerId",
                        element: <PlatformCollection />
                    },
                    {
                        path: "tv",
                        element: <TvShows />
                    },
                    {
                        path: "tv/:id",
                        element: <TvDetails />
                    },
                    {
                        path: "person/:id",
                        element: <PersonDetails />
                    },
                    {
                        path: "favorites",
                        element: <Favorites />
                    },
                    {
                        path: "watchlist",
                        element: <Watchlist />
                    },
                    {
                        path: "history",
                        element: <History />
                    }
                ]
            },
            {
                path: "/admin",
                element: <AdminGuard />,
                children: [
                    {
                        path: "",
                        element: <AdminLayout />,
                        children: [
                            {
                                index: true,
                                element: <AdminDashboard />
                            },
                            {
                                path: "users",
                                element: <UserManagement />
                            },
                            {
                                path: "movies",
                                element: <MovieManagement />
                            }
                        ]
                    }
                ]
            },
            {
                path:"/login",
                element:<Login/>
            },
            {
                path:"/register",
                element:<Register/>
            },
            {
                path: "*",
                element: <NotFoundScreen />
            }
        ]
    }
])