/**
 * Enhanced Payment Flow Example
 * 
 * This example demonstrates how to use the new process_payment_request method
 * with transferFrom functionality, including token approval and coupon support.
 */

import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';

// Example user payment canister interface (simplified)
const userPaymentCanisterInterface = {
  "process_payment_request": ["update", [PaymentRequest], [PaymentResult]],
  "create_invoice": ["update", ["nat64", "text", "text", [["text", "text"]]], [InvoiceResult]],
  "get_supported_tokens": ["query", [], [TokenConfigArray]],
};

// Example token canister interface for ICRC-2 approve
const tokenCanisterInterface = {
  "icrc2_approve": ["update", [ApproveArgs], [ApproveResult]],
  "icrc1_balance_of": ["query", [Account], ["nat"]],
};

class EnhancedPaymentSDK {
  constructor(userPaymentCanisterId, agent) {
    this.userPaymentCanisterId = userPaymentCanisterId;
    this.agent = agent;
    this.userPaymentActor = Actor.createActor(userPaymentCanisterInterface, {
      agent,
      canisterId: userPaymentCanisterId,
    });
  }

  /**
   * Complete payment flow with transferFrom
   * 1. Create invoice
   * 2. Approve tokens to user payment canister
   * 3. Process payment with enhanced method
   */
  async processPaymentWithTransferFrom({
    amount,
    tokenSymbol,
    tokenCanisterId,
    description,
    couponCode = null,
    metadata = [],
  }) {
    try {
      console.log('🚀 Starting enhanced payment flow...');

      // Step 1: Create invoice
      console.log('📄 Creating invoice...');
      const invoiceResult = await this.userPaymentActor.create_invoice(
        amount,
        tokenSymbol,
        description,
        metadata
      );

      if ('Err' in invoiceResult) {
        throw new Error(`Failed to create invoice: ${invoiceResult.Err}`);
      }

      const invoice = invoiceResult.Ok;
      console.log('✅ Invoice created:', invoice.id);

      // Step 2: Get token fee for approval calculation
      const tokenActor = Actor.createActor(tokenCanisterInterface, {
        agent: this.agent,
        canisterId: tokenCanisterId,
      });

      // Calculate total amount needed (amount + token fee)
      const tokenFee = invoice.token.fee;
      const totalAmountNeeded = amount + tokenFee;

      console.log(`💰 Approving ${totalAmountNeeded} ${tokenSymbol} (${amount} + ${tokenFee} fee)...`);

      // Step 3: Approve tokens to user payment canister
      const approveArgs = {
        spender: {
          owner: Principal.fromText(this.userPaymentCanisterId),
          subaccount: [],
        },
        amount: totalAmountNeeded,
        fee: [tokenFee],
        memo: [],
        from_subaccount: [],
        created_at_time: [BigInt(Date.now() * 1000000)], // nanoseconds
        expires_at: [BigInt(Date.now() * 1000000) + BigInt(5 * 60 * 1000000000)], // 5 minutes
      };

      const approveResult = await tokenActor.icrc2_approve(approveArgs);
      
      if ('Err' in approveResult) {
        throw new Error(`Token approval failed: ${JSON.stringify(approveResult.Err)}`);
      }

      console.log('✅ Token approval successful, block index:', approveResult.Ok);

      // Step 4: Process payment with enhanced method
      console.log('💳 Processing payment...');
      const paymentRequest = {
        invoice_id: invoice.id,
        amount: amount,
        token_symbol: tokenSymbol,
        coupon_code: couponCode ? [couponCode] : [],
        metadata: metadata,
      };

      const paymentResult = await this.userPaymentActor.process_payment_request(paymentRequest);

      if ('Err' in paymentResult) {
        throw new Error(`Payment processing failed: ${paymentResult.Err}`);
      }

      const result = paymentResult.Ok;
      console.log('🎉 Payment successful!');
      console.log('📊 Payment Result:', {
        transactionId: result.transaction_id,
        amountPaid: result.amount_paid,
        discountApplied: result.discount_applied,
        finalAmount: result.final_amount,
        blockIndex: result.block_index,
        paymentMethod: result.payment_method,
      });

      return {
        success: true,
        invoice,
        paymentResult: result,
      };

    } catch (error) {
      console.error('❌ Payment failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get supported tokens from the user payment canister
   */
  async getSupportedTokens() {
    try {
      const tokens = await this.userPaymentActor.get_supported_tokens();
      return tokens.filter(token => token.is_active);
    } catch (error) {
      console.error('Failed to fetch supported tokens:', error);
      throw error;
    }
  }

  /**
   * Check user's token balance
   */
  async checkBalance(tokenCanisterId, userPrincipal) {
    try {
      const tokenActor = Actor.createActor(tokenCanisterInterface, {
        agent: this.agent,
        canisterId: tokenCanisterId,
      });

      const balance = await tokenActor.icrc1_balance_of({
        owner: userPrincipal,
        subaccount: [],
      });

      return balance;
    } catch (error) {
      console.error('Failed to check balance:', error);
      throw error;
    }
  }

  /**
   * Validate coupon before payment
   */
  async validateCoupon(couponCode, amount, tokenSymbol) {
    try {
      const result = await this.userPaymentActor.validate_and_use_coupon(
        couponCode,
        amount,
        tokenSymbol
      );

      if ('Err' in result) {
        return { valid: false, error: result.Err };
      }

      const [couponId, discountAmount] = result.Ok;
      return {
        valid: true,
        couponId,
        discountAmount,
        finalAmount: amount - discountAmount,
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// Usage example
async function exampleUsage() {
  const agent = new HttpAgent({ host: 'https://ic0.app' });
  const userPaymentCanisterId = 'your-user-payment-canister-id';
  
  const sdk = new EnhancedPaymentSDK(userPaymentCanisterId, agent);

  // Example payment
  const paymentParams = {
    amount: 1000000n, // 1 ICP in e8s
    tokenSymbol: 'ICP',
    tokenCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai', // ICP ledger
    description: 'Test payment with enhanced flow',
    couponCode: 'SAVE10', // Optional
    metadata: [
      ['order_id', '12345'],
      ['customer_id', 'user_67890'],
    ],
  };

  const result = await sdk.processPaymentWithTransferFrom(paymentParams);
  
  if (result.success) {
    console.log('Payment completed successfully!');
    console.log('Transaction ID:', result.paymentResult.transaction_id);
    
    if (result.paymentResult.discount_applied > 0) {
      console.log(`Coupon applied! Saved ${result.paymentResult.discount_applied} e8s`);
    }
  } else {
    console.error('Payment failed:', result.error);
  }
}

export { EnhancedPaymentSDK, exampleUsage };

/* 
Key improvements in this enhanced flow:

1. **transferFrom Integration**: Uses ICRC-2 approve + transferFrom pattern
2. **Automatic Fee Calculation**: Includes token transfer fees in approval
3. **Coupon Support**: Validates and applies discount coupons
4. **Enhanced Analytics**: Tracks payment methods and success rates
5. **Better Error Handling**: Detailed error messages for each step
6. **Metadata Support**: Rich transaction metadata for analytics
7. **Block Index Tracking**: Returns ledger block index for verification

The flow ensures:
- Users approve exact amount needed (payment + fees)
- Coupons are validated and applied before payment
- All analytics are properly tracked
- Transaction details are preserved with block indices
- Error handling at each step of the process
*/
