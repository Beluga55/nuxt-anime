# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results

## Project Architecture

This is a full-stack anime-themed e-commerce application with separate frontend and backend services:

### Frontend (Nuxt.js 3)
- **Location**: `/bunz-studio/`
- **Framework**: Nuxt.js 3.13.0 with SSR disabled (`ssr: false`)
- **UI**: Tailwind CSS + Shadcn-nuxt components + Radix-Vue
- **State**: Pinia stores (8 stores: auth, cart, products, order, payment, support, testimonials, reviews)
- **Validation**: VeeValidate with Zod schemas
- **Auth**: JWT tokens + Google OAuth
- **Payments**: Stripe integration

### Backend (Express.js)
- **Location**: `/server/`
- **Framework**: Express.js with ES modules
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT + bcrypt + 2FA (Speakeasy) + OTP (Twilio)
- **Storage**: Google Cloud Storage
- **Cache**: Redis for sessions
- **Email**: Nodemailer

## Development Commands

### Frontend Development
```bash
cd bunz-studio
npm run dev          # Start Nuxt dev server
npm run build        # Production build
npm run generate     # Static generation
npm run preview      # Preview build
```

### Backend Development
```bash
cd server
npm run server       # Backend only
npm run client       # Frontend only
npm run dev          # Both frontend & backend (uses concurrently)
npm run prebuild     # Generate Google API credentials
```

### Docker Development
```bash
# Development with hot reloading
docker-compose -f compose.dev.yml up

# Production
docker-compose up -d
```

## Key Configuration

### Environment Variables Required
- **Database**: `MONGODB_URI`, MongoDB user/password
- **Auth**: `JWT_SECRET`, `GOOGLE_CLIENT_ID`
- **Payments**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Communication**: `TWILIO_*`, `NODEMAILER_*`
- **Storage**: `GOOGLE_CLOUD_*`

### Nuxt Configuration (`bunz-studio/nuxt.config.ts`)
- SSR disabled for SPA mode
- Runtime config for API URL and Stripe keys
- Modules: Tailwind, Shadcn, Pinia, Google Sign-in, Particles

## Code Organization

### Frontend Structure
```
bunz-studio/
├── pages/           # File-based routing (/products, /admin/*, etc.)
├── layouts/         # 4 layouts including admin layout
├── components/      # Reusable components + UI library
├── middleware/      # Route protection (auth, admin)
├── store/           # 8 Pinia stores
├── composables/     # Vue composables
└── api/             # API client wrappers
```

### Backend Structure
```
server/
├── routes/          # Express routes (/auth, /products, /api/orders, /admin)
├── models/          # Mongoose models (User, Product, Order, Support, etc.)
├── middleware/      # Auth middleware, CORS
└── server.js        # Main server file
```

## Database Models

### Key Models (Mongoose)
- **User**: Email/password + Google auth + admin flags + 2FA settings
- **Product**: Categories, pricing, images, stock management
- **Order**: Stripe integration, order status, user association
- **Support**: Customer service ticket system
- **Testimonials**: User reviews and ratings

## Authentication Flow

1. **Registration**: Email/password or Google OAuth
2. **Login**: JWT token generation with expiration
3. **2FA**: Optional TOTP using Speakeasy
4. **Password Reset**: OTP via Twilio SMS
5. **Admin Access**: Role-based middleware protection

## Payment Processing

- **Stripe Integration**: Card payments with webhooks
- **Webhook Endpoint**: `/api/webhooks/stripe`
- **Order Flow**: Cart → Checkout → Payment → Order confirmation
- **Admin Panel**: Order management and tracking

## Security Features

- JWT token expiration handling
- Admin-only route protection via middleware
- Input validation with Zod schemas
- 2FA for enhanced security
- CORS configuration
- Password hashing with bcrypt

## Development Notes

- Application runs in SPA mode (SSR disabled)
- JWT tokens stored in localStorage
- Centralized API client with axios interceptors
- Mobile-responsive Tailwind design
- Custom color scheme: coral/salmon primary (#fd7968)
- Font families: Manrope (dashboard), Plus Jakarta Sans (general)