







export const paymentAPI = {
  
  createPaymentIntent: async (amount, currency = 'usd', metadata = {}) => {
    try {
      console.log('💰 Creating demo payment intent:', { amount, currency, metadata });
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
      return {
        success: true,
        clientSecret: `pi_demo_${Date.now()}`,
        paymentIntentId: `pi_demo_${Date.now()}`,
        amount: amount,
        currency: currency,
        status: 'requires_payment_method'
      };
    } catch (error) {
      console.error('❌ Demo payment intent creation failed:', error);
      throw new Error('Failed to create payment intent');
    }
  },

  
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    try {
      console.log('✅ Confirming demo payment:', { paymentIntentId, paymentMethodId });
      
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      
      return {
        success: true,
        paymentIntentId: paymentIntentId,
        status: 'succeeded',
        amount: 1000, 
        currency: 'usd'
      };
    } catch (error) {
      console.error('❌ Demo payment confirmation failed:', error);
      throw new Error('Payment confirmation failed');
    }
  },

  
  getPaymentHistory: async (userId) => {
    try {
      console.log('📊 Getting demo payment history for user:', userId);
      
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      
      return {
        success: true,
        payments: [
          {
            id: 'pi_demo_1',
            amount: 5000,
            currency: 'usd',
            status: 'succeeded',
            created: new Date(Date.now() - 86400000).toISOString(), 
            description: 'Property Investment - Demo Property 1'
          },
          {
            id: 'pi_demo_2',
            amount: 2500,
            currency: 'usd',
            status: 'succeeded',
            created: new Date(Date.now() - 172800000).toISOString(), 
            description: 'Property Investment - Demo Property 2'
          }
        ]
      };
    } catch (error) {
      console.error('❌ Demo payment history failed:', error);
      throw new Error('Failed to get payment history');
    }
  }
};

export default paymentAPI;
