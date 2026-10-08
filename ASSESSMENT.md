# RentVerse assessment

This document describes the work added to the existing RentVerse frontend, the user flow, and the answers to the assessment questions.

Source project: https://github.com/salman319/test-demo-by-salman

The original app had a working UI and no real wallet login or smart-contract API. Those two pieces are now in the project.

## What was built

1. **Wallet login on the first page.** The **Connect** button opens MetaMask, asks the visitor to sign a login message, and the API turns a valid signature into a session. The signature is not a transaction and does not cost gas.
2. **WalletConnect, through wagmi.** The same modal includes WalletConnect via wagmi and `@walletconnect/ethereum-provider`. It needs a project id from https://cloud.reown.com in `REACT_APP_WALLETCONNECT_PROJECT_ID`.
3. **Smart-contract API.** A new API under `api/` reads chain data and prepares contract calls. The browser never sends a private key. The wallet signs writes.
4. **Invest action.** On a property page, **Invest 1 share** asks the API to encode `invest` on `PropertyShares`. wagmi sends that transaction only after a deployed contract address is configured.

A hidden remote-execution block in the old unused server controller was removed before this API was added, so starting the app does not download or run outside code.

## How to run

```bash
cp api/.env.example api/.env
npm install --legacy-peer-deps
npm start
```

- Site: http://localhost:3000
- API: http://localhost:4000
- Health check: http://localhost:4000/api/v1/health

Do not open `http://localhost:4000/api/v1/auth/verify` directly in the address bar. A normal browser visit is a GET. Login uses POST from the **Connect** button.

## Flow

```text
Visitor clicks Connect
        |
        v
MetaMask connects the account
        |
        v
API creates a one-time login message   POST /api/v1/auth/nonce
        |
        v
Visitor signs that message in MetaMask
        |
        v
API checks the signature and returns a session   POST /api/v1/auth/verify
        |
        v
Home page shows the address and reads balances through the API
        |
        v
On a property, Invest 1 share asks the API to encode the contract call
        |
        v
If PROPERTY_SHARES_ADDRESS is set, wagmi asks MetaMask to send the transaction
If it is empty, the call is prepared and not broadcast
```

### Steps to test login

1. Refresh http://localhost:3000. If an old service worker is still active, open DevTools, go to Application, then Service Workers, click Unregister, and refresh again.
2. Unlock MetaMask and select the account to use.
3. Click **Connect** on the home page.
4. Click **MetaMask** and approve the connection.
5. Sign the login message. This is a signature, not a transaction.
6. The navbar changes from **Connect** to the account address.
7. The home page shows **Signed in**, with the wallet balance and a USDC balance read by the API.

If the signature popup is closed, the wallet stays connected but the visitor is not logged in. Open **Connect** again and click **Sign in to RentVerse**.

### Steps to test the contract action

1. Sign in with the steps above.
2. Open **Properties**, then open any property.
3. Click **Invest 1 share**.
4. With the current empty `PROPERTY_SHARES_ADDRESS`, the page explains that the calldata was prepared and the transaction was not sent.
5. After a real `PropertyShares` deployment, set the address, restart the API, and click the button again. MetaMask then asks to confirm the transaction.

## Question 1. Wallet connection

**Question:** The **Connect** button on the first page should log a visitor in with MetaMask. If it is already implemented, suggest a better update.

**Answer:** It was only partly implemented, and that version was not a real login.

The old button stored an address in `localStorage` and, when MetaMask was missing, connected a hard-coded demo address with a fake balance. It never asked the visitor to sign anything, so the platform could not prove the visitor controls the wallet.

The update:

- **Connect** uses wagmi’s injected MetaMask connector.
- After the account is connected, the app requests a one-time message from `POST /api/v1/auth/nonce`.
- MetaMask signs that message. No transaction is sent.
- `POST /api/v1/auth/verify` recovers the signer with viem. If the signer matches the address and the nonce is still valid, the API returns a session token.
- The navbar and home page treat the visitor as logged in only when that session matches the connected address.
- Logging out clears the session and disconnects the wallet.

WalletConnect is available in the same modal for mobile wallets and a QR code. MetaMask remains the recommended path because it does not need a third-party project id.

Further improvements, if this moved toward production:

- Use Sign-In with Ethereum (EIP-4361) so the login message has a standard domain, nonce, and expiry format.
- Store sessions in httpOnly cookies instead of `localStorage`.
- Add wallet switching: if the visitor changes accounts in MetaMask, require a new signature.
- Gate property investment and profile pages on the session, which the invest button already does.

## Question 2. New API

