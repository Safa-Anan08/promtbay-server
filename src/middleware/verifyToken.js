const jwt =require("jsonwebtoken");

const { getDB } =require("../config/db");

 const verifyToken =async (req,res,next)=>{
         try{

  const token =req.cookies.token;
      if(!token){
     return res.status(401).json({
       message:"Unauthorized",});
           }

       const decoded =jwt.verify(
       token,
   process.env.JWT_SECRET
     );

  const db =getDB();
 const user =await db.collection("users").findOne({
           email:
           decoded.email,});
   if(!user)
    {return res.status(404).json({
       message:"User not found",
 });
    }
       req.user =user;
   next();
   }

    catch(error){
   return res.status(401).json({
     message:"Invalid token",
   });}
 };

module.exports = verifyToken;