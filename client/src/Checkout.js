import {useState, useEffect} from 'react';
import {loadStripe} from "@stripe/stripe-js";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { json } from 'react-router-dom';
  

const PaymentForm = ({lineItems, initialAmount}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [messages, setMessages] = useState('');
  const [addressState, setAddressState] = useState(null);
  const [amount, setAmount] = useState(initialAmount);
  const [clientSecret, setClientSecret] = useState(null);

  const [loading, setLoading] = useState(false);
  const subtotal = lineItems.map((lineItem) => lineItem.priceInCents * lineItem.quantity).reduce((acc, price) => acc + price, 0);

  const handleError = (error) => {
    setLoading(false);
    setMessages(error.message);
  }

  const calculateTotalWithTax = (lineItems, address) => {
    console.log("lineItems", lineItems);
    console.log("address", address);

    const taxRate = parseFloat(Math.random().toFixed(2));
    const subtotal = lineItems.reduce((acc, lineItem) => {
      return acc + lineItem.priceInCents * lineItem.quantity;
    }, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return total;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages(`${messages}<br />Submitting payment...`);

    if (!stripe) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    // Trigger form validation and wallet collection
    const {error: submitError} = await elements.submit();
    if (submitError) {
      handleError(submitError);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret
    const res = await fetch("/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amount}),
    }).then((res) => res.json())
    .then(({clientSecret}) => {
      setLoading(false)
      const {error} = stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: "http://localhost:3000/success",
        },
      });
  
      if (error) {
        handleError(error);
      } else {
        // Your customer is redirected to your `return_url`. For some payment
        // methods like iDEAL, your customer is redirected to an intermediate
        // site first to authorize the payment, then redirected to the `return_url`.
      }
    });
  };

  return (
    <div className="sr-root">
      <div className="sr-main">
        <h3 id="lineItems">
          {lineItems.map((lineItem, index) => (
            <div key={index}>
              {lineItem.quantity}x {lineItem.name} = ${(lineItem.priceInCents / 100).toFixed(2)}
            </div>
          ))}
        </h3>
        <h3>Subtotal: ${(subtotal/100).toFixed(2)}</h3>
        <h3>Total (including tax): ${(amount/100).toFixed(2)}</h3>
        <h1>Accept a payment</h1>

        <form onSubmit={handleSubmit}>
          <h3>Contact info</h3>
          <LinkAuthenticationElement
            // Access the email value like so:
            // onChange={(event) => {
            //  setEmail(event.value.email);
            // }}
            //
            // Prefill the email field like so:
            // options={{defaultValues: {email: 'foo@bar.com'}}}
          />

          <h3>Billing address</h3>
          <AddressElement
            options={{mode: 'billing'}}

            // Access the address like so:
            onChange={(event) => {
              setAddressState(event.value);
              let totalWithTax = calculateTotalWithTax(lineItems, addressState);
              setAmount(totalWithTax);
            }}
          />

          <h3>Payment</h3>
          <PaymentElement />
          <button type="submit" disabled={!stripe || loading}>Pay</button>
        </form>

        <div id="messages">
          {messages}
        </div>
      </div>
    </div>
  );
}

// Customize the appearance of Elements using the Appearance API.
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#ed5f74',
    borderRadius: '20px',
    fontFamily: '--body-font-family: -apple-system, BlinkMacSystemFont, sans-serif',
    colorBackground: '#fafafa',
  },
};

const Checkout = ({stripePromise}) => {
  const [amount, setAmount] = useState(null);
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    setLineItems([
      {name: 'Coffee', priceInCents: 400, quantity: 1},
      {name: 'Cookie', priceInCents: 300, quantity: 1},
    ]);
    setAmount(lineItems.map((lineItem) => lineItem.priceInCents * lineItem.quantity).reduce((acc, price) => acc + price, 0));
  }, []);
  const options = {
    mode: 'payment',
    amount: lineItems.map((lineItem) => lineItem.priceInCents * lineItem.quantity).reduce((acc, price) => acc + price, 0),
    currency: 'usd',
    // Fully customizable with appearance API.
    appearance: appearance,
  };

    return (
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm lineItems={lineItems} amount={amount} />
      </Elements>
    )
};

export {
  Checkout
};
