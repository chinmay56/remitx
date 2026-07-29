# RemitX - Zero-Fee Remittance Platform

A complete full-stack mobile-first FinTech Financial Inclusion Platform for migrant workers. Zero-fee remittance and digital wallet application built on Polygon Amoy testnet.

## 🚀 Features

- **Zero Fees**: Platform absorbs all blockchain gas fees
- **Instant Transfers**: 2-second blockchain transactions
- **Mobile-First**: Optimized for 375px (iPhone SE) and up
- **Blockchain Wallet**: Auto-generated Ethereum wallet for each user
- **KYC Verification**: Secure identity verification with encrypted storage
- **AI-Powered Tips**: Gemini AI provides personalized savings advice
- **Multi-Currency**: Support for INR, USD, AED, SGD
- **Real-Time Rates**: Live MATIC to INR conversion via CoinGecko
- **Transaction History**: Complete audit trail with Polygonscan links
- **Investment Options**: Digital Gold, Mutual Funds, Fixed Deposits (UI ready)

## 🛠️ Tech Stack

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- React Hot Toast (notifications)
- React Hook Form + Zod (forms & validation)

### Blockchain
- Ethers.js v6
- Hardhat
- Solidity ^0.8.19
- Polygon Amoy Testnet
- Alchemy RPC

### Backend
- Supabase (Database, Auth, Storage)
- CoinGecko API (Exchange rates)
- Gemini API (AI tips)

## 📦 Installation

1. **Clone and Install**
```bash
cd /Users/darshanpatil/Documents/Remitx
npm install
```

2. **Setup Environment Variables**

Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ALCHEMY_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_POLYGONSCAN_URL=https://amoy.polygonscan.com/tx/
WALLET_ENCRYPTION_KEY=your_32_byte_base64_key
COINGECKO_API_URL=https://api.coingecko.com/api/v3
GEMINI_API_KEY=your_gemini_key
MASTER_WALLET_PRIVATE_KEY=your_master_wallet_private_key
```

3. **Setup Supabase Database**

Create these tables in Supabase:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  country TEXT,
  country_code TEXT,
  password TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  kyc_status TEXT DEFAULT 'pending',
  kyc_document_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  amount_matic NUMERIC NOT NULL,
  amount_inr NUMERIC NOT NULL,
  tx_hash TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket for KYC documents
-- Go to Supabase Storage and create bucket: kyc-documents
```

4. **Deploy Smart Contract**

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network amoy
```

Copy the deployed contract address to `.env.local`

5. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
fintech-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.jsx
│   │   ├── send/page.jsx
│   │   ├── receive/page.jsx
│   │   ├── history/page.jsx
│   │   ├── invest/page.jsx
│   │   └── profile/page.jsx
│   └── api/
│       ├── auth/
│       ├── wallet/
│       ├── transfer/
│       └── ai/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── send/
│   └── shared/
├── lib/
│   ├── blockchain.js
│   ├── contractABI.js
│   ├── supabase.js
│   ├── encryption.js
│   ├── coingecko.js
│   └── gemini.js
├── contracts/
│   └── Remittance.sol
└── scripts/
    └── deploy.js
```

## 🎨 Design System

### Colors
- Base: `#0A0F1E` (deep navy)
- Primary: `#3B82F6` (electric blue)
- Secondary: `#06B6D4` (neon cyan)
- Accent: `#8B5CF6` (soft purple)
- Success: `#10B981`
- Error: `#EF4444`

### Components
- Glassmorphism cards with backdrop blur
- Gradient buttons (blue to purple)
- Floating gradient orbs in background
- Smooth Framer Motion animations
- Mobile-first responsive design

## 🔐 Security Features

- AES-256 encryption for private keys
- Bcrypt password hashing
- JWT authentication
- Server-side only sensitive env vars
- Master wallet pays all gas fees
- KYC document encryption

## 🌍 Multilingual Support

- English
- Hindi (हिंदी)
- Arabic (العربية)
- RTL layout support for Arabic

## 📱 Mobile Features

- PWA enabled (installable)
- Bottom navigation bar
- Touch-friendly 48x48px tap targets
- Pull to refresh
- Swipeable cards
- iOS safe area support

## 🚦 Gas Fee Strategy

The platform uses a master wallet to pay all gas fees:
1. User initiates transfer
2. Master wallet signs and pays gas
3. User sees ₹0 fee
4. Platform absorbs ~₹0.07 per transaction

## 🧪 Testing

Get free Polygon Amoy testnet MATIC:
- [Polygon Faucet](https://faucet.polygon.technology/)
- [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy)

## 📊 API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/wallet/balance` - Get balance
- `POST /api/transfer/send` - Send money
- `GET /api/transfer/history` - Transaction history
- `GET /api/ai/tips` - AI savings tips

## 🎯 Roadmap

- [ ] Biometric authentication
- [ ] Multi-language UI
- [ ] Investment features (Gold, MF, FD)
- [ ] Recurring payments
- [ ] Bill payments
- [ ] Merchant payments
- [ ] Referral program

## 📄 License

MIT

## 👨‍💻 Developer

Built for migrant workers worldwide 🌍
