import * as adminQueries from '../queries/adminQueries.js'

//this function will send back driver's name , phone , status , vehicle
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
