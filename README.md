# Travel Agency Server

A robust, modern, and scalable Node.js backend for a travel agency platform. This server provides secure RESTful APIs for managing users, trips, and payroll, with seamless MongoDB integration and JWT-based authentication.

## Features

- **User Management**: Register, authenticate, and manage user roles (admin, HR, employee).
- **Trip Management**: Create, retrieve, and delete travel itineraries with rich metadata and Unsplash-powered images.
- **Payroll System**: Track and manage employee payrolls with monthly status and payment history.
- **Secure Authentication**: JWT-based authentication and role-based access control for sensitive endpoints.
- **CORS & Cookie Support**: Configured for modern web clients with secure cookie handling and CORS.
- **Environment Variables**: All secrets and sensitive data are managed via `.env` for security.
- **Production Ready**: Easily deployable to Vercel or any Node.js hosting platform.

## Tech Stack

- **Node.js** (ES Modules)
- **Express.js**
- **MongoDB Atlas** (with official driver)
- **JWT** for authentication
- **Stripe** for payment integration
- **Unsplash API** for trip images
- **dotenv** for environment management

## API Endpoints

### User Endpoints
- `POST /users` — Register a new user
- `GET /users` — List all users
- `GET /users/profile/:email` — Get user profile (including password)
- `GET /users/admin/:email` — Check if user is admin

### Trip Endpoints
- `POST /trips` — Create a new trip
- `GET /trips` — List all trips (optionally filter by userId)
- `GET /trips/:id` — Get a specific trip by ID
- `DELETE /trips/:id` — Delete a trip by ID

### Payroll Endpoints
- `POST /payrolls` — Create payroll record
- `GET /payrolls` — List all payrolls
- `PATCH /payrolls/:id` — Update payroll status
- `GET /payrolls/:email` — Get payrolls for a user

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Unsplash API key
- Stripe API key

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/travel-agency-server.git
   cd travel-agency-server
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your credentials:
     ```env
     DB_USER=your_db_user
     DB_PASS=your_db_password
     ACCESS_TOKEN=your_jwt_secret
     STRIPE_SECRET_KEY=your_stripe_secret
     ```
4. **Start the server:**
   ```sh
   npm start
   ```
   The server will run on `http://localhost:5000` by default.

## Deployment

This project is ready for deployment on Vercel. The included `vercel.json` configures the build and routing for a seamless deployment experience.

## Security Notes
- Never commit your `.env` file to version control.
- Passwords are returned in the `/users/profile/:email` endpoint for internal/admin use only. Remove or secure this in production.
- Use HTTPS in production and set secure cookie/CORS settings.

## License

This project is licensed under the ISC License.

## Author

Developed by a passionate travel tech team.

---

> "Empowering travel agencies with modern, secure, and scalable technology."
