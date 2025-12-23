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

