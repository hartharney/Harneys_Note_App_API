
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
   host: 'smtp-relay.brevo.com',
   port: 465,
   secure : true,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
})

// const mailOptions = {
//   from: '"EASY EARN" <hart.harney@charisol.io>',
//   to: 'hartharney@gmail.com',
//   subject: 'Test Email',
//   text: 'This is a test email sent using nodemailer and SendinBlue.'
// };

// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error('Error sending email:', error);
//   } else {
//     console.log('Email sent:', info);
//   }
// });

export default transporter;
