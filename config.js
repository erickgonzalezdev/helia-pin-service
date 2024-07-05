const env = process.env.ENVIROMENT || 'development'

const config = {
  database: `starter-db-${env.toLocaleLowerCase()}`,
  port: process.env.PORT || 5001,
  passKey: process.env.PASS_KEY || 'user-password-salt-key',
  koaSessionKey: 'koa-session-secret-key',
  env
}

export default config
