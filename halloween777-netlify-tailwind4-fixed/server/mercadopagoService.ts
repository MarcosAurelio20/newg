import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.warn('MERCADOPAGO_ACCESS_TOKEN not set. PIX payments will not work.');
}

const client = new MercadoPagoConfig({
  accessToken: accessToken || '',
});

const payment = new Payment(client);
const preference = new Preference(client);

/**
 * Create a payment preference for Checkout Pro
 * @param amount Amount in BRL (1 real = 1 credit)
 * @param userPhone User phone number for identification
 * @param userId User ID
 * @returns Preference ID for Checkout Pro
 */
export async function createPaymentPreference(amount: number, userPhone: string, userId: number) {
  try {
    const preferenceData = {
      items: [
        {
          id: `credits_${amount}`,
          title: `Recarga de ${amount} créditos`,
          description: 'Halloween777 - Créditos para jogos',
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: `user${userId}@halloween777.com`,
        name: userPhone,
      },
      back_urls: {
        success: `${process.env.VITE_APP_URL || 'https://3000-igb6x0ouc4to5louuqhe6-f6b0fc0e.manusvm.computer'}/recharge?status=success`,
        failure: `${process.env.VITE_APP_URL || 'https://3000-igb6x0ouc4to5louuqhe6-f6b0fc0e.manusvm.computer'}/recharge?status=failure`,
        pending: `${process.env.VITE_APP_URL || 'https://3000-igb6x0ouc4to5louuqhe6-f6b0fc0e.manusvm.computer'}/recharge?status=pending`,
      },
      auto_return: 'approved' as const,
      external_reference: `user_${userId}_${Date.now()}`,
      statement_descriptor: 'HALLOWEEN777',
    };

    const response = await preference.create({ body: preferenceData });

    return {
      id: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    };
  } catch (error: any) {
    console.error('Error creating payment preference:', error);
    throw new Error(error.message || 'Failed to create payment preference');
  }
}

/**
 * Get payment status
 * @param paymentId Mercado Pago payment ID
 * @returns Payment status
 */
export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await payment.get({ id: paymentId });
    return {
      id: response.id,
      status: response.status,
      statusDetail: response.status_detail,
      transactionAmount: response.transaction_amount,
    };
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    throw new Error(error.message || 'Failed to get payment status');
  }
}
