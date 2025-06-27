import { toast } from "sonner"

const { useState } = require("react")

export const useFetch=(apiCall)=>{
    const [data,setData]=useState(null)
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState(null)

    const fetchData=async(...args)=>{
        try {
            setLoading(true)
            setError(null)
            const response=await apiCall(...args);
            setData(response)
        } catch (error) {
            setError(error)
            toast.error(error.message)
        }finally{
            setLoading(false)
        }
    }
    return {data,loading,error,fetchData,setData}
}
