# Punta Cana Go - Car Rental API

This is the backend service for the Punta Cana Go rental platform, built to handle vehicle inventory, booking logic, and financial calculations.

##  Features
- **Booking Management:** Real-time processing of car reservations.
- **Financial Engine:** Automated calculation of daily rates, add-ons (SIM cards, child seats), and ITBIS (18%).
- **Location Support:** Integrated handling for Punta Cana Airport, Bavaro, and La Romana locations.

## Tech Stack
- **Node.js / Express** (o el framework que uses)
- **Database:** PostgreSQL/MongoDB (especifica cuál usas)
- **Deployment:** Render

##  Environment Variables
 Environment Variables
To run this project, you will need to configure the following environment variables in your Render Dashboard:

### Database & Security
MONGO_URI: Your MongoDB connection string.
JWT_SECRET: Secret key for authentication tokens.

### Frontend Connectivity
FRONTEND_URL: Primary production URL.
FRONTEND_URL_2: Secondary or development URL for CORS.

### Email Service (SMTP)
EMAIL_SENDER: The email address sending the notifications.
EMAIL_PASSWORD: SMTP app password.
EMAIL_HOST: smtp.hostinger.com
EMAIL_PORT: 465
EMAIL_SECURE: true
CONTACT_EMAIL_RECEIVER: The agency email that receives booking alerts.

### Media & Cloudinary
CLOUDINARY_CLOUD_NAME: For vehicle image hosting.
CLOUDINARY_API_KEY: Your Cloudinary API key.
CLOUDINARY_API_SECRET: Your Cloudinary API secret.

### External APIs
OPEN_WEATHER_API_KEY: To show local weather in Punta Cana.
GOOGLE_PLACES_API_KEY: For location and map services.
GOOGLE_PLACE_ID: Specific ID for the car rental office location.

##  Deployment on Render
1. Create a new **Web Service**.
2. Connect your GitHub repository.
3. Build Command: `npm install` (and `npm run build` if using TS).
4. Start Command: `npm start` (or `node dist/index.js`).