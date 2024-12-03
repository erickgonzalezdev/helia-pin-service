import axios from 'axios'
// Authorization
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDE0OTk0NTUzYzhiYTY4M2I3OTQ2ZSIsInR5cGUiOiJ1c2VyQWNjZXNzIiwiaWF0IjoxNzMyMzMxOTI0fQ.ZcFQHB-3d75sqxW1i0szJxnP-OrsEGAZ75fvbU7hxCQ'
// User id to update account
const userId = '67414994553c8ba683b7946e'

const createAcc = async () => {
  const options = {
    method: 'post',
    url: 'http://localhost:5001/account',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${JWT}`
    },
    data: {
      userId,
      type: 1, // 1 , 2 3
      expirationData: { months: 5, days: 0, hours: 0, minutes: 0 }
    }
  }
  const result = await axios(options)

  const account = result.data.account
  console.log('account', account)

  const expired = new Date(account.expiredAt).toLocaleDateString()
  console.log('Account expired at ', expired)

  console.log(`Max Account Storage : ${account.maxBytes / 10 ** 6} mb`)
  console.log(`Max size per file : ${account.maxFileBytes / 10 ** 6} mb`)
}

createAcc()
