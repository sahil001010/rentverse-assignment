# RentVerse assessment

Wallet login and a smart-contract API were added on top of the existing frontend.

## Run

```bash
cp api/.env.example api/.env
npm install --legacy-peer-deps
npm start
```

The app opens at http://localhost:3000. The API listens on http://localhost:4000.

MetaMask works from the **Connect** button on the home page. After the wallet connects, sign the login message. That signature is checked by the API and becomes the session.

WalletConnect is wired through wagmi's WalletConnect connector (`@walletconnect/ethereum-provider`). Set `REACT_APP_WALLETCONNECT_PROJECT_ID` in `.env` to a project id from https://cloud.reown.com and restart.

## API shape

The browser never sends a private key. It signs. The API reads chain state and prepares calldata. The wallet broadcasts writes.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/nonce` | Create a one-time login message |
| POST | `/api/v1/auth/verify` | Check the signature and return a session token |
| GET | `/api/v1/auth/me` | Current signed-in address |
| GET | `/api/v1/chains` | Configured chains |
| GET | `/api/v1/chains/balance/:address` | Native balance |
| GET | `/api/v1/contracts` | Contract registry |
| POST | `/api/v1/contracts/:id/read` | `eth_call` for a view function |
| POST | `/api/v1/contracts/:id/encode` | Build calldata for the wallet to sign |
| GET | `/api/v1/contracts/:id/events` | Bounded event scan |

`usdc` is a live mainnet read so the integration can be demonstrated without deploying anything. `property-shares` matches `contracts/PropertyShares.sol`. Set `PROPERTY_SHARES_ADDRESS` after you deploy it. The property page then asks wagmi to send the prepared `invest` transaction.

Login nonces live in memory with a 5 minute expiry. For more than one API process, move that store and the rate limit to Redis. Contract definitions stay in `api/src/config/contracts.js`, so a new contract is a registry entry rather than a new route.

<!-- ⚠️ Best viewed in VS Code Markdown Preview -->
<!-- In GitHub this file may look unformatted or misaligned -->

<div align="center" style="font-size:28px; font-weight:700; color:#4ec9b0;">
✨ RentVerse ✨
</div>

---

<div align="center" style="font-size:18px; font-weight:700; color:#aaaaaa;">
RentVerse is a modern real estate investment platform that combines traditional property investing with cryptocurrency payments. Built with React and Tailwind CSS, it mirrors the functionality of Arrived.com while adding blockchain-based transaction capabilities.
</div>

---
![Dashboard Overview](public/home.jpg)
---

# 🌐 RentVerse Demo
---

RentVerse is a demo platform showcasing a next-generation real-estate experience powered by cryptocurrency payments, interactive 3D property visualization, and a fully responsive, component-driven architecture.

---

## ✨ Key Features

- 💱 Cryptocurrency-enabled property transactions  
- 📱 Mobile-responsive interface  
- 🔍 SEO-optimized architecture  
- 📊 Real-time market data integration  
- 🏡 Interactive 3D property visualization  
- 🔗 Smart contract integration for secure blockchain transactions  

---

![Dashboard Overview](public/client.png)
---

## 🧩 Core Pages and Components

### 1. 🏠 Home Page
- Hero section with value proposition  
- Featured properties grid  
- “Why Choose Us” crypto benefits section  
- Step-by-step investment guide  
- Latest blog previews  
- Community section  

### 2. 🏘️ Properties Page
- Searchable and filterable property grid  
- Advanced search options  
- Detailed property cards  
- Three.js-powered 3D viewer  

### 3. 👥 About Us Page
- Mission and vision overview  
- Team member profiles  
- Platform statistics and milestones  

### 4. ✍️ Blog Section
- Category-based filtering  
- Blog search functionality  
- Author profiles  
- Social sharing options  

---

## 🧱 Development Guidelines

### 🧩 Component Standards
- Follow atomic design principles  
- Use TypeScript for type safety  
- Apply Tailwind breakpoints for responsiveness  
- Add comments and maintain documentation  

### 🔧 State Management
- React Context for shared global state  
- Redux for complex or multi-layered data flows  
- Minimal local component state  

### 🔐 Security Practices
- Validate all user inputs  
- Secure wallet connection handling  
- Follow blockchain transaction best practices  
- Run regular dependency and security audits  

---

## 🤝 Contributing

We welcome contributions! Please follow the workflow below:

1. 📌 Create a new feature branch  
2. 🧪 Write tests for added functionality  
3. 📝 Document new or updated features  
4. 🎯 Maintain consistent coding style  
5. 🔁 Submit a pull request with a clear description  

---

## 🙏 Acknowledgments

Inspired by Arrived.com and supported by the open-source work of the React and Tailwind CSS communities.

---

# How to run the project

## Clone

```
   git clone https://github.com/klasma-tech/MVP_demo.git
```

## Change directory

```
   cd MVP_demo
```

## Install dependencies

```
   npm install
```

## Run on localhost

```
   npm start
```
