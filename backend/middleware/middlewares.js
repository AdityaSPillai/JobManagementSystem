

import JWT from "jsonwebtoken";

// Main authentication middleware that checks both cookies and headers
export const isOwner = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            const decoded = JWT.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.id || !decoded.role==="owner") {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid authentication token'
                });
            }
    
            // Attach user to request
            // req.user = decoded;
             req.body.userId = decoded.id;
             console.log(req.body.userId)

            // req.body.role=decoded.role;
            next();
        }
        else
        {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};

export const isAdmin = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.id || decoded.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        // Better: Use req.user instead of req.body
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        
        console.log("Admin auth completed");
        next();
        
    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}


export const isAllowed= async(req,res,next)=>{
   try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.id || decoded.role !== "desk_employee") {
            return res.status(403).json({
                success: false,
                message: 'onlu desk_employee acces'
            });
        }

        // Better: Use req.user instead of req.body
        req.user = {
            id: decoded.id,
            role: decoded.role
        };
        
        console.log("Admin auth completed");
        next();
        
    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}



import fetch from "node-fetch";

export async function getExchangeRate(base, target) {
  const url = `https://api.exchangerate.host/latest?base=${base}&symbols=${target}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.rates[target];
}
