# Setup Guide

This guide provides instructions for setting up and running the MyTravel application on your local development environment.

## Prerequisites

The following software must be installed on your machine before proceeding with the setup:

- **.NET 10 SDK** - The backend is built on ASP.NET Core 10. Download from [dotnet.microsoft.com](https://dotnet.microsoft.com/download)
- **Node.js (v18 or higher)** - Required for the frontend build tools. Download from [nodejs.org](https://nodejs.org/)
- **npm** - Comes bundled with Node.js and is used for managing frontend dependencies

To verify your installations, run the following commands in your terminal:

```bash
dotnet --version    # Should output 10.x.x
node --version      # Should output v18.x.x or higher
npm --version       # Should output 9.x.x or higher
```

## Installation

### 1. Install Frontend Dependencies

Navigate to the client project and install the required npm packages:

```bash
cd mytravel.client
npm install
cd ..
```

### 2. Configure the Backend (Optional)

The application comes with default configuration settings that work out of the box for local development. The configuration files are located in the `MyTravel.Server` directory:

- `appsettings.json` - Base configuration
- `appsettings.Development.json` - Development-specific settings

The default admin credentials are configured in `appsettings.json`:

```json
{
  "AdminCredentials": {
    "Email": "admin@mytravel.com",
    "Password": "Admin@123!"
  }
}
```

For production deployments, these credentials should be changed and stored securely using environment variables or a secrets manager.

## Running the Application

The MyTravel solution uses the ASP.NET Core SPA Proxy feature, which means the frontend development server starts automatically when you run the backend. This provides a seamless development experience where both the API and client are available from a single command.

### Using Visual Studio

1. Open `MyTravel.slnx` in Visual Studio
2. Set `MyTravel.Server` as the startup project
3. Press `F5` to run with debugging, or `Ctrl+F5` to run without debugging

Visual Studio will automatically start both the backend server and the frontend development server.

### Using the Command Line

Navigate to the server project directory and run:

```bash
cd MyTravel.Server
dotnet run
```

For a more interactive development experience, use `dotnet watch` which provides hot reload capabilities. This automatically rebuilds and restarts the application when code changes are detected:

```bash
cd MyTravel.Server
dotnet watch
```

The `dotnet watch` command is recommended during active development as it significantly speeds up the feedback loop when making changes to the backend code.

## Accessing the Application

Once the application is running, you can access it at the following URLs:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:49764 | Main application interface |
| Backend API | http://localhost:5083 | API endpoints |
| Scalar API Docs | http://localhost:5083/scalar/v1 | Interactive API documentation (development only) |

The frontend development server proxies API requests to the backend, so you can interact with the application entirely through the frontend URL during development.

## Database

MyTravel uses SQLite as its database, which requires no additional setup. The database file is created automatically when the application first runs and is stored in the `MyTravel.Server` directory as `mytravel.db`.

The database is seeded with sample data on first run, including:
- Sample destinations and activities
- Demo blog posts
- The admin user account

To reset the database, simply delete the `mytravel.db` file and restart the application.

## Troubleshooting

### Port Already in Use

If you encounter an error indicating that a port is already in use, another application may be using ports 5083 or 49764. You can either stop the conflicting application or modify the ports in the following files:

- `MyTravel.Server/Properties/launchSettings.json` - Backend port configuration
- `mytravel.client/vite.config.ts` - Frontend port configuration

### Frontend Not Starting Automatically

If the frontend does not start automatically with the backend, you can run it manually in a separate terminal:

```bash
cd mytravel.client
npm run dev
```

### Certificate Errors

The development server uses HTTPS with a self-signed certificate. If your browser shows a certificate warning, you can proceed by accepting the risk (for development purposes only) or trust the .NET development certificate:

```bash
dotnet dev-certs https --trust
```

---

[← Back to Documentation](./01-README.md)
