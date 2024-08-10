const env = process.env.ENVIROMENT || 'development'

const config = {
  database: `helia-pin-db-${env.toLocaleLowerCase()}`,
  port: process.env.PORT || 5001,
  passKey: process.env.PASS_KEY || 'signature-salt-key',
  koaSessionKey: 'koa-session-secret-key',
  env,
  gatewayPort: process.env.GATEWAY_PORT || 8080,
  rpcTopic: process.env.TOPIC || 'pin-rpc-topic',
  pinHostPeerId: process.env.PIN_HOST || '12D3KooWQiZR8xx4jtEdpq221gGFRCqHY2pDmuVAKfTSR43dGanU'
}

export default config
