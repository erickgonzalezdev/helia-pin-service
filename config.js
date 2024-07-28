const env = process.env.ENVIROMENT || 'development'

const config = {
  database: `helia-pin-db-${env.toLocaleLowerCase()}`,
  port: process.env.PORT || 5001,
  passKey: process.env.PASS_KEY || 'user-password-salt-key',
  koaSessionKey: 'koa-session-secret-key',
  env,
  gatewayPort: process.env.GATEWAY_PORT || 8080
}

export default config
