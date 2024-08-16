# Address-based Wildfire Risk API

## Overview

This project is a backend application built with NestJS and TypeScript. It processes user-submitted addresses, retrieves geocoding data (latitude and longitude), checks for nearby wildfires using NASA's FIRMS API, and stores the results in a PostgreSQL database. The application provides several API endpoints to submit addresses, retrieve all stored addresses, and get detailed information for a specific address.

## Features

- **Address Submission Endpoint**: Submit an address, retrieve geolocation data, check for wildfire risks, and save the information to the database.
- **Address Listing Endpoint**: Retrieve a list of all submitted addresses with their respective geolocation data.
- **Address Detail Endpoint**: Get detailed information for a specific address, including wildfire data.

## Technical Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize (with `sequelize-typescript`)
- **Geocoding API**: Google Maps Geocoding API
- **Wildfire Data API**: NASA's FIRMS API
- **Containerization**: Docker

## Installation and Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.x or later)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Google Maps Geocoding API key
- NASA FIRMS API key

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/wildfire-risk-api.git
   cd wildfire-risk-api

   ```

2. **Install dependencies:**

   ```bash
   Copy code
   npm install

   ```

3. **Set up environment variables:**

   Create a .env file in the root directory and populate it with your API keys and database credentials:

   ```bash
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NASA_API_KEY=your_nasa_firms_api_key
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=your_db_username
   DATABASE_PASSWORD=your_db_password
   DATABASE_NAME=wildfire_risk_db

   ```

4. **Run the application using Docker Compose:**

   This will spin up the PostgreSQL database and the NestJS application in containers.

   ```bash
   docker-compose up
   ```

### Database

#### Migration

This project uses PostgreSQL to store address and wildfire data. The database schema is managed using Sequelize ORM.

```bash
npm run db:migrate
```

#### Seeding

(Optional) Seed the database with initial data:

```bash
npm run db:seed
```

### Additional Notes:

- Replace placeholder values like `your_google_maps_api_key` and `your_nasa_firms_api_key` with actual API keys.
- Update the repository URL and other details as needed based on your project setup.
- Include database migration and seed commands if applicable.
