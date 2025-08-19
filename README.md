
# ckPayment - Stripe-Inspired Web3 Payment Infrastructure

> A comprehensive payment solution built on the Internet Computer (ICP) that brings the ease of Stripe to the Web3 world with complete subscription management, product catalogs, discount systems, and advanced analytics.

## 🚀 What is ckPayment?

ckPayment is a decentralized payment infrastructure that allows developers to integrate Web3 payments as easily as Stripe, but with the power of blockchain technology. It provides a complete suite of payment tools including:

- **One-time Payments** - Accept crypto payments with a simple SDK
- **Subscription Management** - Recurring billing with flexible intervals
- **Product Catalog** - Manage digital and physical products
- **Discount System** - Coupon codes and promotional campaigns
- **Analytics Dashboard** - Comprehensive payment analytics and insights
- **Modal Customization** - Fully customizable payment interfaces
- **Multi-token Support** - Accept multiple cryptocurrencies (ckBTC, ICRC tokens)

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│                     │    │                      │    │                     │
│   Frontend SDK      │───▶│  User Payment        │───▶│   Token Ledgers     │
│   (ckPay.js)        │    │  Canister (Rust)     │    │   (ckBTC, ICRC)     │
│                     │    │                      │    │                     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
           │                                                       ▲
           │                ┌──────────────────────┐              │
           └───────────────▶│                      │──────────────┘
                            │   Dashboard UI       │
                            │   (React + Vite)     │
                            │                      │
                            └──────────────────────┘
```

### Components:

1. **Frontend SDK** (`src/SDK/`) - JavaScript library for easy integration
2. **User Payment Canister** (`src/user_payment_canister/`) - Core Rust backend
3. **Dashboard UI** (`ckPayment-web3/`) - Management interface built with React
4. **Token Integration** - Support for ckBTC and ICRC token standards

## ✨ Key Features

### 💳 Payment Processing
- **Multiple Payment Methods**: Direct transfers, approved transfers, subscription billing
- **Multi-token Support**: ckBTC, ICRC-1/ICRC-2 compliant tokens
- **Automatic Fee Handling**: Configurable merchant fees and transaction fees
- **Invoice Management**: Create, track, and manage payment invoices

### 🔄 Subscription Management
- **Flexible Billing**: Daily, weekly, monthly, quarterly, yearly, or custom intervals
- **Trial Periods**: Optional trial periods for subscription plans
- **Automatic Billing**: Automated recurring payment processing
- **Subscription Analytics**: Track MRR, churn, and growth metrics
- **Plan Management**: Create and manage multiple subscription tiers

### 🛍️ Product Catalog
- **Digital & Physical Products**: Support for various product types
- **Inventory Management**: Track stock levels and availability
- **Category Organization**: Organize products by categories
- **Metadata Support**: Rich product information and custom attributes
- **Sales Analytics**: Track product performance and revenue

### 🎟️ Discount System
- **Flexible Coupons**: Percentage, fixed amount, or free shipping discounts
- **Usage Controls**: Limit usage count, expiration dates, minimum amounts
- **Token-Specific**: Apply discounts to specific cryptocurrencies
- **Usage Analytics**: Track coupon performance and redemption rates

### 📊 Analytics & Insights
- **Payment Analytics**: Success rates, transaction volumes, token preferences
- **Revenue Tracking**: Real-time revenue monitoring across all tokens
- **User Behavior**: Conversion rates, cart abandonment, payment preferences
- **Modal Performance**: Track the effectiveness of payment modals

### 🎨 Customization
- **Themeable Modals**: Custom colors, fonts, and branding
- **Redirect URLs**: Configure success/failure redirect flows
- **Webhook Support**: Real-time payment notifications
- **Embeddable Components**: Easy integration with existing websites

## 🛠️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- DFX SDK (latest version)
- Internet Computer wallet (Plug, Stoic, or Internet Identity)

### 1. Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ckPayment

# Install dependencies
npm install
cd ckPayment-web3 && npm install && cd ..

# Start local IC replica
dfx start --background --clean

# Deploy canisters locally
npm run deploy
```

### 2. Build the SDK

```bash
# Build the standalone SDK
cd ckPayment-web3
npm run build:sdk

# This creates the bundled SDK at dist/cdkPay.js
```

### 3. Basic Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Store - Crypto Payments</title>
  <script src="path/to/cdkPay.js"></script>
</head>
<body>
  <div id="payment-container"></div>
  <button onclick="startPayment()">Buy Now - $19.99</button>

  <script>
    // Initialize the payment system
    window.onload = function() {
      ckPaySDK.PaymentComponent.initialize('payment-container');
    };

    // Handle payment
    function startPayment() {
      ckPaySDK.PaymentComponent.renderPaymentModal({
        amount: 1999000000, // Amount in token's smallest unit (satoshis for ckBTC)
        token: 'ckBTC',
        description: 'Premium Subscription',
        metadata: {
          product_id: 'premium_plan',
          customer_email: 'user@example.com'
        }
      }, function(result) {
        if (result.success) {
          console.log('Payment successful!', result);
          window.location.href = '/success';
        } else {
          console.error('Payment failed:', result.error);
        }
      });
    }
  </script>
