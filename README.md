
# BitFabric: Crypto Accelerator Widget Extension Service

Welcome to BitFabric, your next-generation crypto accelerator widget extension service. We provide a seamless layer for both Web 2.0 and Web 3.0 applications, enabling the hosting of crypto-commerce items and direct receipt of payments to a control wallet by the users of your services.

## What Can BitFabric Do For You?

With BitFabric deployed in your dApp using our Web 3.0 decentralized SDK, you and your users gain access to a myriad of accelerator features. Purchase and sell items with ease, and turn any dApp that deploys BitFabric into a potential marketplace. This empowers social creators to incubate interactions while BitFabric handles the heavy lifting.

We achieve this by distributing a user-friendly interface of utilities through a Web 3.0 CDN JS framework.

## Usage

To use SDK Name in your web application, follow these steps:

1. Include the following HTML markup in your document where you want to display the payment modal:
    ```html
        <div id="payment-modal"></div>
    ```

2. Add the following JavaScript code to your document, preferably inside a <script> tag or an external JavaScript file:

   ```javascript
   window.onload = function() {
    var modalElement = document.getElementById('payment-modal');
    ckPaySDK.PaymentComponent.renderPaymentModal(modalElement, { /* props go here */ });
}
```

Make sure to replace `{ /* props go here */ }` with the necessary configuration options for your payment component.

You can customize the SDK integration as per your application's requirements. Refer to the SDK documentation for detailed information on available configuration options and APIs.

## Sample HTML Integration

Here's an example of how you can integrate the SDK in a basic HTML page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SDK Name HTML Integration</title>
  <script src="https://cdkpay.dogeria.workers.dev/cdkPay.js"></script>
</head>
<body>
  <div id="payment-modal"></div>
  <script>
    window.onload = function() {
        var modalElement = document.getElementById('payment-modal');
        ckPaySDK.PaymentComponent.renderPaymentModal(modalElement, { /* props go here */ });
    }
  </script>
</body>
</html>
```

## Sample React Integration

Here's an example of how you can integrate the SDK in a React application:

1. Install the SDK package using npm or yarn:

   `BASH COMMANDS GO HERE`

2. Import the SDK into your React component:

  ```javascript
  import React from 'react'
import { createRoot } from 'react-dom/client'


window.onload = function () {
  ckPaySDK.PaymentComponent.initialize('payment-modal')
}

const App = () => {
  const handlePayment = () => {
    console.log('payment has been handle')
  }

  const startPaymentFlow = () => {
    ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
      console.log('Payment complete')
      // hide the modal when payment is done
      ckPaySDK.PaymentComponent.removePaymentModal()
    })
  }

  return (
    <div>
      <h1>hello world</h1>
      <button
        onClick={() => {
          ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
            ckPaySDK.PaymentComponent.removePaymentModal()
          })
        }}
      >
        Pay in BTC
      </button>
    </div>
  )
}

