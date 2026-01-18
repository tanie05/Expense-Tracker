const userModel = require("../models/userModel")
const { comparePassword, hashPassword } = require("../helper/authHelper")
const JWT = require("jsonwebtoken")
const { isFeatureEnabled } = require("../helper/featureFlagHelper")

const registerController = async (req,res) =>{

    try{
        const {username, password, email} = req.body

        //validation
        if(!username){
            return res.status(400).send({success: false, message: "Username is required"})
        }
        if(!email){
            return res.status(400).send({success: false, message: "Email is required"})
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).send({success: false, message: "Invalid email format"})
        }
        
        if(!password){
            return res.status(400).send({success: false, message: "Password is required"})
        }
        
        // Password strength validation
        if(password.length < 6){
            return res.status(400).send({success: false, message: "Password must be at least 6 characters long"})
        }

        //check user
        const existingUser = await userModel.findOne({username})
        //check existing user
        if(existingUser){
            return res.status(400).send({
                success: false,
                message: "Already registered please login"
            })
        }
        
        // Check if email already exists
        const existingEmail = await userModel.findOne({email})
        if(existingEmail){
            return res.status(400).send({
                success: false,
                message: "Email already registered"
            })
        }

        //register user
        const hashedPassword = await hashPassword(password)
        //save
        const user = await new userModel({username,password:hashedPassword,email}).save()
        
        //token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Check chatbot feature flag
        const userId = user._id.toString();
        const { enabled: chatbotEnabled } = await isFeatureEnabled(userId, 'ai_chatbot');

        res.status(201).send({
            success:true, 
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            },
            token,
            features: {
                chatbot: chatbotEnabled
            }
        })
        

    }catch(err){
        console.log(err)
        res.status(500).send({
            success: false,
            message: 'Error in Registration'
        })
    }
}

//POST LOGIN
const loginController = async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).send({
          success: false,
          message: "Username and password are required",
        });
      }

      const user = await userModel.findOne({username});
      
      if (!user) {
        return res.status(401).send({
          success: false,
          message: "Invalid username or password",
        });
      }

      const match = await comparePassword(password, user.password);

      if (!match) {
        return res.status(401).send({
          success: false,
          message: "Invalid username or password",
        });
      }

      //token
      const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      // Check chatbot feature flag
      const userId = user._id.toString();
      const { enabled: chatbotEnabled } = await isFeatureEnabled(userId, 'ai_chatbot');

      res.status(200).send({
        success: true,
        message: "Login successfully",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email
        },
        token,
        features: {
          chatbot: chatbotEnabled
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in login"
      });
    }
  };
  
module.exports = {registerController, loginController}

