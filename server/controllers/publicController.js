import * as publicQueries from '../queries/publicQueries.js'

//this will return the routes of every bus
export const getBusRoutes = async(req,res) =>{
    try {
        const result = await publicQueries.getBusRoutes()
        res.json(result)
    } catch (e) {
        console.log(e.message)
        res.status(500).json({message:'Internal Server Error'})
    }
}

export const getStops = async(req, res)=>{
    try {
        const result = await publicQueries.getStops()
        res.json(result)
    } catch (e) {
        console.log(e.message)
        res.status(500).json({message:'Internal Server Error'})
    }
}

export const getBusesForRoutes = async(req,res)=>{
    const {pickupId, dropId}=req.body
    try {
        const result = await publicQueries.getBusesForRoutes(pickupId, dropId)
        res.json(result)
    } catch (e) {
        console.log(e.message)
        res.status(500).json({message:'Internal Server Error'})
    }
}