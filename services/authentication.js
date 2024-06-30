import jwt from 'jsonwebtoken'

const secret = '#secureAuthnatureTree$@'; 

function generateToken(user){

    const payload={
        id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        verified:user.verified,
    }

    const token=jwt.sign(payload,secret);

    return token;
}

function verifyToken(token){

    const payload = jwt.verify(token,secret);
    return payload;
}

export {generateToken,verifyToken}