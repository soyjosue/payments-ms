import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { envs } from 'src/config/envs';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripe.secret);
  private readonly logger = new Logger('PaymentsService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async createPaymentSession(dto: PaymentSessionDto) {
    const { currency, items, orderId } = dto;

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        },
      },
      line_items,
      mode: 'payment',
      success_url: envs.stripe.checkout.successUrl,
      cancel_url: envs.stripe.checkout.cancelUrl,
    });

    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
  }

  stripeWebhook(request: Request, response: Response) {
    const sig: string = request.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    const endpointSecret = envs.stripe.webhook.signingSecret;

    try {
      event = this.stripe.webhooks.constructEvent(
        request['rawBody'] as string,
        sig,
        endpointSecret,
      );
    } catch (err) {
      return response
        .status(400)
        .send(`Webhook Error: ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'charge.succeeded': {
        const chargeSucceeded = event.data.object;
        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata['orderId'],
          receiptUrl: chargeSucceeded.receipt_url,
        };

        this.client.emit('payment.succeeded', payload);

        break;
      }
      default:
        console.log(`Event ${event.type} not handled.`);
    }

    return response.status(200).json({ sig });
  }
}
