# Architecture

This document provides an overview of the MyTravel application's code structure and organization. The project follows a modern full-stack architecture with a clear separation between the frontend React application and the backend ASP.NET Core API.

## High-Level Architecture

The application consists of two main components that communicate over HTTP. The frontend handles all user interface concerns while the backend manages data persistence, business logic, and authentication.

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite)"]
        UI[User Interface]
        State[State Management]
        Router[Wouter Router]
    end
    
    subgraph Server["Backend (ASP.NET Core)"]
        API[REST API Endpoints]
        Auth[Identity Authentication]
        EF[Entity Framework Core]
    end
    
    subgraph Database["Data Layer"]
        SQLite[(SQLite Database)]
    end
    
    UI --> State
    State --> Router
    Router --> API
    API --> Auth
    API --> EF
    EF --> SQLite
```

## Request Flow

When a user interacts with the application, requests flow through several layers before reaching the database. This diagram illustrates the typical request lifecycle.

```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant Query as TanStack Query
    participant API as ASP.NET API
    participant EF as Entity Framework
    participant DB as SQLite

    User->>React: Interact with UI
    React->>Query: Execute Query/Mutation
    Query->>API: HTTP Request
    API->>API: Validate & Authenticate
    API->>EF: Database Operation
    EF->>DB: SQL Query
    DB-->>EF: Result Set
    EF-->>API: Entity Objects
    API-->>Query: JSON Response
    Query-->>React: Update Cache
    React-->>User: Render Updated UI
```

## Frontend Architecture

The frontend is built with React and TypeScript, using Vite as the build tool. The codebase follows a feature-based organization pattern with clear separation of concerns.

```mermaid
flowchart TB
    subgraph Entry["Entry Points"]
        index[index.html]
        main[main.tsx]
    end
    
    subgraph Core["Core Application"]
        App[App.tsx]
        Layout[layout.tsx]
    end
    
    subgraph Pages["Pages"]
        Public[Public Pages]
        Admin[Admin Pages]
    end
    
    subgraph Components["Components"]
        UI[UI Components]
        Features[Feature Components]
        Blocks[Content Blocks]
    end
    
    subgraph State["State & Data"]
        Context[React Context]
        Hooks[Custom Hooks]
        QueryClient[TanStack Query]
    end
    
    subgraph Utils["Utilities"]
        Lib[lib/utils]
        Data[lib/data]
    end
    
    index --> main
    main --> App
    App --> Layout
    Layout --> Pages
    Pages --> Components
    Components --> State
    Components --> Utils
```

### Frontend Directory Structure

```
mytravel.client/
├── client/
│   ├── index.html                 # HTML entry point
│   ├── public/                    # Static assets (images, fonts)
│   └── src/
│       ├── App.tsx                # Root component with routing
│       ├── main.tsx               # React entry point
│       ├── index.css              # Global styles (Tailwind)
│       │
│       ├── components/            # Reusable components
│       │   ├── admin/             # Admin-specific components
│       │   │   ├── admin-layout.tsx
│       │   │   ├── protected-admin-route.tsx
│       │   │   └── ...
│       │   ├── blocks/            # Content block components
│       │   ├── editor/            # Lexical editor components
│       │   ├── ui/                # Base UI components (55+)
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── dialog.tsx
│       │   │   └── ...
│       │   ├── booking-form.tsx
│       │   ├── cart-sheet.tsx
│       │   ├── destination-card.tsx
│       │   ├── hero.tsx
│       │   ├── itinerary-planner.tsx
│       │   ├── layout.tsx
│       │   └── trip-summary.tsx
│       │
│       ├── context/               # React context providers
│       │   ├── blog-context.tsx   # Blog state management
│       │   └── cart-context.tsx   # Shopping cart state
│       │
│       ├── hooks/                 # Custom React hooks
│       │   ├── use-admin-auth.tsx # Admin authentication
│       │   ├── use-auth.tsx       # User authentication
│       │   ├── use-mobile.tsx     # Responsive detection
│       │   ├── use-ping.tsx       # Activity tracking
│       │   └── use-toast.ts       # Toast notifications
│       │
│       ├── lib/                   # Utilities and data
│       │   ├── data.ts            # API client functions
│       │   ├── destinations.ts    # Destination data
│       │   ├── mock-data.ts       # Development mock data
│       │   ├── queryClient.ts     # TanStack Query config
│       │   └── utils.ts           # Helper functions
│       │
│       └── pages/                 # Page components
│           ├── admin/             # Admin pages
│           │   ├── admin-blog.tsx
│           │   ├── admin-bookings.tsx
│           │   ├── admin-dashboard.tsx
│           │   ├── admin-login.tsx
│           │   └── admin-users.tsx
│           ├── blog.tsx
│           ├── blog-detail.tsx
│           ├── blog-editor.tsx
│           ├── booking.tsx
│           ├── checkout.tsx
│           ├── destination-details.tsx
│           ├── destinations.tsx
│           ├── home.tsx
│           ├── login.tsx
│           ├── not-found.tsx
│           └── planner.tsx
│
├── attached_assets/               # Generated images
├── components.json                # shadcn/ui configuration
├── eslint.config.js               # ESLint configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite build configuration
```

### Component Hierarchy

This diagram shows the relationship between major frontend components and how they compose to form the user interface.

```mermaid
flowchart TB
    subgraph App["App.tsx"]
        Router[Wouter Router]
    end
    
    subgraph PublicRoutes["Public Routes"]
        Layout[Layout Component]
        subgraph PublicPages["Pages"]
            Home[HomePage]
            Destinations[DestinationsPage]
            DestDetail[DestinationDetails]
            Planner[PlannerPage]
            Booking[BookingPage]
            Checkout[CheckoutPage]
            Blog[BlogPage]
            BlogDetail[BlogDetailPage]
            BlogEditor[BlogEditorPage]
            Login[LoginPage]
        end
    end
    
    subgraph AdminRoutes["Admin Routes"]
        AdminLayout[AdminLayout]
        ProtectedRoute[ProtectedAdminRoute]
        subgraph AdminPages["Admin Pages"]
            Dashboard[AdminDashboard]
            Users[AdminUsers]
            Bookings[AdminBookings]
            AdminBlog[AdminBlog]
        end
    end
    
    Router --> Layout
    Router --> AdminLayout
    Layout --> PublicPages
    AdminLayout --> ProtectedRoute
    ProtectedRoute --> AdminPages
