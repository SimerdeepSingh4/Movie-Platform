import {createBrowserRouter} from 'react-router-dom'
import Login from '../src/auth/pages/Login'
import Register from '../src/auth/pages/Register'
import Layout from './components/Layout'
import Home from './home/pages/Home'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />
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
])