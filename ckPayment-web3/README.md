
# ckPayment Web3 Gateway

<div align="center">

![ckPayment Logo](https://via.placeholder.com/200x80/6366f1/ffffff?text=ckPayment)

**The Future of Web3 Payments on Internet Computer**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Internet Computer](https://img.shields.io/badge/Internet_Computer-29ABE2?logo=internetcomputer&logoColor=white)](https://internetcomputer.org/)

[🚀 Live Demo](https://ckpayment.com) • [📚 Documentation](https://docs.ckpayment.com) • [💬 Community](https://discord.gg/ckpayment)

</div>

## 🌟 Overview

ckPayment is a next-generation Web3 payment gateway built on the Internet Computer Protocol (ICP). We provide seamless, secure, and lightning-fast payment solutions for modern applications, bridging the gap between traditional finance and decentralized ecosystems.

### ✨ Key Features

- **⚡ Lightning Fast**: Sub-second transaction processing with minimal fees
- **🔒 Enterprise Security**: Military-grade security with multi-layer protection
- **🌍 Global Reach**: Available in 200+ countries with multi-currency support
- **👨‍💻 Developer First**: Simple integration with comprehensive documentation
- **📱 Mobile Optimized**: Perfect experience across all devices
- **🔗 Blockchain Native**: Built on Internet Computer for true decentralization

## 🚀 Quick Start

Get started with ckPayment in just a few minutes:

### 1. Installation

```bash
npm install @ckpayment/sdk
```

### 2. Basic Integration

```javascript
import { ckPayment } from '@ckpayment/sdk';

// Initialize ckPayment
const payment = ckPayment.init({
  apiKey: 'your-api-key',
  network: 'mainnet' // or 'testnet'
});

// Create a payment
const checkout = await payment.createCheckout({
  amount: 100,
  currency: 'ICP',
  description: 'Premium subscription'
});

// Redirect to checkout
window.location.href = checkout.url;
```

### 3. React Integration

```jsx
import { PaymentButton } from '@ckpayment/react';

function App() {
  return (
    <PaymentButton
      amount={100}
      currency="ICP"
      onSuccess={(payment) => {
        console.log('Payment successful:', payment);
      }}
    />
  );
}
```

## 🏗️ Project Structure

This repository contains the marketing website and developer portal for ckPayment:

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Navbar.tsx      # Navigation component
│   ├── Footer.tsx      # Footer component
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx       # Landing page
│   ├── Features.tsx    # Features showcase
│   ├── StartBuilding.tsx # Developer onboarding
│   └── ...
├── lib/                # Utility functions
└── styles/             # Global styles
```

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ckpayment-web3-gateway.git
   cd ckpayment-web3-gateway
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Query

## 📖 Integration Examples

### HTML/Vanilla JS

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.ckpayment.com/sdk/v1/ckpay.js"></script>
</head>
<body>
  <div id="payment-button"></div>
  
  <script>
    ckPayment.init({ apiKey: 'your-api-key' });
    ckPayment.renderButton('#payment-button', {
      amount: 100,
      currency: 'ICP'
    });
  </script>
</body>
</html>
```

### Next.js

```jsx
import { useEffect } from 'react';
import { ckPayment } from '@ckpayment/sdk';

export default function CheckoutPage() {
  useEffect(() => {
    ckPayment.init({ apiKey: process.env.NEXT_PUBLIC_CKPAY_API_KEY });
  }, []);

  const handlePayment = async () => {
    const checkout = await ckPayment.createCheckout({
      amount: 100,
      currency: 'ICP',
      successUrl: '/success',
      cancelUrl: '/cancel'
    });
    
    window.location.href = checkout.url;
  };

  return (
    <button onClick={handlePayment}>
      Pay with ckPayment
    </button>
  );
}
```

### Vue.js

```vue
<template>
  <button @click="handlePayment">Pay with ckPayment</button>
</template>

<script>
import { ckPayment } from '@ckpayment/sdk';

export default {
  mounted() {
    ckPayment.init({ apiKey: 'your-api-key' });
  },
  methods: {
    async handlePayment() {
      const checkout = await ckPayment.createCheckout({
        amount: 100,
        currency: 'ICP'
      });
      window.location.href = checkout.url;
    }
  }
}
</script>
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_CKPAY_API_KEY=your_api_key_here
VITE_CKPAY_NETWORK=mainnet
VITE_APP_URL=http://localhost:5173
```

### API Configuration

```javascript
const payment = ckPayment.init({
  apiKey: 'your-api-key',
  network: 'mainnet', // 'mainnet' or 'testnet'
  webhookUrl: 'https://yourapp.com/webhook',
  successUrl: 'https://yourapp.com/success',
  cancelUrl: 'https://yourapp.com/cancel'
});
```

## 🌐 Supported Networks & Currencies

### Networks
- **Mainnet**: Production Internet Computer network
- **Testnet**: Development and testing environment

### Supported Cryptocurrencies
- **ICP** - Internet Computer Protocol
- **ckBTC** - Chain-key Bitcoin
- **ckETH** - Chain-key Ethereum
- **USDC** - USD Coin (coming soon)

## 📚 API Reference

### Core Methods

#### `ckPayment.init(config)`
Initialize the ckPayment SDK.

**Parameters:**
- `config.apiKey` (string): Your API key
- `config.network` (string): 'mainnet' or 'testnet'

#### `ckPayment.createCheckout(options)`
Create a new payment checkout session.

**Parameters:**
- `options.amount` (number): Payment amount
- `options.currency` (string): Currency code
- `options.description` (string): Payment description
- `options.successUrl` (string): Success redirect URL
- `options.cancelUrl` (string): Cancel redirect URL

**Returns:** Promise<CheckoutSession>

### Webhook Events

```javascript
// Handle webhook events
app.post('/webhook', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'payment.completed':
      // Handle successful payment
      console.log('Payment completed:', event.data);
      break;
    case 'payment.failed':
      // Handle failed payment
      console.log('Payment failed:', event.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

## 🔒 Security

- **End-to-end encryption** for all transactions
- **Multi-signature wallets** for enhanced security
- **Regular security audits** by third-party firms
- **Bug bounty program** for responsible disclosure
- **PCI DSS Level 1** compliance (coming soon)

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.ckpayment.com](https://docs.ckpayment.com)
- **Discord Community**: [Join our Discord](https://discord.gg/ckpayment)
- **Email Support**: support@ckpayment.com
- **GitHub Issues**: [Report bugs](https://github.com/your-org/ckpayment-web3-gateway/issues)

## 🗺️ Roadmap

- [x] Core payment processing
- [x] React SDK
- [x] Developer portal
- [ ] Mobile SDKs (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Multi-chain support
- [ ] Subscription management
- [ ] Marketplace features

## 📊 Stats

- **99.9%** Uptime
- **<1s** Transaction speed
- **200+** Countries supported
- **50K+** Developers using ckPayment

---

<div align="center">

**Built with ❤️ on the Internet Computer**

[Website](https://ckpayment.com) • [Twitter](https://twitter.com/ckpayment) • [LinkedIn](https://linkedin.com/company/ckpayment) • [GitHub](https://github.com/ckpayment)

</div>

