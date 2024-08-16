const env = process.env.ENVIROMENT || 'development'

const config = {
  database: `helia-pin-db-${env.toLocaleLowerCase()}`,
  port: process.env.PORT || 5001,
  passKey: process.env.PASS_KEY || 'signature-salt-key',
  koaSessionKey: 'koa-session-secret-key',
  env,
  gatewayPort: process.env.GATEWAY_PORT || 8080,
  rpcTopic: process.env.TOPIC || 'pin-rpc-topic',
  pinHostPeerId: process.env.PIN_HOST || '12D3KooWE2d8BnfLqVRJ3HZusgTUVHFq5EJezp49firDSbUe7MoR',
  reviewPinsPeriod: process.env.REVIEW_PERIOD || 5 // Minutes
}

export default config