</body>
</html>
```

## 📚 Advanced Usage

### Subscription Integration

```javascript
// Create a subscription
ckPaySDK.SubscriptionComponent.createSubscription({
  planId: 'premium_monthly',
  customerData: {
    email: 'customer@example.com',
    name: 'John Doe'
  },
  trialDays: 14
}, function(result) {
  console.log('Subscription created:', result);
});
```

### Product Catalog

```javascript
// Display product catalog
ckPaySDK.ProductComponent.renderCatalog({
  containerId: 'product-grid',
  category: 'digital',
  token: 'ckBTC',
  theme: {
    primaryColor: '#007bff',
    backgroundColor: '#ffffff'
  }
});
```

### Coupon System

```javascript
// Apply a discount coupon
ckPaySDK.CouponComponent.applyCoupon({
  code: 'SAVE20',
  amount: 10000000, // Original amount
  token: 'ckBTC'
}, function(discount) {
  console.log('Discount applied:', discount);
});
```

## 🚀 Deployment

### Local Testing
```bash
# Start local replica
dfx start --background

# Deploy all canisters
npm run deploy

# Start development server
cd ckPayment-web3
npm run dev
```

### Production Deployment
```bash
# Deploy to Internet Computer mainnet
npm run deploy:payment_app-ic

# Deploy frontend only
npm run deploy:frontend_app-ic
```

## 🔧 Configuration

### Canister Configuration
```rust
// Example user canister configuration
UserCanisterConfig {
    name: "My Store".to_string(),
    description: "Premium digital products".to_string(),
    merchant_fee: 250, // 2.5% fee
    auto_withdraw: true,
    withdraw_threshold: Some(1000000000), // 0.01 ckBTC
    supported_tokens: vec![
        TokenConfig {
            symbol: "ckBTC".to_string(),
            name: "Chain Key Bitcoin".to_string(),
            canister_id: Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").unwrap(),
            decimals: 8,
            fee: 10,
            is_active: true,
            logo: Some("https://example.com/ckbtc-logo.png".to_string())
        }
    ],
    webhook: Some("https://mystore.com/webhook".to_string()),
    custom_settings: vec![]
}
```

### Modal Themes
```javascript
const customTheme = {
  primary_color: '#6366f1',
  background_color: '#ffffff',
  text_color: '#1f2937',
  border_radius: 12,
  font_family: 'Inter, sans-serif'
};
```

## 📖 API Reference

### Core SDK Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `initialize(containerId)` | Initialize payment system | Container DOM ID |
| `renderPaymentModal(config, callback)` | Show payment modal | Payment config, callback |
| `createInvoice(data)` | Create payment invoice | Invoice data |
| `processPayment(invoiceId)` | Process payment | Invoice ID |
| `getBalance(token)` | Get token balance | Token symbol |
| `getTransactionHistory()` | Get payment history | Pagination params |

### Subscription Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `createSubscription(planId, metadata)` | Create new subscription | Plan ID, metadata |
| `cancelSubscription(subscriptionId)` | Cancel subscription | Subscription ID |
| `pauseSubscription(subscriptionId)` | Pause subscription | Subscription ID |
| `resumeSubscription(subscriptionId)` | Resume subscription | Subscription ID |
| `getSubscriptionStatus(subscriptionId)` | Get subscription status | Subscription ID |

### Product Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `createProduct(productData)` | Create new product | Product data |
| `updateProduct(productId, data)` | Update product | Product ID, data |
| `getProduct(productId)` | Get product details | Product ID |
| `listProducts(filters)` | List products | Filter criteria |

## 📊 Dashboard Features

The management dashboard provides:

- **Payment Overview**: Real-time payment statistics and trends
- **Subscription Management**: Create, edit, and monitor subscription plans
- **Product Catalog**: Manage your product inventory and pricing
- **Discount Campaigns**: Create and track coupon performance
- **Analytics**: Detailed insights into customer behavior and revenue
- **Settings**: Configure payment options, tokens, and webhooks

## 🔒 Security Features

- **Canister-based Security**: Leverages Internet Computer's security model
- **Principal-based Authentication**: Secure user identification
- **Automatic Token Validation**: Built-in checks for token transfers
- **Rate Limiting**: Protection against spam and abuse
- **Audit Trails**: Complete transaction history and logging

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone <repo-url>
cd ckPayment
npm install
cd ckPayment-web3 && npm install
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Full API Documentation](https://docs.ckpayment.com)
- **Discord**: Join our [Discord server](https://discord.gg/ckpayment)
- **GitHub Issues**: Report bugs and request features
- **Email**: support@ckpayment.com

## 🚗 Roadmap

- [ ] **ICRC Faucet Integration** - Simplified token distribution for testing
- [ ] **Enhanced Analytics** - Advanced reporting and insights
- [ ] **Mobile SDK** - React Native integration
- [ ] **Multi-chain Support** - Bitcoin, Ethereum bridges
- [ ] **Advanced Subscription Features** - Usage-based billing, metered plans
- [ ] **Marketplace Integration** - White-label marketplace solution

---

**Built with ❤️ for the Internet Computer ecosystem**

