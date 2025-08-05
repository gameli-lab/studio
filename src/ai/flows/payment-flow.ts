
'use server';
/**
 * @fileOverview A server-side flow for handling Paystack payments.
 * 
 * - initializeTransaction - A function to securely initialize a payment with Paystack.
 * - InitializeTransactionInput - The input type for the initializeTransaction function.
 * - InitializeTransactionOutput - The return type for the initializeTransaction function.
 */

import { z } from 'zod';

const InitializeTransactionInputSchema = z.object({
  email: z.string().email(),
  amount: z.number(),
});
export type InitializeTransactionInput = z.infer<typeof InitializeTransactionInputSchema>;

const InitializeTransactionOutputSchema = z.object({
  status: z.boolean(),
  message: z.string(),
  access_code: z.string().optional(),
  reference: z.string().optional(),
});
export type InitializeTransactionOutput = z.infer<typeof InitializeTransactionOutputSchema>;

export async function initializeTransaction(input: InitializeTransactionInput): Promise<InitializeTransactionOutput> {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('Paystack secret key is not configured on the server.');
  }

  const params = {
    email: input.email,
    amount: input.amount * 100, // Amount in kobo
  };

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      throw new Error(result.message || 'Failed to initialize Paystack transaction.');
    }

    return {
      status: true,
      message: result.message,
      access_code: result.data.access_code,
      reference: result.data.reference,
    };
  } catch (error: any) {
    console.error('Paystack initialization error:', error);
    throw new Error(error.message || 'An unexpected error occurred during payment initialization.');
  }
}

    