import {createBrowserRouter} from 'react-router-dom'
import Login from '../src/auth/pages/Login'
import Register from '../src/auth/pages/Register'
import Layout from './components/Layout'
import Home from './home/pages/Home'
import Search from './search/pages/Search'
import MovieDetails from './movie/pages/MovieDetails'
import Movies from './movie/pages/Movies'
import PlatformCollection from './movie/pages/PlatformCollection'
import TvShows from './tv/pages/TvShows'
import TvDetails from './tv/pages/TvDetails'
import PersonDetails from './person/pages/PersonDetails'
import Favorites from './profile/pages/Favorites'
import Watchlist from './profile/pages/Watchlist'
import History from './profile/pages/History'
import NotFoundScreen from './pages/NotFoundScreen'

// Admin
import AdminGuard from './admin/components/AdminGuard'
import AdminLayout from './admin/components/AdminLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import UserManagement from './admin/pages/UserManagement'
import MovieManagement from './admin/pages/MovieManagement'

export const router = createBrowserRouter([
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
])