import React from 'react'
import { createRoot } from 'react-dom/client'

let PaymentModule

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

root.render(<App />)
