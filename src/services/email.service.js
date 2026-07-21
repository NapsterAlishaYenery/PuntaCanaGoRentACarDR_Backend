const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');

const transporter = nodemailer.createTransport(emailConfig.email);

/**
 * Enviar email genérico
 * @param {Object} options - { to, subject, html, bcc }
 */
const enviarEmail = async (options) => {
    const { to, subject, html, bcc } = options;

    const mailOptions = {
        from: `"${emailConfig.companyName}" <${emailConfig.senderEmail}>`,
        to: to,
        subject: subject,
        html: html,
        bcc: bcc || undefined
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email error to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { enviarEmail };