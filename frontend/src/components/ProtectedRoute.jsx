import api from "../api";
import {jwtDecode} from "jwt-decode";
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "./Loader"; //  composant Loader

const ProtectedRoute = ({children}) => {

    const[isAuthorised, setisAuthorised] = useState(null)   
    const location = useLocation()

    useEffect(function(){
        auth().catch(() => setisAuthorised(false))
    }, [])

    async function refreshToken() {
        const refreshToken = localStorage.getItem("refresh")

        try{

            const res = await api.post("/token/refresh/", {
                refresh : refreshToken,
            });
            if (res.status === 200){
                localStorage.setItem("access", res.data.access)
                setisAuthorised(true)
            }else{
                setisAuthorised(false)
            }
        }

        catch(error){
            console.log(error)
            setisAuthorised(false)
        }  
    }

    async function auth() {
        const token = localStorage.getItem("access")
        if(!token){
            setisAuthorised(false)
            return;
        }

        const decoded = jwtDecode(token)
        const expiry_date = decoded.exp
        const current_time = Date.now() / 1000


        if(current_time > expiry_date){
            await refreshToken()
        }

        else{
            setisAuthorised(true)
        }   
    }

    if(isAuthorised === null){
        return <Loader/>
    }


  return (
    isAuthorised ? children : <Navigate to="/connexion" state={{form: location}} replace />
  )
}

export default ProtectedRoute