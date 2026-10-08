# AI-Powered E-Commerce App

A cross-platform shopping app (iOS, Android and web) built with React Native (Expo) and a Node.js/Express API. Users can register, browse and search products, manage a cart and wishlist, check out, pay (demo), track orders, get personalised recommendations and insights, and chat with a shopping assistant.

Prices are shown in Kenyan shillings (KSh).

## Screenshots

| Home | Product | Cart |
|------|---------|------|
| ![Home](docs/screenshots/home.png) | ![Product](docs/screenshots/product.png) | ![Cart](docs/screenshots/cart.png) |

| Assistant | Insights | Orders |
|-----------|----------|--------|
| ![Assistant](docs/screenshots/assistant.png) | ![Insights](docs/screenshots/insights.png) | ![Orders](docs/screenshots/orders.png) |

## Features

- **Register and log in** with JWT authentication and the session restored on app start
- **Browse products** in a responsive grid (2 to 5 columns depending on screen width)
- **Search and filter** by keyword, category, price range and sort order
- **Cart** with quantity controls and live totals, stored per user on the server
- **Wishlist** with a heart button on every product
- **Checkout and payment** with a shipping form and a demo card payment
- **Order tracking** with order status and payment status
- **Recommendations** ("Recommended for you") based on purchases, wishlist and cart
- **Shopping assistant chat** that understands requests like "cheap electronics under 10000"
- **Personalised insights**: total spent, average order, favourite category, most bought item and spending by category

## Important notes

- **Payment is a demo.** No real card is charged and card details are never stored. Use `4242 4242 4242 4242` with any future expiry and any 3-digit CVC. The card `4000 0000 0000 0002` is always declined.
- **Recommendations, insights and the assistant are rule-based.** They run on the app's own data with plain logic and do not call any AI service. The assistant endpoint is designed so an LLM can be swapped in later without changing the app.

## Tech stack

| Layer | Technology |
|-------|-----------|
| App | React Native, Expo, Expo Router, TypeScript |
| API | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcrypt |

## Security

- Passwords are hashed with bcrypt and never returned by the API
- Protected routes require a valid JWT, and every cart, order and wishlist query is scoped to the logged-in user
- Failed logins are rate limited to 3 attempts per 15 minutes per IP, and registrations are limited per hour
- Order totals and prices are calculated on the server, never trusted from the app
- Secrets live in `.env`, which is excluded from Git

## Project structure

```
ai-ecommerce/
├── app/                  # Expo app (iOS, Android, web)
│   └── src/
│       ├── app/          # Screens (file-based routing)
│       ├── components/   # Reusable UI
│       ├── context/      # Auth, cart and wishlist state
│       └── lib/          # API client, types, formatting
└── backend/              # Express API
    └── src/
        ├── config/       # Database connection
        ├── controllers/  # Request logic
        ├── middleware/   # Auth and rate limiting
        ├── models/       # Mongoose models
        └── routes/       # API routes
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone and install

```bash
git clone https://github.com/techwizh/ai-ecommerce.git
cd ai-ecommerce
cd backend && npm install
cd ../app && npm install
```

### 2. Configure the backend

Create `backend/.env` (see `backend/.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@YOUR-CLUSTER.mongodb.net/ai-ecommerce?appName=Cluster0
JWT_SECRET=use_a_long_random_string
CLIENT_URL=http://localhost:8081
```

### 3. Seed sample products and start the API

```bash
cd backend
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### 4. Start the app

In a second terminal:

```bash
cd app
npx expo start
```

Press `w` to open the web version, or scan the QR code with Expo Go on your phone.

**Testing on a phone:** the phone and computer must be on the same Wi-Fi. Set `LAN_IP` in `app/src/lib/api.ts` to your computer's local address (shown in the Expo terminal as `exp://192.168.x.x:8081`).

## API overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create an account | No |
| POST | `/api/auth/login` | Log in | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/products` | List, search, filter, sort | No |
| GET | `/api/products/categories` | Category list | No |
| GET | `/api/products/:id` | Product details | No |
| GET/POST/DELETE | `/api/cart` | View, add, clear cart | Yes |
| PUT/DELETE | `/api/cart/:productId` | Change quantity, remove item | Yes |
| GET/POST | `/api/wishlist` | View, add to wishlist | Yes |
| DELETE | `/api/wishlist/:productId` | Remove from wishlist | Yes |
| POST/GET | `/api/orders` | Place order, list orders | Yes |
| GET | `/api/orders/:id` | Order details | Yes |
| POST | `/api/orders/:id/pay` | Demo payment | Yes |
| GET | `/api/recommendations` | Recommended products | Yes |
| GET | `/api/insights` | Spending insights | Yes |
| POST | `/api/assistant` | Shopping assistant | Yes |

## Roadmap

- Deploy the API and web app
- Replace the rule-based assistant with an LLM behind the same endpoint
- Real payments (for example Stripe or M-Pesa)
- Admin dashboard for managing products and orders

## Author

Victor Kioko