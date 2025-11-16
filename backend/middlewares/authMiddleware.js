const JWT = require("jsonwebtoken")
const userModel = require("../models/userModel")


const requiredSignIn = async(req,res,next) => {
    try{
        if (!req.headers.authorization) {
            return res.status(401).send({
                success: false,
                message: "Authorization token required"
            });
        }
        
        const decode = JWT.verify(
            req.headers.authorization, 
            process.env.JWT_SECRET
        );
        req.user = decode;
        next()
    
    }
    catch(err){
        console.log(err);
        return res.status(401).send({
            success: false,
            message: "Invalid or expired token"
        });
    }
}
module.exports = {requiredSignIn}