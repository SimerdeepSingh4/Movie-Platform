import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'

const Protected = ({ children }) => {
    const { user, loading, initialized, handleGetMe } = useAuth()

    useEffect(() => {
        if (!initialized) {
            handleGetMe();
        }
    }, [initialized, handleGetMe]);

    if (loading || !initialized) {
        return <h1>Loading...</h1>
    }

    if (!user) {
        return <Navigate to="/login" />
    }
    return children

}

export default Protected
