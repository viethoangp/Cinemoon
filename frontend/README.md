# Cinemoon Frontend: Movie Booking UI

A React.js + TypeScript + TailwindCSS mockup for a movie ticket booking web application. This folder contains the user-facing interface for the [Cinemoon](../README.md) project, a full-stack 3-tier application demonstrating Oracle database concurrency and deadlock handling.

## Project Overview

This frontend is a **UI-first mockup** that will be gradually integrated with the Node.js/Express backend API. Currently, all screens use **mock data** stored in [src/app/context/AppContext.tsx](src/app/context/AppContext.tsx); during implementation, these will be replaced with real API calls while keeping the layout and styling intact.

### Original Design

The UI design is based on a Figma mockup:  
https://www.figma.com/design/i6yFSIvjhRAOuB1OpwDmW1/Cinemoon-Desktop-App-Mockup

## Features

### 7 Screen Flows

1. **Login Screen** (`/`) — User authentication (currently bypasses to home screen)
2. **Home Screen** (`/home`) — Browse and filter movies
3. **Showtime Screen** (`/showtime`) — Select date and showtime
4. **Seat Map Screen** (`/seat`) — Choose seats, see seat types and pricing
5. **Checkout Screen** (`/checkout`) — Review order, apply vouchers, confirm payment
6. **Profile Screen** (`/profile`) — View booking history and personal info
7. **Admin Screen** (`/admin`) — Administrative controls (future development)

### Technology Stack

- **React 18** + **TypeScript** — Component-based UI with type safety
- **Vite** — Lightning-fast dev server and build tool
- **TailwindCSS** — Utility-first CSS framework
- **React Router** — Client-side routing (7 routes)
- **Shadcn/ui** — Pre-built accessible UI components
- **Lucide Icons** — Modern icon library

## Getting Started

### Prerequisites

- **Node.js** 16+
- **npm** or **yarn**

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173` with hot module reloading (HMR).

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

