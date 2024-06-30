import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import footprint from './models/footprint.js';
import user from './models/user.js';
import goal from './models/goal.js';
import event from './models/event.js';
import post from './models/post.js';

import jwt from 'jsonwebtoken';

import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { generateToken, verifyToken } from './services/authentication.js'

import mailSender from './services/ContactUsMailSender.js';
import mailVerifier from './services/mailSender.js';

import authMiddleWare from './middlewares/authMiddleware.js';

dotenv.config();
const PORT = 8009;
const app = express();

// mongoose.connect(process.env.DATABASE) //'mongodb://127.0.0.1:27017/EcoEclipse'
mongoose.connect(process.env.DATABASE)
    .then(() => console.log('connection to DB successfull'))
    .catch((err) => console.log('connection to DB Fails', err));

app.use(cors({
    origin: process.env.CORS_FRONTEND,
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.post('/user/signup', [

    body('username').exists().trim().matches(/^[a-zA-Z]{3}[a-zA-Z0-9_]*$/).withMessage('username must be in proper format').escape(),

    body('email').exists().trim().isEmail().withMessage('Email must be valid').escape(),

    body('password').exists().trim().isLength({ min: 6 }).withMessage('Password must be min 6 characters').escape()
], async (req, res) => {

    const errs = validationResult(req);

    if (!errs.isEmpty()) {
        return res.json({ errors: errs.array() });
    }

    const name = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const findUser = await user.findOne({
        email: email,
    });

    if (findUser) {
        return res.json({ msg: 'user already exisist' });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const verifyPayload = {
        name: name,
        email: email,
    }

    await mailVerifier(verifyPayload);


    try {
        const usr = await user.create({
            name: name,
            email: email,
            password: hashedPassword,
        });

        if (!usr) return res.status(501).json({ msg: 'fail' });
        else return res.status(201).json({ msg: 'success' });
    }
    catch (err) {
        console.log(err);
    }
    return res.status(501).json({ msg: 'fail' })
});

app.post('/user/login', [

    body('email').exists().trim().isEmail().withMessage('Email must be valid').escape(),

    body('password').exists().trim().isLength({ min: 6 }).withMessage('Password must be min 6 characters').escape(),

], async (req, res) => {

    const errs = validationResult(req);

    if (!errs.isEmpty()) {
        return res.status(400).json({ errors: errs.array() });
    }

    const findUser = await user.findOne({
        email: req.body.email,
    });

    if (!findUser) return res.status(401).json({ msg: 'fail' });

    if (findUser.verified === false) {
        return res.json({ msg: 'Not verified' });
    }
    const password = req.body.password;

    const isValid = await bcrypt.compare(password, findUser.password);

    if (!isValid) return res.status(401).json({ msg: 'fail' });

    else {
        const token = generateToken(findUser);
        return res.status(200).cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None' }).json({ msg: 'success', token: token });
    }

});

app.get('/:email/verify/:token', async (req, res) => {
    const { email, token } = req.params;

    try {
        const data = await jwt.verify(token, '$$#key%maiLSeNder!@');

        if (data.payload.email === email) {
            await user.updateOne({ email }, { $set: { verified: true } });
            return res.json({ msg: 'success' });
        }
        return res.json({ msg: 'fail' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fail' });
    }
});

app.post('/sendEmail',body('email').exists().trim().isEmail().withMessage('Email must be valid').escape(),async (req, res) => {

    const email=req.body.email;

    const errs = validationResult(req);

    // console.log(errs);
    
    if(!errs.isEmpty()){
        return res.json({msg:'Invalid email'});
    }

    try{
        const find = await user.findOne({email});
        if(!find){
            return res.json({msg:'user not registered'});
        }

        if(find.verified){
            return res.json({msg:'user already verified'});   
        }
        
    }
    catch(err){
        console.log(err);
    }

    const verifyPayload = {
        email: email,
        name:'temp',
    }
    console.log(verifyPayload);

    try {
        const status = await mailVerifier(verifyPayload);
        console.log(status);

        if (status) return res.json({ msg: 'success' });
        else return res.json({ msg: 'fail' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fail' });
    }
    // return res.json({msg:'ok'});
});

app.get('/user/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true, 
        sameSite: 'None', 
    });
    console.log(req.cookies['token']);
    return res.json({ msg: 'success' });
});

app.get('/community/events', async (req, res) => {
    try {
        const cards = await event.find({}).sort({ date: 1 });

        res.json({ msg: 'success', cards });
    }
    catch (err) {
        console.log(err);
        res.json({ msg: 'fail' });
    }
});

app.get('/community/posts', async (req, res) => {
    try {
        const cards = await post.find({}).sort({ date: 1 });
        const by = [];

        if (cards) {
            for (const element of cards) {
                const u = await user.findById(element.userId);
                if (u) {
                    by.push({ email: u.email });
                }
            }
        }

        const token = req.cookies['token'];
        if (token) {
            const usr = verifyToken(token);
            return res.json({ msg: 'success', cards, by, visitor: usr.email });
        }

        return res.json({ msg: 'success', cards, by, visitor: '' });
    }
    catch (err) {
        console.log(err);
        res.json({ msg: 'fail' });
    }
})


app.use(authMiddleWare);

app.get('/', (req, res) => {
    console.log(req.user);
    res.send({ msg: 'hi' });
});

app.get('/getUserRole', (req, res) => {
    return res.json({ role: req.role });
});

app.get('/footprint/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const fp = await footprint.findOne({ _id: id });

        if (fp) return res.json({ fp, msg: 'success' });
        else return res.json({ msg: 'fail' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fail' });
    }
})

app.get('/footprint', async (req, res) => {
    const userId = req.user;

    try {
        const fp = await footprint.find({ userId: userId }).sort({ createdAt: -1 });

        if (fp) return res.json({ fp, msg: 'success', userName: req.userName, email: req.email });
        else return res.json({ msg: 'fail' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fail' });
    }

})

app.post('/footprint', async (req, res) => {
    const { noOfGas, kwh, vehicles, srtFlights, medFlights, longFlights, train, noOfBags } = req.body;

    const userId = req.user;

    const fp = await footprint.create({
        userId,
        noOfGas,
        kwh,
        vehicles,
        srtFlights,
        medFlights,
        longFlights,
        train,
        noOfBags
    });

    if (!fp) res.json({ msg: 'fail' });

    return res.status(200).json({ msg: 'success', id: fp._id });
});

app.post('/goal/add', async (req, res) => {
    const uid = req.user;
    const task = req.body.goal;

    try {
        const data = await goal.create({
            userId: uid,
            task: task,
            completed: false,
        });

        if (!data) return res.json({ msg: 'fails' });

        return res.json({ msg: 'success', goal: data });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fails' });
    }
});

app.get('/goal', async (req, res) => {

    const userId = req.user;

    try {
        const goals = await goal.find({ userId });

        if (!goals) return res.json({ msg: 'fails' });

        return res.json({ msg: 'success', goals: goals });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fails' });
    }
});

app.post('/goal/complete', async (req, res) => {

    const goalId = req.body.goalId;

    try {
        const goals = await goal.findByIdAndUpdate(goalId, { completed: true });

        if (!goals) return res.json({ msg: 'fails' });

        return res.json({ msg: 'success' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fails' });
    }
});

app.post('/goal/delete', async (req, res) => {

    const goalId = req.body.goalId;

    try {
        const goals = await goal.findByIdAndDelete(goalId);

        if (!goals) return res.json({ msg: 'fails' });

        return res.json({ msg: 'success' });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: 'fails' });
    }
});

app.post('/contactus', [

    body('email').exists().trim().isEmail().withMessage('Email must be valid').escape(),
    body('uname').exists().trim().escape(),
    body('message').exists().trim().escape(),

], async (req, res) => {
    const { uname, email, message } = req.body;

    await mailSender(uname, email, message)
        .then(() => res.json({ msg: 'success' }))
        .catch(() => res.json({ msg: 'fail' }))
    return res;
})

app.post('/community/addEvent', async (req, res) => {
    const { title, date, day, description } = req.body;

    try {
        const status = await event.create({
            title, date, day, description,
        })

        if (!status) res.json({ msg: "fail" });
        return res.json({ msg: "success", card: status });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: "fail" });
    }
});

app.delete('/community/deleteEvent/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const status = await event.findByIdAndDelete(id);

        if (!status) res.json({ msg: "fail" });
        return res.json({ msg: "success" });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: "fail" });
    }
});

app.post('/community/addPost', async (req, res) => {
    const { title, description } = req.body.postForm;
    const uid = req.user;
    const email = req.email;

    try {
        const status = await post.create({
            title, description, userId: uid,
        })

        if (!status) res.json({ msg: "fail" });
        return res.json({ msg: "success", card: status, by: email });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: "fail" });
    }
});

app.delete('/community/deletePost/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const status = await post.findByIdAndDelete(id);

        if (!status) return res.json({ msg: "fail" });

        return res.json({ msg: "success" });
    }
    catch (err) {
        console.log(err);
        return res.json({ msg: "fail" });
    }
});


app.listen(PORT || process.env.PORT, () => { console.log('server started') });