```

## Backend Architecture

The backend is built with ASP.NET Core using a minimal API approach. It follows a layered architecture with clear separation between endpoints, data access, and business logic.

```mermaid
flowchart TB
    subgraph Entry["Entry Point"]
        Program[Program.cs]
    end
    
    subgraph Endpoints["API Endpoints"]
        Public[Public Endpoints]
        Admin[Admin Endpoints]
        User[User Endpoints]
    end
    
    subgraph Services["Services"]
        Identity[ASP.NET Identity]
        Email[Email Service]
        SignIn[Custom SignIn Manager]
    end
    
    subgraph Data["Data Layer"]
        DbContext[ApplicationDbContext]
        DTOs[Data Transfer Objects]
        Seeder[Database Seeder]
    end
    
    subgraph Storage["Storage"]
        SQLite[(SQLite Database)]
        Static[wwwroot Static Files]
    end
    
    Program --> Endpoints
    Program --> Services
    Endpoints --> Data
    Services --> Data
    Data --> Storage
```

### Backend Directory Structure

```
MyTravel.Server/
├── Program.cs                     # Application entry point
│                                  # - Service configuration
│                                  # - Middleware pipeline
│                                  # - Endpoint registration
│
├── Data/                          # Data access layer
│   ├── ApplicationDbContext.cs    # EF Core context
│   │                              # - DbSet definitions
│   │                              # - Entity configurations
│   │                              # - Model definitions
│   └── DbSeeder.cs                # Database seeding
│                                  # - Sample destinations
│                                  # - Demo blog posts
│                                  # - Admin user creation
│
├── DTOs/                          # Data Transfer Objects
│   ├── BlogDtos.cs                # Blog request/response models
│   ├── BookingDtos.cs             # Booking request/response models
│   ├── UserDtos.cs                # User request/response models
│   └── WeatherForecast.cs         # Sample DTO
│
├── Endpoints/                     # API endpoint definitions
│   ├── ActivityEndpoints.cs       # Ping and heartbeat tracking
│   ├── AdminBlogEndpoints.cs      # Admin blog CRUD operations
│   ├── AdminBookingEndpoints.cs   # Admin booking management
│   ├── AdminEndpoints.cs          # Admin auth and user management
│   ├── BlogEndpoints.cs           # Public blog endpoints
│   ├── BookingEndpoints.cs        # Public booking endpoints
│   ├── UserEndpoints.cs           # User profile endpoints
│   └── WeatherEndpoints.cs        # Sample weather endpoint
│
├── Services/                      # Business logic services
│   ├── CustomSignInManager.cs     # Extended sign-in logic
│   └── EmailSender.cs             # Email sending service
│
├── Properties/
│   └── launchSettings.json        # Development launch profiles
│
├── Views/                         # Server-side views (if any)
│   └── PageBlockTypes/
│
├── wwwroot/                       # Static file serving
│
├── appsettings.json               # Base configuration
├── appsettings.Development.json   # Development configuration
├── MyTravel.Server.csproj         # Project file
└── MyTravel.Server.http           # HTTP request testing
```

### API Endpoint Organization

The API endpoints are organized into logical groups using ASP.NET Core's minimal API pattern with extension methods.

```mermaid
flowchart LR
    subgraph Program["Program.cs"]
        App[WebApplication]
    end
    
    subgraph EndpointGroups["Endpoint Groups"]
        Activity["/api/ping\n/api/heartbeat"]
        Auth["/api/login\n/api/register\n/api/logout"]
        User["/api/user/*"]
        Blog["/api/blog/*"]
        Booking["/api/bookings/*"]
        Admin["/api/admin/*"]
    end
    
    App --> Activity
    App --> Auth
    App --> User
    App --> Blog
    App --> Booking
    App --> Admin
