# frozen_string_literal: true

require 'stripe'
require 'sinatra'
require 'sinatra/cookies'
require 'dotenv'
use Rack::Logger

helpers do
  def logger
    request.logger
  end
end

# Replace if using a different env file or config
Dotenv.load

# For sample support and debugging, not required for production:
Stripe.set_app_info(
  'stripe-samples/link',
  version: '0.0.1',
  url: 'https://github.com/stripe-samples/link'
)
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV['STATIC_DIR'])
set :port, 4242

get '/' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'index.html')
end

get '/config' do
  content_type 'application/json'
  {
    publishableKey: ENV['STRIPE_PUBLISHABLE_KEY'],
  }.to_json
end

post '/create-payment-intent' do
  content_type 'application/json'

  # Create the payment details based on your logic.
  data = JSON.parse(request.body.read, symbolize_names: true)
  amount = data[:amount]
  logger.info("Creating payment intent with amount: #{amount}")
  # Create a PaymentIntent with the purchase amount and currency.
  payment_intent = Stripe::PaymentIntent.create(
    amount: amount,
    currency: 'usd',
  )

  # Send the PaymentIntent client_secret and amount to the client.
  {
    clientSecret: payment_intent.client_secret,
  }.to_json
end

get '/payment/next' do
  content_type 'text/html'

  intent = Stripe::PaymentIntent.retrieve({
    id: params[:payment_intent],
    expand: ['payment_method'],
  })

  redirect "/success?payment_intent_client_secret=#{intent.client_secret}"
end

get '/success' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'success.html')
end

# post '/webhook' do
#   # You can use webhooks to receive information about asynchronous payment events.
#   # For more about our webhook events check out https://stripe.com/docs/webhooks.
#   webhook_secret = ENV['STRIPE_WEBHOOK_SECRET']
#   payload = request.body.read
#   if !webhook_secret.empty?
#     # Retrieve the event by verifying the signature using the raw body and secret if webhook signing is configured.
#     sig_header = request.env['HTTP_STRIPE_SIGNATURE']
#     event = nil

#     begin
#       event = Stripe::Webhook.construct_event(
#         payload, sig_header, webhook_secret
#       )
#     rescue JSON::ParserError => e
#       # Invalid payload
#       status 400
#       return
#     rescue Stripe::SignatureVerificationError => e
#       # Invalid signature
#       puts '⚠️  Webhook signature verification failed.'
#       status 400
#       return
#     end
#   else
#     data = JSON.parse(payload, symbolize_names: true)
#     event = Stripe::Event.construct_from(data)
#   end

#   case event.type
#   when 'some.event'
#     puts '🔔  Webhook received!'
#   end

#   content_type 'application/json'
#   {
#     status: 'success'
#   }.to_json
# end
