import { useAuth } from '../hooks/useAuth'
import { Navigate, Outlet } from 'react-router-dom'

const Protected = ({ children }) => {
    const { user, initialized } = useAuth()

    if (!initialized) {
        return (
            <div className="flex justify-center items-center py-24 min-h-screen bg-background">
                <div className="relative">
                    <div className="h-14 w-14 rounded-full border-4 border-muted"></div>
                    <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }
    
    return children || <Outlet />
}

export default Protected
