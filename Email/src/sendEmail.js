import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD,
    },
});

async function sendEmail(JobData) {
    const { userName, email, type, token } = JobData;
    const websiteName = "Dummy Bank";
    const RegisterEmail = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>Hi ${userName}, Welcome to ${websiteName}!</h3>
        <p>Thank you for registering on our platform. To complete your registration, please verify your email address by using the Link below:</p>
        <a href="${token}" target="_blank"><button>Verify</button></a>
        <p>OR copy, paste the following code in the browser Url bar.</p>
        <p>${token}</p>
        <p>If you did not register on our website, please ignore this email.</p>
        <br />
        <p>Best Regards,</p>
        <p>${websiteName} Team</p>
      </div>
    `;
    const LoginEmail = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>Hello ${userName},</h3>
        <p>This is a notification that your account was just accessed OR someone try to login.</p>
        <p>If this was you, please use the following Link to complete your login process:</p>
        <a href="${token}" target="_blank"><button>Verify</button></a>
        <p>OR copy, paste the following code in the browser Url bar.</p>
        <p>${token}</p>
        <p>If you did not log in at this time, please secure your account immediately by changing your password and contacting our support team.</p>
        <br />
        <p>Best Regards,</p>
        <p>${websiteName} Team</p>
      </div>
    `;
    const EmailVerified = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h3>Hello ${userName},</h3>
          <p>Thank you for registering on our platform. Your email address verified successfully.</p>
          <p>Login to your account and start sending and receiving payment efficiently.</p>
          <br />
          <p>Best Regards,</p>
          <p>${websiteName} Team</p>
      </div>
      `;
    const MpinUpdated = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h3>Hello ${userName},</h3>
          <p>Your MPIN updated successfully.</p>
          <p>If you did not updated your MPIN, please secure your account immediately by changing your password and contacting our support team.</p>
          <br />
          <p>Best Regards,</p>
          <p>${websiteName} Team</p>
      </div>
      `;
    const ForgotPassword = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3>Hello ${userName},</h3>
        <p>We received a request to reset your password for your account associated with this email address.</p>
        <p>If you made this request, please use the following verification code to reset your password:</p>
        <h3">Verification Code: ${token}</h3>
        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <br />
        <p>Best Regards,</p>
        <p>${websiteName} Team</p>
      </div>
    `;
    const ResetPassword = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
       <h3>Hello ${userName},</h3>
        <p>Your password has been successfully changed for your account associated with this email address.</p>
        <p>If you did not perform this action, please secure your account immediately by changing your password again and contacting our support team.</p>
        <p>For your security, we recommend that you:</p>
        <ul>
          <li>Keep your password confidential and do not share it with anyone.</li>
          <li>Use a strong and unique password for each of your online accounts.</li>
          <li>Regularly update your passwords to enhance your account security.</li>
        </ul>
        <br />
        <p>Best Regards,</p>
        <p>${websiteName} Team</p>
      </div>
    `;
    const TransactionVerify = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h3>Hello ${userName},</h3>
      <p>We noticed a transaction attempt from your account.</p>
      <p>If this was you, please use the following Link to continue your transaction:</p>

      <a href="${token}" target="_blank"><button>Verify</button></a>
      <p>OR copy, paste the following code in the browser Url bar.</p>
      <p>${token}</p>
      <p>If you did not attempt to transfer that amount, don't worry we will take care of it.</p>
      <br />
      <h4>Recommendation:</h4>
      <p>Please secure your account immediately by changing your password and contacting our support team.</p>
      <br />
      <p>Best Regards,</p>
      <p>${websiteName} Team</p>
      </div>
    `;
    const CardVerification = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h3>Hello ${userName},</h3>
      <p>We noticed a Card Creation attempt from your account.</p>
      <p>If this was you, please use the following Link to continue your Card Creation:</p>

      <a href="${token}" target="_blank"><button>Verify</button></a>
      <p>OR copy, paste the following code in the browser Url bar.</p>
      <p>${token}</p>
      <br />
      <h4>Recommendation:</h4>
      <p>Please secure your account immediately by changing your password and contacting our support team.</p>
      <br />
      <p>Best Regards,</p>
      <p>${websiteName} Team</p>
      </div>
    `;

    let emailBody;
    let subject;

    if (type === "REGISTER") {
        subject = "Verify your Email";
        emailBody = RegisterEmail;
    }
    if (type === "LOGIN") {
        subject = "Verify your Login";
        emailBody = LoginEmail;
    }
    if (type === "EMAIL_VERIFIED") {
        subject = "Email Verified";
        emailBody = EmailVerified;
    }
    if (type === "MPIN_UPDATED") {
        subject = "MPIN Updated";
        emailBody = MpinUpdated;
    }
    if (type === "FORGOT_PASSWORD") {
        subject = "Reset Password";
        emailBody = ForgotPassword;
    }
    if (type === "RESET_PASSWORD") {
        subject = "Password Changed";
        emailBody = ResetPassword;
    }
    if (type === "TRANSACTION_VERIFY") {
        subject = "Verify Transaction";
        emailBody = TransactionVerify;
    }
    if (type === "TRANSACTION_SUCCESSFUL") {
        subject = "Transaction Successful";
        emailBody = TransactionVerify;
    }
    if (type === "CARD_VERIFY") {
        subject = "Verify Your Card Creation";
        emailBody = CardVerification;
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.GMAIL_ADDRESS,
            to: email,
            subject: `${subject} - ${websiteName}`,
            html: emailBody,
        });
        console.log("Email :: Message sent: %s", info.messageId);
    } catch (error) {
        console.log(`Error while sending Email to ${email} ::`, error);
    }
}

export { sendEmail };
