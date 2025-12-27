import JWT from "jsonwebtoken";

export const isOwner = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id || decoded.role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Owner access required"
            });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({
            success: false,
            message: "Authentication failed",
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

export const isQA = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login into QA/QC.'
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id || decoded.role !== "qa_qc") {
            return res.status(403).json({
                success: false,
                message: 'QA/QC access required'
            });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        console.log("QA/QC auth completed");
        next();

    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

export const isManager = (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);


        const allowedRoles = ["owner", "supervisor"];
        if (!decoded || !decoded.id || !allowedRoles.includes(decoded.role)) {
            return res.status(403).json({
                success: false,
                message: 'Manager access required'
            });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        console.log("Manager auth completed");
        next();

    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}


export const isAllowed = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];


        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_SECRET);

        const allowedRoles = ["desk_employee", "admin", "owner", "supervisor", "qa_qc"];
        if (!decoded || !decoded.id || !allowedRoles.includes(decoded.role)) {
            return res.status(403).json({
                success: false,
                message: 'Only Desk_Employ, Admin, Owner and supervisot can access'
            });
        }

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        console.log("Allowed auth completed");
        next();

    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}