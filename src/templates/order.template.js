const emailConfig = require('../config/email.config');

// Helpers
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
};

const getFullName = (customer) => {
    return `${customer.firstName} ${customer.lastName}`.trim();
};

/**
 * Construir template de la orden
 * @param {Object} order - La orden completa
 * @param {boolean} isAdmin - true para dueño, false para cliente
 */
const buildOrderTemplate = (order, isAdmin = false) => {
    const customer = order.customer;
    const car = order.car;
    const financials = order.financials;

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Add-ons rows
    const addOnsRows = order.addOns.map(addon => `
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">
                ${addon.name} <span style="color: #94a3b8; font-size: 12px;">(x${addon.quantity})</span>
            </td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">
                ${formatCurrency(addon.totalAddOn)}
            </td>
        </tr>
    `).join('');

    const addOnsSection = order.addOns.length > 0 ? `
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
            <thead>
                <tr style="background: #f0f9ff;">
                    <th style="padding: 10px 12px; text-align: left; font-weight: 600; color: #0f172a;">Extra / Service</th>
                    <th style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${addOnsRows}
            </tbody>
        </table>
    ` : `
        <p style="color: #94a3b8; font-style: italic; margin: 15px 0;">No extras selected</p>
    `;

    // Título según tipo
    const title = isAdmin 
        ? `🔔 NEW RESERVATION #${order.orderNumber}`
        : `✅ Reservation Confirmed #${order.orderNumber}`;

    const subtitle = isAdmin
        ? `A new reservation has been made by ${getFullName(customer)}`
        : `Thank you for choosing ${emailConfig.companyName}!`;

    // Botón de WhatsApp SOLO para el cliente
    const whatsappButton = !isAdmin ? `
        <div style="text-align: center; margin-top: 20px;">
            <a href="https://wa.me/${emailConfig.companyPhone.replace(/[^0-9]/g, '')}" 
               style="display: inline-block; background: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 14px;">
                💬 Contact us on WhatsApp
            </a>
        </div>
    ` : '';

    // Botón para contactar al cliente SOLO para el admin
    const adminButton = isAdmin ? `
        <div style="text-align: center; margin-top: 20px;">
            <a href="mailto:${customer.email}" 
               style="display: inline-block; background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 40px; font-weight: 600; font-size: 14px;">
                ✉️ Contact Customer
            </a>
        </div>
    ` : '';

    // Mensaje para el cliente
    const customerMessage = !isAdmin ? `
        <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
            <p style="color: #065f46; font-size: 14px; margin: 0;">
                📌 <strong>Important:</strong> Please arrive 15 minutes before your pickup time. 
                Don't forget to bring your driver's license and passport.
            </p>
        </div>
    ` : '';

    // Datos completos del cliente SOLO para el admin
    const customerSection = isAdmin ? `
        <div class="section-title">👤 Customer</div>
        <div class="customer-info">
            <div class="name">${getFullName(customer)}</div>
            <div class="detail">📧 ${customer.email}</div>
            <div class="detail">📱 ${customer.phone}</div>
            ${customer.license ? `<div class="detail">🪪 License: ${customer.license}</div>` : ''}
            ${customer.flightNumber ? `<div class="detail">✈️ Flight: ${customer.flightNumber}</div>` : ''}
            ${customer.address ? `<div class="detail">📍 ${customer.address}, ${customer.country}</div>` : ''}
        </div>
    ` : '';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailConfig.companyName} - ${order.orderNumber}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            background: #f0f9ff;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 640px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px -12px rgba(0,0,0,0.15);
        }
        
        /* === HEADER CON LOGO === */
        .header {
            background: #ffffff;
            padding: 25px 25px 20px 25px;
            text-align: center;
            border-bottom: 4px solid #f59e0b;
        }
        .header .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 12px;
        }
        .header .logo-container img {
            max-width: 280px;
            height: auto;
            display: block;
        }
        .header .title-container {
            border-top: 2px solid #e5e7eb;
            padding-top: 14px;
            margin-top: 6px;
        }
        .header h1 {
            color: #064e3b;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
            margin: 0;
        }
        .header .order-number {
            color: #1a56db;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
            margin-top: 4px;
        }
        .header .date-badge {
            display: inline-block;
            background: #f0f9ff;
            color: #1a56db;
            font-size: 12px;
            padding: 4px 16px;
            border-radius: 20px;
            margin-top: 6px;
            border: 1px solid #bfdbfe;
        }
        
        .content { padding: 30px 25px; }
        .greeting {
            text-align: center;
            margin-bottom: 25px;
        }
        .greeting h2 { color: #064e3b; font-size: 22px; font-weight: 700; }
        .greeting p { color: #4b5563; font-size: 14px; margin-top: 4px; }
        
        .section-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1a56db;
            margin: 25px 0 12px 0;
            border-bottom: 2px solid #f0f9ff;
            padding-bottom: 8px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 10px 0 15px 0;
        }
        .info-card {
            background: #f0f9ff;
            border-radius: 12px;
            padding: 14px 16px;
            border: 1px solid #bfdbfe;
        }
        .info-card .label {
            font-size: 10px;
            text-transform: uppercase;
            color: #3b82f6;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        .info-card .value {
            font-size: 14px;
            font-weight: 600;
            color: #064e3b;
            margin-top: 2px;
        }
        .info-card .sub-value {
            font-size: 12px;
            color: #4b5563;
        }
        
        .vehicle-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%);
            border-radius: 12px;
            padding: 16px 20px;
            margin: 10px 0;
            border-left: 4px solid #f59e0b;
        }
        .vehicle-card .brand-model {
            font-size: 18px;
            font-weight: 700;
            color: #064e3b;
        }
        .vehicle-card .price {
            font-size: 14px;
            color: #4b5563;
        }
        .vehicle-card .price strong {
            color: #f59e0b;
        }
        
        .price-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 14px;
        }
        .price-table tr { border-bottom: 1px solid #f0f9ff; }
        .price-table td { padding: 10px 0; }
        .price-table .label { color: #4b5563; }
        .price-table .amount { text-align: right; font-weight: 500; color: #064e3b; }
        .price-table .total-row { border-top: 2px solid #064e3b; }
        .price-table .total-row td {
            padding-top: 14px;
            font-weight: 700;
            font-size: 16px;
        }
        .price-table .total-row .amount { color: #f59e0b; font-size: 18px; }
        
        .customer-info {
            background: #f0f9ff;
            border-radius: 12px;
            padding: 16px 20px;
            margin: 10px 0;
            border: 1px solid #bfdbfe;
        }
        .customer-info .name {
            font-size: 16px;
            font-weight: 700;
            color: #064e3b;
        }
        .customer-info .detail {
            font-size: 13px;
            color: #4b5563;
            margin-top: 2px;
        }
        
        .status-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            background: #064e3b;
            color: #d1d5db;
            padding: 25px;
            text-align: center;
            font-size: 12px;
        }
        .footer strong { color: #6ee7b7; }
        .footer a { color: #93c5fd; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
        .footer .company { 
            font-size: 16px; 
            color: #ffffff; 
            font-weight: 700;
            letter-spacing: 1px;
        }
        .footer .company span.green { color: #6ee7b7; }
        .footer .company span.blue { color: #93c5fd; }
        .footer .divider {
            border: none;
            border-top: 1px solid #065f46;
            margin: 16px 0;
        }
        
        @media (max-width: 480px) {
            body { padding: 20px 10px; }
            .container { border-radius: 16px; }
            .content { padding: 20px 16px; }
            .header { padding: 16px 16px 14px 16px; }
            .header .logo-container img { max-width: 200px; }
            .info-grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 17px; }
            .greeting h2 { font-size: 18px; }
            .vehicle-card .brand-model { font-size: 16px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER CON LOGO REAL -->
        <div class="header">
            <div class="logo-container">
                <img src="${emailConfig.logoUrl}" alt="${emailConfig.companyName}" />
            </div>
            <div class="title-container">
                <h1>${title}</h1>
                <div class="order-number">${order.orderNumber}</div>
                <div class="date-badge">📅 ${currentDate}</div>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">
                <h2>${isAdmin ? '🔔 New Reservation!' : '🚗 Reservation Confirmed!'}</h2>
                <p>${subtitle}</p>
                <span class="status-badge">${order.status} • ${order.paymentMethod.replace('_', ' ')}</span>
            </div>
            
            ${customerMessage}
            
            <div class="section-title">🚙 Vehicle</div>
            <div class="vehicle-card">
                <div class="brand-model">${car.brand} ${car.model}</div>
                <div class="price">
                    <strong>${formatCurrency(car.basePricePerDay)}</strong> / day 
                    • <span style="color: #064e3b; font-weight: 600;">${order.days} days</span>
                </div>
            </div>
            
            <div class="section-title">📍 Itinerary</div>
            <div class="info-grid">
                <div class="info-card">
                    <div class="label">🟢 Pick-up</div>
                    <div class="value">${order.pickup.location}</div>
                    <div class="sub-value">${formatDate(order.pickup.date)}</div>
                    <div class="sub-value" style="color: #f59e0b; font-weight: 600;">${formatCurrency(order.pickup.price)}</div>
                </div>
                <div class="info-card">
                    <div class="label">🔴 Drop-off</div>
                    <div class="value">${order.return.location}</div>
                    <div class="sub-value">${formatDate(order.return.date)}</div>
                    <div class="sub-value" style="color: #f59e0b; font-weight: 600;">${formatCurrency(order.return.price)}</div>
                </div>
            </div>
            
            ${customerSection}
            
            <div class="section-title">🎯 Extras & Services</div>
            ${addOnsSection}
            
            <div class="section-title">💰 Summary</div>
            <table class="price-table">
                <tr>
                    <td class="label">Rental (${order.days} days)</td>
                    <td class="amount">${formatCurrency(financials.rentalSubtotal)}</td>
                </tr>
                <tr>
                    <td class="label">📍 Location Fees</td>
                    <td class="amount">${formatCurrency(financials.locationFee)}</td>
                </tr>
                ${order.addOns.length > 0 ? `
                <tr>
                    <td class="label">🎯 Extras</td>
                    <td class="amount">${formatCurrency(financials.addOnsTotal)}</td>
                </tr>
                ` : ''}
                <tr>
                    <td class="label">Subtotal</td>
                    <td class="amount">${formatCurrency(financials.subtotalGeneral)}</td>
                </tr>
                <tr>
                    <td class="label">Tax (${(financials.taxPercentage * 100)}%)</td>
                    <td class="amount">${formatCurrency(financials.taxAmount)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total</strong></td>
                    <td class="amount"><strong>${formatCurrency(financials.totalFinal)}</strong></td>
                </tr>
            </table>
            
            <div style="text-align: center; margin: 16px 0; font-size: 13px; color: #4b5563;">
                💳 Payment: <strong style="color: #064e3b; text-transform: capitalize;">${order.paymentStatus}</strong>
                • Method: <strong style="color: #064e3b; text-transform: capitalize;">${order.paymentMethod.replace('_', ' ')}</strong>
            </div>
            
            ${whatsappButton}
            ${adminButton}
        </div>
        
        <div class="footer">
            <div class="company">
                <span class="green">PUNTA CANA</span> <span class="blue">GO RENT CAR</span>
            </div>
            <p style="margin-top: 6px;">
                📞 ${emailConfig.companyPhone}<br>
                📧 <a href="mailto:${emailConfig.senderEmail}">${emailConfig.senderEmail}</a>
            </p>
            <hr class="divider">
            <p style="font-size: 11px; opacity: 0.7;">
                © ${new Date().getFullYear()} Punta Cana Go Rent Car. All rights reserved.<br>
                This is an automated confirmation, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { buildOrderTemplate };