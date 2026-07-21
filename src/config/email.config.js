require('dotenv').config();

module.exports = {
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_SENDER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    },
    // Email del dueño (donde recibirás copia de todas las reservas)
    ownerEmail: process.env.CONTACT_EMAIL_RECEIVER || 'puntacanagorentacardr@gmail.com',
    // Email desde el que se envían los correos
    senderEmail: process.env.EMAIL_SENDER || 'puntacanagorentacardr@gmail.com',
    // Nombre de la empresa
    companyName: 'Punta Cana Go Rent Car',
    companyWebsite: 'https://puntacanagorentacar.com',
    companyPhone: '+1 809-000-0000',
    // Logo (lo cambias después)
    logoUrl: 'https://res.cloudinary.com/dfwpolska/image/upload/v1784185191/logo-rentcar.png'
};