import express from 'express'


//this function will send back driver's name , phone , status , vehicle
export const getDriverDetails = async(req, res) =>{
    const id = req.user.id
    const role = req.user.role
    if(role==='driver') return res.status(400).json({message:'Unauthorized User'})
    
    
}

