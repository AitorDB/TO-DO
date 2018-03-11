import Joi from 'joi'
import User from '../models/User'
import Services from '../services'
import ApiError from '../helpers/error'

// Register a new user
async function registerUser (req, res, next) {
  const Schema = Joi.object().keys({
    name: Joi.string().alphanum().min(1).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required()
  })

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }

  try {
    const validationResult = Joi.validate({ name: userData.name, email: userData.email, password: userData.password }, Schema)
    if (validationResult.error === null) {
      await User.register(userData)
      res.status(200).send({ message: 'Success' })
    } else {
      next(new ApiError(400, 'Incorrect data'))
    }
  } catch (error) {
    next(error)
  }
}

// Login
async function login (req, res, next) {
  const Schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required()
  })

  const userData = {
    email: req.body.email,
    password: req.body.password
  }

  try {
    const validationResult = Joi.validate({ email: userData.email, password: userData.password }, Schema)
    if (validationResult.error === null) {
      const user = await User.get({ email: userData.email })
      if (user) {
        const result = await user.comparePassword(userData.password)
        if (result) {
          const token = await Services.createToken(user.id)
          res.status(200).send({ token })
        } else {
          next(new ApiError(400, 'Incorrect data'))
        }
      }
    } else {
      next(new ApiError(400, 'Incorrect data'))
    }
  } catch (error) {
    next(error)
  }
}

// Logout
async function logout (req, res, next) {
  try {
    const payload = await Services.decodeToken(req.cookies.token)
    const user = await User.get({ id: payload.sub })
    await user.updateLastLogin()
    res.status(200).send({ message: 'success' })
  } catch (error) {
    next(error)
  }
}

export default {
  registerUser,
  login,
  logout
}
