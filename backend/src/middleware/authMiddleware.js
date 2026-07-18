const jwt=require("jsonwebtoken");

const protect=async(req,res,next)=>{

    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){

        token=req.headers.authorization.split(" ")[1];

        try{

            const decoded=jwt.verify(token,process.env.JWT_SECRET);

            req.user=decoded;

            next();

        }catch(err){

            return res.status(401).json({
                message:"Invalid Token"
            });

        }

    }

    else{

        return res.status(401).json({
            message:"Not Authorized"
        });

    }

}

module.exports=protect;