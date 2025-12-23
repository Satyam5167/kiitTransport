import * as adminQueries from '../queries/adminQueries.js'

//this function will send back driver's name , phone , status , vehicle
//this controller wil be called when the admin clicks on drivers tab in the navbar of admin
export const getDriverDetails = async(req, res) =>{
    const id = req.user.id
    const role = req.user.role
    if(role!=='admin') return res.status(403).json({message:'Unauthorized User'})
    
    try {
        const result = await adminQueries.getDriverDetails();
        res.json(result)
    } catch (e) {
        console.log(e.message)
        res.status(500).json({message:"Internal Server Error"})
    }
}

//this controller will return the total number of active buses
export const getTotalActiveBuses = async(req,res)=>{
    const {id, role} = req.user
    if(role!=='admin') return res.status(403).json({message:'Unauthorized User'})
    
    try {
        const result = await adminQueries.getTotalActiveBuses()
        res.json(result)
    } catch (e) {
        console.log(e.message)
        res.status(500).message({json:"Internal Server Error"})
    }
}