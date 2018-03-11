import axios from '../plugins/axios'

export const state = () => ({
  authenticated: false
})

export const mutations = {
  setUser (state, authenticated) {
    state.authenticated = authenticated
  }
}

export const actions = {
  login (context, userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.post('/api/user/login', userData)
        context.commit('setUser', true)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  },

  register (context, userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.post('/api/user/register', userData)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  },

  async logout (context, userData) {
    const { data } = await axios.post('/api/user/logout')
    context.commit('setUser', false)
    return data
  }
}
