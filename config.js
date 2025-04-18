const env = process.env.ENVIROMENT || 'development'
const paymentUrl = env === 'test' ? 'testPaymentUrl' : ''

const config = {
  database: `helia-pin-db-${env.toLocaleLowerCase()}`,
  port: process.env.PORT || 5001,
  passKey: process.env.PASS_KEY || 'signature-salt-key',
  koaSessionKey: 'koa-session-secret-key',
  env,
  // Node Data
  gatewayPort: process.env.GATEWAY_PORT || 8080,
  rpcTopic: process.env.TOPIC || 'pin-rpc-topic',
  reviewPinsPeriod: process.env.REVIEW_PINS_PERIOD || 5, // Minutes
  reviewNodesPeriod: process.env.REVIEW_NODES_PERIOD || 10, // Minutes
  gcPeriod: process.env.GC_PERIOD || 60, // Minutes
  relay: process.env.RELAY,
  announce: process.env.ANNOUNCE,
  alias: process.env.ALIAS || 'pinbox-dev',
  role: process.env.ROLE,

  // Payment data
  paymentUrl: process.env.PAYMENT_URL || paymentUrl,
  paymentUser: process.env.PAYMENT_USER || 'testuser',
  paymentPass: process.env.PAYMENT_PASS || 'testPassword',

  // Email service data
  emailServer: process.env.EMAIL_SERVER || 'server',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  telegramVerificationCode: process.env.TELEGRAM_VERIFICATION_CODE || '12345678',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
}
export default config
