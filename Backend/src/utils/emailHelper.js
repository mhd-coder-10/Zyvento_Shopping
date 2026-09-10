// Sends emails using Nodemailer
// Supports OTP emails, welcome emails, password reset, order confirmation
// Used throughout the application for email notifications

const nodemailer = require('nodemailer');
const environment = require('../config/environment');
const logger = require('./logger');

class EmailHelper {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    // ============ INITIALIZE TRANSPORTER ============
    initializeTransporter() {
        if (environment.EMAIL_HOST && environment.EMAIL_USER && environment.EMAIL_PASS) {
            this.transporter = nodemailer.createTransport({
                host: environment.EMAIL_HOST,
                port: environment.EMAIL_PORT,
                secure: environment.EMAIL_PORT === 465,
                auth: {
                    user: environment.EMAIL_USER,
                    pass: environment.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });

            // Verify connection
            this.transporter.verify((error, success) => {
                if (error) {
                    // logger.error('\nEmail transporter verification failed:', error, "\n");
                } else {
                   // logger.info('\nEmail transporter ready to send emails\n');
                }
            });
        } else {
            logger.warn('\nEmail configuration missing. Emails will not be sent. \n');
        }
    }

    // ============ SEND EMAIL ============
    async sendEmail(options) {
        try {
            if (!this.transporter) {
                logger.error('Email transporter not initialized');
                return { success: false, error: 'Email service not configured' };
            }

            const mailOptions = {
                from: options.from || environment.EMAIL_FROM,
                to: options.to,
                subject: options.subject,
                text: options.text || null,
                html: options.html || null,
                attachments: options.attachments || null,
                bcc: options.bcc || null,
                cc: options.cc || null,
            };

            // At least one of text or html should be present
            if (!mailOptions.text && !mailOptions.html) {
                throw new Error('Either text or html content is required');
            }

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${options.to} - ${info.messageId}`);
            return { success: true, messageId: info.messageId, response: info.response };
        } catch (error) {
            logger.error(`Failed to send email to ${options.to}:`, error);
            return { success: false, error: error.message };
        }
    }

    // ============ SEND OTP EMAIL ============
    async sendOTPEmail(email, otp, purpose = 'verification') {
        const subject = `Your OTP for ${purpose}`;
        const text = `Your OTP for ${purpose} is: ${otp}\nThis OTP is valid for ${environment.OTP_EXPIRY_MINUTES} minutes.\n\nDo not share this OTP with anyone.`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #333;">OTP for ${purpose}</h2>
                <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) is:</p>
                <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #777;">This OTP is valid for <strong>${environment.OTP_EXPIRY_MINUTES} minutes</strong>.</p>
                <p style="font-size: 14px; color: #777;">Do not share this OTP with anyone.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        `;

        return this.sendEmail({ to: email, subject, text, html });
    }

    // ============ SEND WELCOME EMAIL ============
    async sendWelcomeEmail(email, name) {
        const subject = 'Welcome to ZYVENTO SHOPPING!';
        const text = `Hi ${name},\n\nWelcome to our ZYVENTO SHOPPING E-commerce marketplace! We're excited to have you on board.\n\nExplore our wide range of products and start shopping today!\n\nRegards,\nMarketplace Team`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #333;">Welcome to Marketplace! 🎉</h2>
                <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #555;">Welcome to our marketplace! We're excited to have you on board.</p>
                <p style="font-size: 16px; color: #555;">Explore our wide range of products and start shopping today!</p>
                <div style="background: #4CAF50; padding: 12px 30px; text-align: center; border-radius: 5px; margin: 20px 0; display: inline-block;">
                    <a href="${environment.CLIENT_URL}" style="color: white; text-decoration: none; font-size: 16px; font-weight: bold;">Start Shopping</a>
                </div>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        `;

        return this.sendEmail({ to: email, subject, text, html });
    }

    // ============ SEND PASSWORD CHANGE CONFIRMATION ============
    async sendPasswordChangeConfirmationEmail(email, name) {
        const subject = 'Password Changed Successfully';
        const text = `Hi ${name},\n\nYour password has been changed successfully.\n\nIf you didn't make this change, please contact our support immediately.\n\nRegards,\nMarketplace Team`;
        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4CAF50;">Password Changed Successfully 🔒</h2>
            <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #555;">Your password has been changed successfully.</p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="font-size: 14px; color: #856404; margin: 0;">
                    ⚠️ If you didn't make this change, please contact our support immediately.
                </p>
            </div>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
        </div>
    `;

        return this.sendEmail({ to: email, subject, text, html });
    }

    // ============ SEND RESET PASSWORD EMAIL ============
    async sendResetPasswordEmail(email, name, resetToken) {
        const resetUrl = `${environment.CLIENT_URL}/reset-password?token=${resetToken}`;
        const subject = 'Reset Your Password';
        const text = `Hi ${name},\n\nWe received a request to reset your password.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nRegards,\nMarketplace Team`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #555;">We received a request to reset your password.</p>
                <div style="background: #2196F3; padding: 12px 30px; text-align: center; border-radius: 5px; margin: 20px 0; display: inline-block;">
                    <a href="${resetUrl}" style="color: white; text-decoration: none; font-size: 16px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #777;">This link is valid for <strong>1 hour</strong>.</p>
                <p style="font-size: 14px; color: #777;">If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        `;

        return this.sendEmail({ to: email, subject, text, html });
    }

    // ============ SEND SELLER APPROVAL EMAIL ============
    async sendSellerApprovalEmail(email, businessName, status, reason = '') {
        const subject = `Seller Account ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const isApproved = status === 'approved';
        const text = `Dear ${businessName},\n\nYour seller account has been ${status}.\n${reason ? `\nReason: ${reason}` : ''}\n\nRegards,\nMarketplace Team`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: ${isApproved ? '#4CAF50' : '#f44336'};">Seller Account ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                <p style="font-size: 16px; color: #555;">Dear <strong>${businessName}</strong>,</p>
                <p style="font-size: 16px; color: #555;">Your seller account has been <strong>${status}</strong>.</p>
                ${reason ? `<p style="font-size: 16px; color: #555;"><strong>Reason:</strong> ${reason}</p>` : ''}
                ${isApproved ? '<p style="font-size: 16px; color: #555;">You can now start listing your products.</p>' : ''}
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        `;

        return this.sendEmail({ to: email, subject, text, html });
    }

    // ============ SEND ORDER CONFIRMATION EMAIL ============
    async sendOrderConfirmationEmail(email, name, orderNumber, orderItems, totalAmount) {
        const subject = `Order Confirmation - #${orderNumber}`;
        let itemsHtml = '';
        orderItems.forEach(item => {
            itemsHtml += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${item.productName}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.price}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.total}</td>
                </tr>
            `;
        });

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #333;">Order Confirmation ✅</h2>
                <p style="font-size: 16px; color: #555;">Hi <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #555;">Your order has been confirmed!</p>
                <p style="font-size: 16px; color: #555;"><strong>Order Number:</strong> ${orderNumber}</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; color: #4CAF50;">₹${totalAmount}</td>
                        </tr>
                    </tfoot>
                </table>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
            </div>
        `;

        const text = `Order Confirmation - #${orderNumber}\n\nHi ${name},\n\nYour order has been confirmed!\nOrder Number: ${orderNumber}\nTotal Amount: ₹${totalAmount}\n\nThank you for shopping with us!`;

        return this.sendEmail({ to: email, subject, text, html });
    }


}


module.exports = new EmailHelper();