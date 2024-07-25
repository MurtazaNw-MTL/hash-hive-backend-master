"use strict";
const nodemailer = require("nodemailer");
require("dotenv").config();
const email = process.env.SEND_EMAIL_FROM
const password = process.env.EMAIL_GENERATED_PASSWORD

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: email,
    pass: password
  }
});

const sendEmail = async (email, otp) => {
  try {
    let msg = await transporter.sendMail({
      from: `"Hash Hive"`, // sender address
      to: email, // list of receivers
      // to: "akshay@ment.tech", // list of receivers
      subject: "Hash hive recovery code", // Subject line
      text: "New User", // plain text body
      html: `<div style="text-align:left;max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
<p>
Dear User 
</p>
<p>
I hope this email finds you well. We are reaching out to you regarding a recent action on your Hash Hive account. In order to complete the verification process, we kindly request you to use the code provided below:</p>
<div>
Code: ${otp} </div>
<div>
Validity: 10 minutes 
</div>
<p>This Code is required to ensure the security and authenticity of your account. Please do not share this code with anyone, as it is for your personal use only.</p>
<p>If you did not initiate this action or require any assistance, please do not hesitate to contact our support team at support@hashhive.com. We take your account security seriously and are here to help you with any concerns you may have.</p>
<p>Thank you for being a valued member of Hash Hive.</p>
</br>
Best regards,
</br>
</br>
<div>Hash Hive Support Team
</div>
<div>
support@hashhive.com
</div>

</div>` // html body
    });

    console.log("Message sent: %s", msg);
    return msg;
  } catch (error) {
    console.log(error);
  }
};

module.exports = sendEmail;