```

## Data Model

The application uses Entity Framework Core with SQLite for data persistence. The data model centers around users, bookings, and blog content.

```mermaid
erDiagram
    ApplicationUser ||--o{ Booking : places
    ApplicationUser ||--o{ BlogPost : authors
    Booking ||--|{ BookingItem : contains
    
    ApplicationUser {
        string Id PK
        string Email
        string FirstName
        string LastName
        datetime CreatedAt
        datetime LastLoginAt
        boolean IsActive
    }
    
    BlogPost {
        int Id PK
        string Title
        string Slug UK
        string Category
        string Excerpt
        string Content
        string ImageUrl
        boolean IsPublished
        datetime CreatedAt
        datetime UpdatedAt
        string AuthorId FK
    }
    
    Booking {
        int Id PK
        string CustomerEmail
        string CustomerName
        decimal TotalAmount
        string Status
        datetime CreatedAt
        string UserId FK
    }
    
    BookingItem {
        int Id PK
        string Type
        string Title
        string Details
        decimal Price
        int BookingId FK
    }
```

## Authentication Flow

The application implements two separate authentication flows: one for regular users and one for administrators.

### User Authentication

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Identity as ASP.NET Identity
    participant DB as Database

    User->>Frontend: Enter credentials
    Frontend->>API: POST /api/login
    API->>Identity: SignInAsync()
    Identity->>DB: Validate credentials
    DB-->>Identity: User record
    Identity-->>API: SignIn result
    API-->>Frontend: Set auth cookie
    Frontend-->>User: Redirect to app
```

### Admin Authentication

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant API
    participant Config as appsettings.json

    Admin->>Frontend: Enter admin credentials
    Frontend->>API: POST /api/admin/login
    API->>Config: Check AdminCredentials
    Config-->>API: Email & Password
    API->>API: Validate credentials
    API-->>Frontend: Set admin_session cookie
    Frontend-->>Admin: Redirect to dashboard
```

## State Management

The frontend uses a combination of React Context and TanStack Query for state management. Local UI state is managed with React hooks, while server state is cached and synchronized using TanStack Query.

```mermaid
flowchart TB
    subgraph ServerState["Server State (TanStack Query)"]
        UserQuery[User Data]
        BlogQuery[Blog Posts]
        BookingQuery[Bookings]
        DestQuery[Destinations]
    end
    
    subgraph LocalState["Local State (React Context)"]
        CartContext[Cart Context]
        BlogContext[Blog Context]
    end
    
    subgraph ComponentState["Component State (useState)"]
        FormState[Form Inputs]
        UIState[UI Toggles]
        FilterState[Filter Values]
    end
    
    ServerState --> Components
    LocalState --> Components
    ComponentState --> Components
    
    Components[React Components]
```

## Build and Deployment

The application uses different build configurations for development and production environments.

```mermaid
flowchart LR
    subgraph Development
        ViteDev[Vite Dev Server]
        DotNetDev[dotnet watch]
        SPAProxy[SPA Proxy]
    end
    
    subgraph Production
        ViteBuild[Vite Build]
        DotNetPublish[dotnet publish]
        StaticFiles[wwwroot]
    end
    
    subgraph Output
        Bundle[JavaScript Bundle]
        DLL[.NET Assembly]
        Assets[Static Assets]
    end
    
    ViteDev --> SPAProxy
    SPAProxy --> DotNetDev
    
    ViteBuild --> Bundle
    DotNetPublish --> DLL
    Bundle --> StaticFiles
    StaticFiles --> Assets
```

### Development Mode

In development, the Vite development server runs on port 49764 and proxies API requests to the ASP.NET Core server on port 5083. The SPA Proxy middleware automatically starts the Vite server when the .NET application launches.

### Production Mode

For production, Vite builds optimized static assets that are served from the ASP.NET Core wwwroot directory. The .NET application serves both the API and the static frontend files.

---

[← Back to Documentation](./01-README.md)
