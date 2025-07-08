"use strict";
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail')
module.exports = class NodeMailerService {


    async sendMail(from = 'rapidsofts.biz',to,subject,html){
        console.log("NodeMailerService@sendMail")
        try{

            sgMail.setApiKey(process.env.SENDGRID_API_KEY)

            let msg = {
                to: to, // Change to your recipient
                from: from, // Change to your verified sender
                subject: subject,
                //text: 'and easy to do anywhere, even with Node.js',
                html: html,

            }

            await sgMail.send(msg)
            return true
        }
        catch(error){
            console.error(error);

            if (error.response) {
            console.error(error.response.body)
            }
            return false
        }
    }

    async sendMailNodemailer (from , to, subject, template) {
        try {
       
        let transporter = nodemailer.createTransport ({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: process.env.NODEMAILER_USERNAME,
                pass: process.env.NODEMAILER_PASSWORD,
            },
            });

          let mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: template,
          };
      
          let info = await transporter.sendMail (mailOptions);
      
          console.log ('Email sent: %s', info.messageId);
          return info //info.messageId;
        } catch (error) {
          console.error ('Error sending email:', error);
          throw error;
        }
      };

}
