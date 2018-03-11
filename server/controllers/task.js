import Joi from 'joi'
import User from '../models/User'
import Services from '../services'
import ApiError from '../helpers/error'

// Get list of user tasks
async function getTasks (req, res, next) {
  try {
    const payload = await Services.decodeToken(req.cookies.token)
    const user = await User.get({ id: payload.sub })

    const tasks = user.noSensTasks()
    res.status(200).send(tasks)
  } catch (error) {
    next(error)
  }
}

// Get a user task
async function getTask (req, res, next) {
  try {
    const payload = await Services.decodeToken(req.cookies.token)
    const user = await User.get({ id: payload.sub })

    const tasks = user.noSensTasks().filter((task) => task.id === parseInt(req.params.id))

    if (tasks.length > 0) {
      res.status(200).send({ task: tasks[0] })
    } else {
      throw new ApiError(404, 'Task not found')
    }
  } catch (error) {
    next(error)
  }
}

// Add a new task
async function addTask (req, res, next) {
  const Schema = Joi.object().keys({
    text: Joi.string().required()
  })

  try {
    const validationResult = Joi.validate({ text: req.body.text }, Schema)

    if (validationResult.error === null) {
      const payload = await Services.decodeToken(req.cookies.token)
      const user = await User.get({ id: payload.sub })

      await user.addTask(req.body)
      res.status(200).send({ message: 'success' })
    } else {
      next(new ApiError(400, 'Incorrect data'))
    }
  } catch (error) {
    next(error)
  }
}

// Modify a task
async function updateTask (req, res, next) {
  const Schema = Joi.object().keys({
    text: Joi.string().required(),
    state: Joi.boolean().required()
  })

  try {
    const validationResult = Joi.validate({ text: req.body.text, state: req.body.state }, Schema)

    if (validationResult.error === null) {
      const payload = await Services.decodeToken(req.cookies.token)
      const user = await User.get({ id: payload.sub })

      await user.editTask(req.params.id, req.body)
      res.status(200).send({ message: 'success' })
    } else {
      next(new ApiError(400, 'Incorrect data'))
    }
  } catch (error) {
    next(error)
  }
}

// Delete a task
async function removeTask (req, res, next) {
  try {
    const payload = await Services.decodeToken(req.cookies.token)
    const user = await User.get({ id: payload.sub })

    await user.removeTask(req.params.id)
    res.status(200).send({ message: 'success' })
  } catch (error) {
    next(error)
  }
}

export default {
  getTasks,
  getTask,
  addTask,
  updateTask,
  removeTask
}
