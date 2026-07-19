const JWT = require("jsonwebtoken")
const userModel = require("../models/userModel")
const { runCatchUp } = require("../services/recurringRuleService")


const requiredSignIn = async(req,res,next) => {
    try{
        if (!req.headers.authorization) {
            return res.status(401).send({
                success: false,
                message: "Authorization token required"
            });
        }
        
        const token = req.headers.authorization.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.headers.authorization;
        

        const decode = JWT.verify(token, process.env.JWT_SECRET);

        // Fetch full user details from database
        const user = await userModel.findById(decode._id).select('-password_hash');
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "User not found"
            });
        }
        
        req.user = user;

        try {
            await runCatchUp(user._id);
        } catch (catchUpErr) {
            console.log(catchUpErr);
        }

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