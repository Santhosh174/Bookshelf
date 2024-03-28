const jwt = require('jsonwebtoken');
const User = require('../db/user');


const requireAuth = (req,res,next) => {
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token,'santy secret',(err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.redirect('/signin')
            }else{
                console.log(decodedToken)
                next()
            }
        })
    }
    else{
        res.redirect('/signin')
    }
}


const checkUser = (req,res,next)=>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,'santy secret',async(err,decodedToken)=>{
            if(err){
                console.log(err.message)
                res.locals.user=null
                next()
            }else{
                console.log(decodedToken)
                let user = await User.findById(decodedToken.id)
                res.locals.user=user
                next()
            }
        })
    }else{
        res.locals.user=null
        next()
    }
}

module.exports = { requireAuth,checkUser }
