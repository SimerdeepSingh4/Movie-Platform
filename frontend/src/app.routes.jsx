import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AuthInitializer from './auth/components/AuthInitializer';
import Protected from './auth/components/Protected';
import Layout from './components/Layout';
import PageLoader from './components/PageLoader';

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
const Profile = lazy(() => import('./profile/pages/Profile'));
const NotFoundScreen = lazy(() => import('./pages/NotFoundScreen'));

// Auth
const Login = lazy(() => import('./auth/pages/Login'));
const Register = lazy(() => import('./auth/pages/Register'));

// Admin
import AdminGuard from './admin/components/AdminGuard';
import AdminLayout from './admin/components/AdminLayout';
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const UserManagement = lazy(() => import('./admin/pages/UserManagement'));
const MovieManagement = lazy(() => import('./admin/pages/MovieManagement'));

export const router = createBrowserRouter([
    {
        element: (
            <Suspense fallback={<PageLoader />}>
                <AuthInitializer />
            </Suspense>
        ),
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
                        path: "movies",
                        element: <Movies />
                    },
                    {
                        path: "tv",
                        element: <TvShows />
                    },
                    // Protected Routes
                    {
                        element: <Protected />,
                        children: [
                            {
                                path: "movie/:id",
                                element: <MovieDetails />
                            },
                            {
                                path: "platform/:providerId",
                                element: <PlatformCollection />
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
                            },
                            {
                                path: "profile",
                                element: <Profile />
                            }
                        ]
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