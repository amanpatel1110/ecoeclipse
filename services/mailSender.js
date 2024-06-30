import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.PASSWORD,
    }
});

const mailVerifier = async (payload) => {

    try {
        const token = jwt.sign({
            payload,
        }, '$$#key%maiLSeNder!@',{expiresIn:'10m'});


        const mailConfig = {
            from: process.env.EMAIL_USERNAME,

            to: payload.email,

            subject: 'Please Verify Your Email Address',

            html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                         <style>
                                p{
                                    font-size: 20px;
                                    font-family:sans-serif;
                                }
                            </style>
                        <meta content="text/html"; charset="UTF-8" http-equiv="Content-Type" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Document</title>
                        </head>
                        <body>
                            <p>Hello, You have try to create
                            account on our website EcoEclipse, To verify your Email-id 
                            cilck on Button Below</p>
                            <button style="width:100px;border: none;height: 40px;font-size: 20px;border-radius: 15px;background-color: green;"><a style="font-weight: bolder;text-decoration:none;color: white;" href=http://localhost:5173/verify?email=${payload.email}&token=${token}>Click</a></button>
                            <p>If you did not sign up for an account with us, please ignore this email.</p>  
                            <p>Thanks.</p>
                        </body>
                    </html>`
        };
        
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailConfig, function (error, info) {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                console.log('Email Sent Successfully');
                resolve(info);
            });
        });
    }
    catch (err) {
        console.log(err);
    }
}


// mailVerifier() 

export default mailVerifier;
