import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport(({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.PASSWORD,
    }
}));

const mailSender = async (uname,email,message) => {

    try {

        const mailConfig = {
            from: process.env.EMAIL_USERNAME,

            to: process.env.EMAIL_USERNAME,

            subject: `User Contact Us Request from ${email}`,

            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
             <style>
                    p{
                        font-size: 16px;
                        font-family:sans-serif;
                    }
                </style>
            <meta content="text/html"; charset="UTF-8" http-equiv="Content-Type" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
            </head>
            <body>
                <p>From: ${uname} (${email})</p>
                <p>Message: ${message}</p>
            </body>
        </html>`
        };
        
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailConfig, function (error, info) {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                else{console.log('Email Sent Successfully');
                resolve(info);}
            });
        });
    }
    catch (err) {
        console.log(err);
    }
}


export default mailSender;
