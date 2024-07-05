import passport from 'koa-passport'

class Passport {
  constructor () {
    this.passport = passport
  }

  async authUser (ctx) {
    if (!ctx) throw new Error('Koa context (ctx) is required!')

    return new Promise((resolve, reject) => {
      try {
        this.passport.authenticate('local', (err, user) => {
          try {
            if (err) throw err

            resolve(user)
          } catch (err) {
            return reject(err)
          }
        })(ctx, null)
      } catch (err) {
        return reject(err)
      }
    })
  }
}

export default Passport
