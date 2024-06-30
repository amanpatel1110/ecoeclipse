import { verifyToken } from "../services/authentication.js";

async function authMiddleWare(req, res, next) {
    const token = req.cookies['token'];

    if (!token) {
        return res.json({ msg: 'fail', from: 'auth middleware' });
    }
    try {
        const user = verifyToken(token);
        req.user = user.id;
        req.userName = user.name;
        req.email = user.email;
        req.role = user.role;
        next();
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fail', from: 'auth middleware' });
    }

}

export default authMiddleWare