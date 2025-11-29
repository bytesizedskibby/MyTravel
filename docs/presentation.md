---
marp: true
theme: default
paginate: true
backgroundColor: #fff
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #2563eb;
  }
  h2 {
    color: #1e40af;
  }
  ul {
    font-size: 0.95em;
  }
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
---

# MyTravel
## Travel Booking Platform

*Explore the World with Ease*

![bg right:40% 80%](https://img.icons8.com/fluency/512/around-the-globe.png)

---

# Project Overview

**MyTravel** is a full-stack travel booking platform that provides:

- 🌍 Browse and discover travel destinations worldwide
- ✈️ Book flights, hotels, and guided tours
- 📅 Interactive trip planner with drag-and-drop
- 📝 Travel blog with rich content creation
- 👤 User accounts with booking history
- 🔐 Admin dashboard for platform management

---

# Key Features

<div class="columns">
<div>

### For Travelers
- **Destination Search** with filters
- **Interactive Maps** (Leaflet)
- **Drag-and-Drop Planner**
- **Shopping Cart & Checkout**
- **Blog Reading & Writing**

</div>
<div>

### For Admins
- **User Management**
- **Booking Management**
- **Blog Moderation**
- **Analytics Dashboard**
- **Revenue Tracking**

</div>
</div>

---

# Technology Stack

<div class="columns">
<div>

### Frontend
- ⚛️ **React 19** + TypeScript
- ⚡ **Vite 7** (Build Tool)
- 🎨 **Tailwind CSS 4**
- 📊 **TanStack Query**
- 🗺️ **Leaflet** (Maps)
- ✏️ **Lexical** (Rich Text Editor)

</div>
<div>

### Backend
- 🟣 **.NET 10** + ASP.NET Core
- 🗄️ **Entity Framework Core**
- 💾 **SQLite** Database
- 🔑 **ASP.NET Identity**
- 📡 **RESTful API**

</div>
</div>

---

# Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Components, Pages, Context, TanStack Query)           │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────▼───────────────────────────────────┐
│                  ASP.NET Core API                        │
│  (Endpoints, Services, Identity Authentication)          │
└─────────────────────┬───────────────────────────────────┘
                      │ Entity Framework Core
┌─────────────────────▼───────────────────────────────────┐
│                   SQLite Database                        │
│  (Users, Bookings, Blog Posts)                          │
└─────────────────────────────────────────────────────────┘
```

---

# Highlighted Features

| Feature | Description |
|---------|-------------|
| **Itinerary Planner** | Drag-and-drop trip organization with dnd-kit |
| **Interactive Maps** | Explore destinations geographically |
| **Rich Blog Editor** | Lexical-powered content creation |
| **Real-time Validation** | Zod + react-hook-form |
| **Responsive Design** | Mobile-first with Tailwind CSS |
| **Analytics** | PostHog integration for insights |

---

# Summary

### MyTravel delivers a complete travel booking experience

✅ Modern tech stack (React 19, .NET 10)
✅ Full-featured booking system
✅ Interactive trip planning
✅ Community blog platform
✅ Comprehensive admin tools
✅ Responsive & accessible design

---

<!-- _class: lead -->

# Thank You!

**MyTravel** - Your Gateway to Adventure

🌐 Built with React + ASP.NET Core
📧 Questions? Let's explore together!

