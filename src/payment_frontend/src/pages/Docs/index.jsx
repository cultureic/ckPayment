import React from 'react'
import styled from 'styled-components'

// Styled Components
const DocsContainer = styled.div`
    background-color: var(--background);
    color: var(--primary-dark);
    padding: 20px;
`;

const CodeBlock = styled.code`
    display: block;
    background-color: var(--primary-light);
    color: var(--primary-dark);
    padding: 10px;
    margin: 10px 0;
    white-space: pre-wrap;
`;

const SampleTitle = styled.h3`
    color: var(--primary-dark);
`;

// React component
const Docs = () => (
    <DocsContainer>
        <h2>SDK Name Integration Docs</h2>

        <h3>Usage</h3>
        <p>Include the following HTML markup in your document where you want to display the payment modal:</p>
        <CodeBlock>{'<div id="payment-modal"></div>'}</CodeBlock>

        <p>Add the following JavaScript code to your document, preferably inside a &lt;script&gt; tag or an external JavaScript file:</p>
        <CodeBlock>
            {`window.onload = function() {
    var modalElement = document.getElementById('payment-modal');
    ckPaySDK.PaymentComponent.renderPaymentModal(modalElement, { /* props go here */ });
}`}</CodeBlock>

        <h3>HTML Integration</h3>
        <p>Here's an example of how you can integrate the SDK in a basic HTML page:</p>
        <CodeBlock>
{` <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SDK Name HTML Integration</title>
  <script src="https://pvs2s-tiaaa-aaaap-qbiia-cai.icp0.io/cdkPay.js"></script>
</head>
<body>
  <div id="payment-modal"></div>
  <button onclick="startPaymentFlow()">Start Payment</button>
  <script>
    const startPaymentFlow = () => {
      ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
        console.log('Payment complete');
        // hide the modal when payment is done
        ckPaySDK.PaymentComponent.removePaymentModal();
      });
    };

    window.onload = function() {
      ckPaySDK.PaymentComponent.initialize('payment-modal', {
        cardColor: "#123456",
        gradientColor: "#789abc",
        primaryColor: '#abcdef',
        secondaryColor: '#ffffff',
        steps: [
          {
            type: 'login',
            title: 'Custom Login',
            data: { /* Custom data / }
          },
          {
            type: 'confirmPaymentDetails',
            title: 'Confirm Payment Details',
            data: { / Custom data */ }
          }
        ],
      });
    };
  </script>
</body>
</html>`}
        </CodeBlock>

        <h3>React Integration</h3>
        <p>Here's an example of how you can integrate the SDK in a React application:</p>
        <CodeBlock>
{`import React from 'react'

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
        data: { /* Custom data */ }
      },
      {
        type: 'confirmPaymentDetails',
        title: 'Confirm Payment Details',
        data: { /* Custom data */ }
      }
    ],
  });
}}

const App = () => {
    const handlePayment = () => {
        console.log('payment has been handled')
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
            <h1>Hello world</h1>
            <button
                onClick={() => {
                    startPaymentFlow()
                }}
            >
                Pay in BTC
            </button>
        </div>
    )
}

export default App`}
        </CodeBlock>
    </DocsContainer>
)

export default Docs;