const container = document.getElementById('app')
const root = createRoot(container)
```
# BitFabric Extension Documentation

The BitFabric extension is a simple interface for adding items and profiles, purchasing items, and retrieving item details in a Web 3.0 marketplace. It simplifies the process by handling authentication and other backend tasks under the hood, allowing users to focus on frontend functionality.

## Data Types

### `Item`

An item represents a product in the marketplace. When creating a new item, an `Item` object must contain the following properties:

- `name`: (Text) The name of the item.
- `cost`: (Nat) The cost of the item in the marketplace.
- `available`: (Bool) Availability status of the item. If `true`, the item is available for purchase; if `false`, it's not.
- `category`: (Text) The category the item belongs to.

Example:

```javascript
let newItem = {
  name: "Test Item",
  cost: 500,
  available: true,
  category: "Electronics",
};
```

The merchant field representing the merchant who is adding the item is automatically added by BitFabric. This field contains the Principal ID of the user who is currently authenticated. The Principal ID is a unique identifier generated based on the domain where BitFabric is deployed. This ensures that each dapp using BitFabric has unique user identifiers.

Profile
A profile represents a user in the marketplace. When creating a new profile, a Profile object must contain the following properties:

profilePicture: (Blob) An optional property, representing the user's profile picture. It should be in the form of a binary data object.
name: (Text) The name of the user.
description: (Text) A description of the user.
Example:

```javascript
let newProfile = {
  profilePicture: "<Binary Data>",
  name: "John Doe",
  description: "A tech enthusiast",
};
```


API Methods
addItem(item)
Adds a new item to the marketplace.

Parameters:

item: (Item) An Item object representing the item to add to the marketplace.
Example:
```javascript
ckPaySDK.PaymentComponent.addItem(newItem);
```
addProfile(profile)

Adds a new user profile.

Parameters:

profile: (Profile) A Profile object representing the user profile to add.
Example:
```javascript
ckPaySDK.PaymentComponent.addProfile(newProfile);
```

buyItem(item)
Buys an item from the marketplace.

Parameters:

item: (Nat) The id of the item to purchase.
Example:
```javascript
ckPaySDK.PaymentComponent.buyItem(itemId);
```

getItem(item)
Retrieves an item's details from the marketplace.

Parameters:

item: (Nat) The id of the item to retrieve.
Example:
```javascript
ckPaySDK.PaymentComponent.getItem(itemId);
```


When BitFabric is deployed, it establishes a connection with your dapp and generates unique Principal IDs based on your domain. These Principal IDs are used to uniquely identify users in the system, allowing for safe and secure transactions.


Customizing BitFabric Payment Widget
The BitFabric payment widget provides a highly customizable interface for streamlining the payment flow. This document will guide you on how to use and customize the BitFabric widget in your application.

Here's an example of how to customize the widget:
```javascript
window.onload = function () {
  ckPaySDK.PaymentComponent.initialize('payment-modal', {
    cardColor: "#123456",
    gradientColor: "#789abc",
    primaryColor: '#abcdef',
    secondaryColor: '#ffffff',
    steps: [
      {
        type: 'login',
        title: 'Custom Login',
        data: {
          "type": "section",
          "props": {},
          "style": {},
          "children": [
            {
              "type": "h1",
              "props": {},
              "style": { "color": "green", "textAlign": "center" },
              "children": "Welcome Back!"
            },
            {
              "type": "p",
              "props": {},
              "style": { "color": "black", "fontSize": "18px" },
              "children": "We're glad to see you again. Let's make some magic happen!"
            }
          ]
        }
      },
      {
        type: 'confirmPaymentDetails',
        title: 'Confirm Payment Details',
        data: {
          "type": "section",
          "props": {},
          "children": [
            {
              "type": "h1",
              "props": {},
              "children": "Invoice"
            },
            {
              "type": "p",
              "props": {},
              "children": "Customer Name"
            },
            {
              "type": "p",
              "props": {},
              "children": "Product: 'Cool Product'"
            },
            {
              "type": "p",
              "props": {},
              "children": "Price: 0.00000100 BTC"
            }
          ]
        }
      }
    ],
  });
}
```
Here is a breakdown of the different customization options:

- `cardColor`: This defines the main color of the card.
- `gradientColor`: This defines the gradient color of the card.
- `primaryColor`: This defines the primary color of the texts and buttons.
- `secondaryColor`: This defines the secondary color of the texts and buttons.
- `steps`: This is an array that defines the steps of the payment flow. Each step is an object that has a `type`, `title`, and `data` property. `data` contains the content to be displayed on the step and can include nested elements.

In the example above, we have two steps: 'login' and 'confirmPaymentDetails'. Each step has a custom title and data.

The `type` field for the step is a string representing the type of the step. The `title` is the title for that particular step, and `data` is the contents of the step. In the `data`, you can specify a `type` (like 'section'), `props` for additional properties, `style` for the style of the section, and `children` for the nested elements inside the section.

With these options, you can customize the payment flow according to your application's requirements.

