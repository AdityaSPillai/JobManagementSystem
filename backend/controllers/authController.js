import UserModel from "../schema/userSchema.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js"
import JWT from "jsonwebtoken"

export const SignupController = async(req, res) => {
    try {
        const {name, email, password, role, shopname,phone} = req.body;

        if(!name) return res.status(400).send({success: false, message: "Name is Required"});
        if(!email) return res.status(400).send({success: false, message: "Email is Required"});
        if(!password) return res.status(400).send({success: false, message: "Password is Required"});
        if(!role) return res.status(400).send({success: false, message: "Role is Required"});
        if(!phone) return res.status(400).send({success: false, message: "Role is Required"});


        if(role!=="admin" && !shopname) return res.status(400).send({success: false, message: "Shopname is Required"});

        const existingUser = await UserModel.findOne({email: email});
        if(existingUser) {
            return res.status(400).send({ 
                success: false,
                message: "Already existing user",
            });
        }

        const hashedPassword = await hashPassword(password);
        
        const user = new UserModel({ 
            name,
            email,
            password: hashedPassword,
            role,
            shopname,
            phone
        });

        await user.save();  

        res.status(201).send({  
            success: true,
            message: "Successfully added new user to the database",
            user,
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send({  
            success: false,
            message: "Unable to add new User",
            error,
        });
    }
}



export const loginController= async(req,res)=>{
    try {
        const{email,password} = req.body;
        
        if(!email || !password)
        {
            console.error("email and password is Requireed");
        }

        const user= await UserModel.findOne({email:email});
        if(!user)
        {
            console.log("Unable to find user");
            res.status(404).send({
                success:false,
                message:"Unable to find the user with the given email"
            })
            return;
        }
        const isMatch= await comparePassword(password,user.password)

        if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid credentials",
                    });
                }

        const token = JWT.sign(
            { id: user._id, role:user.role }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).send({
            success:true,
            message:"user found succesfully",
            user:{
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            shopname:user.shopname
            },
            token,
        })
     } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
}



export const getSingleUserController= async(req,res)=>{
    try {

        const {id}= req.params;
        if(!id) return res.status(400).send({success: false, message: "userId is Required"});

        const user= await UserModel.findById(id);
        if(!user) return res.status(404).send({succes:false, message:"Unable to find the requested user "});

        res.status(200).send({
            succes:true,
            message:"Succesfully found the user",
            user
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:"Unable to get the requested user",
            error
        })
    }
}