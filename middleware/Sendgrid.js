
require("dotenv").config();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const SendEmail = (emailTo, OTP) => {
    try {
        const msg = {
            to: emailTo, // Change to your recipient
            from: "akshay.mtdev@gmail.com", // Change to your verified sender
            subject: "Hash hive recovery code", // Subject line
            text: "New User", // plain text body
            html: `<div style="text-align:left;max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
<p>
Dear User 
</p>
<p>
I hope this email finds you well. We are reaching out to you regarding a recent action on your Hash Hive account. In order to complete the verification process, we kindly request you to use the code provided below:</p>
<div>
Code: ${OTP} </div>
<div>
Validity: 10 minutes 
</div>
<p>This code is required to ensure the security and authenticity of your account. Please do not share this code with anyone, as it is for your personal use only.</p>
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
</div>` ,
        }

        return sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
                return true
            })
            .catch((error) => {
                console.error(error.response.body, "<<<ERROR at sending email")
                return false
            })
    } catch (error) {
        console.log(error.body)
    }
}

// SendEmail("akshay@ment.tech", generateOTP())
module.exports.SendGrid = {
    SendEmail
}