**Question:** Add an API that is the backend layer for smart contracts. The interest is the structure, the architecture, and how it stays scalable and maintainable. It does not need every production feature.

**Answer:** The API is a separate service in `api/`. The old e-commerce server is not the contract layer. The frontend keeps the UI. wagmi sends transactions. The API reads the chain and prepares calls.

### Architecture

```text
React UI  --wagmi-->  MetaMask / WalletConnect
    |                         |
    |  login + reads          |  signed transaction
    v                         v
Express API  --viem-->  chain RPC (Ethereum, Sepolia, Polygon, Base)
    |
    +-- auth        nonce, signature check, session
    +-- chains      supported networks and native balance
    +-- contracts   registry, read, encode, events
```

The API does not hold private keys and does not broadcast investment transactions. That keeps key handling in the visitor’s wallet. The server can still read public chain state for every visitor, including visitors who are on a different network than the contract.

### Layout

| Path | Responsibility |
| --- | --- |
| `api/src/app.js` | HTTP app, CORS, route mounting |
| `api/src/routes/` | Auth, chain, and contract endpoints |
| `api/src/services/` | Login challenges, RPC clients, contract reads and calldata |
| `api/src/config/contracts.js` | Contract registry |
| `api/src/abi/` | ABIs kept next to the registry |
| `contracts/PropertyShares.sol` | Example share contract the invest action encodes |

A new contract is a registry entry: id, chain, address, and ABI. It does not need a new route. `usdc` is a live Ethereum mainnet read, so the read path can be demonstrated before any custom contract is deployed. `property-shares` matches `PropertyShares.sol`.

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/health` | Process is up |
| POST | `/api/v1/auth/nonce` | Create a one-time login message |
| POST | `/api/v1/auth/verify` | Check the signature and return a session |
| GET | `/api/v1/auth/me` | Address for the current session |
| GET | `/api/v1/chains` | Configured chains |
| GET | `/api/v1/chains/balance/:address` | Native balance |
| GET | `/api/v1/contracts` | Registry without forcing the client to know addresses |
| GET | `/api/v1/contracts/:id` | One contract, including its ABI |
| POST | `/api/v1/contracts/:id/read` | Call a view function |
| POST | `/api/v1/contracts/:id/encode` | Build calldata for the wallet. Requires a session |
| GET | `/api/v1/contracts/:id/events` | Event scan limited to 2,000 blocks |

Reads are public. Encoding a state-changing call requires the wallet session, so anonymous clients cannot ask the API to prepare investment transactions.

### Scalability and maintenance

- RPC clients are created once per chain and reused.
- View and write functions are checked against the ABI, so a caller cannot pass an arbitrary function name.
- Event queries require `fromBlock` and reject ranges larger than 2,000 blocks, which keeps a public log endpoint from scanning the whole chain.
- Login nonces expire after 5 minutes, are single-use, and login routes are rate-limited. The store is in memory, which is enough for one API process. More than one process should use Redis for nonces and rate limits.
- Bigints from the chain are serialized to strings so JSON responses stay stable.
- Errors use one shape: `{ success, error: { code, message } }`.
- Chain URLs and the property contract address come from `api/.env`, so environments change without code changes.

## Why Invest 1 share does not open MetaMask yet

This is expected with the current configuration.

`PROPERTY_SHARES_ADDRESS` in `api/.env` is empty. The API can still encode the `invest` function, but it returns `readyToSend: false` and no `to` address, because there is no deployed contract to send the transaction to. The property page stops there and shows that the calldata was prepared.

`contracts/PropertyShares.sol` is source code only until it is deployed. `contracts/RealEstate.sol` is a separate NFT contract and is not the contract this button calls.

To broadcast the transaction:

1. Deploy `contracts/PropertyShares.sol` to a test network such as Sepolia.
2. Set the deployed address in `api/.env`:

```bash
PROPERTY_SHARES_ADDRESS=0xYourDeployedAddress
PROPERTY_SHARES_CHAIN_ID=11155111
```

3. Restart the API.
4. Sign in, open a property, and click **Invest 1 share**.
5. If MetaMask is on another network, wagmi asks to switch, then asks to confirm the transaction.

## Video checklist

Record this sequence for review:

1. Start the app and show the home page.
2. Click **Connect**, approve MetaMask, and sign the login message.
3. Show the address in the navbar and the **Signed in** balances.
4. Open a property and click **Invest 1 share**.
5. Show the prepared-call message, and explain that a deployed `PROPERTY_SHARES_ADDRESS` is what makes MetaMask open the transaction.
