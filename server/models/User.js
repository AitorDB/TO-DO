import mongoose from 'mongoose'
import moment from 'moment'
import bcrypt from 'bcrypt-as-promised'
import ApiError from '../helpers/error'

const Schema = mongoose.Schema
const User = new Schema({
  id: {
    type: Number,
    required: true,
    index: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  registerDate: {
    type: Number,
    default: moment().unix()
  },
  lastLoginDate: {
    type: Number,
    default: moment().unix()
  },
  tasks: [{
    id: {
      type: Number,
      required: true,
      index: true
    },
    text: String,
    state: {
      type: Boolean,
      deafult: false
    }
  }]
})

User.methods = {
  // Hide some info
  hideSensInfo () {
    return {
      id: this.id,
      name: this.name,
      email: this.email
    }
  },

  // Check the password
  async comparePassword (password) {
    try {
      await bcrypt.compare(password, this.hashedPassword)
      return true
    } catch (error) {
      throw new ApiError(400, 'Incorrect data')
    }
  },

  // Update the last login date
  async updateLastLogin () {
    const date = moment().unix()
    const user = await this.update({ $set: { lastLoginDate: date } })
    if (user) {
      return date
    } else {
      throw new ApiError(400, 'Incorrect data')
    }
  },

  // Hide some info
  noSensTasks () {
    return this.tasks.map((task) => {
      return {
        id: task.id,
        text: task.text,
        state: task.state
      }
    })
  },

  // Add a new task
  async addTask ({ text }) {
    const id = this.tasks.length > 0 ? this.tasks.sort((a, b) => a.id - b.id)[this.tasks.length - 1].id + 1 : 0
    await this.update({ $push: { tasks: { id, text, state: false } } })
  },

  // Modify a task
  async editTask (id, { text, state }) {
    const pos = this.tasks.findIndex((task) => task.id === parseInt(id))
    const tasks = this.tasks.slice()

    if (pos !== -1) {
      tasks[pos].text = text
      tasks[pos].state = state

      await this.update({ $set: { tasks: tasks } })
    } else {
      throw new ApiError(404, 'Task not found')
    }
  },

  // Delete a task
  async removeTask (id) {
    const pos = this.tasks.findIndex((task) => task.id === parseInt(id))
    const tasks = this.tasks.slice()

    if (pos !== -1) {
      tasks.splice(pos, 1)
      await this.update({ $set: { tasks: tasks } })
    } else {
      throw new ApiError(404, 'Task not found')
    }
  }
}

User.statics = {
  // Get a user
  async get (findQuery) {
    const user = await this.findOne(findQuery)
    if (user) {
      return user
    } else {
      throw new ApiError(404, 'User not found')
    }
  },

  // Register a user
  async register (userData) {
    const check = await this.findOne({ email: userData.email })
    if (!check) {
      const user = await this.findOne().sort({ id: -1 }).exec()
      const salt = await bcrypt.genSalt()
      const hash = await bcrypt.hash(userData.password, salt)

      const newUser = new this({
        id: user ? user.id + 1 : 0,
        name: userData.name,
        email: userData.email,
        hashedPassword: hash
      })

      await newUser.save()
      return newUser
    } else {
      throw new ApiError(409, 'Email already registered')
    }
  }
}

export default mongoose.model('User', User)
