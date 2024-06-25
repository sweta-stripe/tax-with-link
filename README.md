# Link

This sample shows how to integrate Link which allows your customers
to check out faster using a one-time-code.

Features:

- 🔐Authentication Element
- 📦Shipping Address Element
- 🍪Merchant domain cookies


## How to run locally
You will need a Stripe account in order to run the demo. Once you set up your
account, go to the Stripe [developer
dashboard](https://stripe.com/docs/development#api-keys) to find your API keys 
and copy the values in [.env](server/.env)

```bash
STRIPE_PUBLISHABLE_KEY=<replace-with-your-publishable-key>
STRIPE_SECRET_KEY=<replace-with-your-secret-key>
```

`STATIC_DIR` tells the server where to the client files are located and does not need to be modified unless you move the server files.

**2. Follow the server and client instructions on how to run:**

Follow the instructions in the 
* server folder [README](./server/README.md) on how to run.
* client folder [README](./client/README.md) on how to run.
