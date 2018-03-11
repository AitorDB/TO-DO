import moment from 'moment'
import jwt from 'jwt-simple'

import User from '../models/User'
import ApiError from '../helpers/error'
import config from '../config'

// Create new token
async function createToken (userId) {
  const user = await User.get({ id: userId })
  const date = await user.updateLastLogin()
  const payload = {
    sub: userId,
    iat: date,
    exp: date + moment.duration(14, 'days').asSeconds()
  }

  const token = jwt.encode(payload, config.API_SECRET)
  return token
}

// Decode a token
async function decodeToken (token) {
  try {
    const decodedToken = await jwt.decode(token, config.API_SECRET)
    return decodedToken
  } catch (err) {
    console.log(err)
    if (err.message === 'Token expired') throw new ApiError(401, 'Expired token')
    throw new ApiError(401, 'Wrong token')
  }
}

export default {
  createToken,
  decodeToken
}
