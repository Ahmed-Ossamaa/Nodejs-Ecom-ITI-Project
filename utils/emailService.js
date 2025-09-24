const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
    const transporter = createTransporter();

    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/v1/auth/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset Request - Valid for 10 minutes',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>Hi <strong>${user.name}</strong>,</p>
                <p>You requested a password reset for your account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" 
                    style="background-color: #007bff; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset My Password
                    </a>
                </div>
                <p><strong>This link will expire in 10 minutes.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    If the button doesn't work, copy and paste this link:<br>
                    <a href="${resetURL}">${resetURL}</a>
                </p>
            </div>
        `,
        text: `
            Hi ${user.name},
            
            You requested a password reset.
            
            Click this link to reset your password: ${resetURL}
            
            This link expires in 10 minutes.
            
            If you didn't request this, please ignore this email.
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send reset email');
    }
};

// Send welcome email 
const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Welcome to Our E-commerce Platform!',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <h2 style="color: #28a745;">Welcome ${user.name}!</h2>
                <p>Thank you for joining our e-commerce platform.</p>
                <p>You can now:</p>
                <ul>
                    <li>Browse our products</li>
                    <li>Add items to your cart</li>
                    <li>Place orders</li>
                    <li>Track your purchases</li>
                </ul>
                <p>Happy shopping!</p>
            </div>
        `,
        text: `Welcome ${user.name}! Thank you for joining our platform.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent to:', user.email);
    } catch (error) {
        console.error('Welcome email failed:', error);
        //just catch it
    }
};

// Test email connection
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('Email server connection successful');
        return true;
    } catch (error) {
        console.error('Email connection failed:', error.message);
        return false;
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    testEmailConnection
};
