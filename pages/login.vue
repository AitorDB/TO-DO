<template lang="pug">
  v-app
    v-content
      v-container(fluid fill-height)
        v-layout(justify-center align-center)
          v-flex(xs12 sm8 md4)
            v-card(class="elevation-12")
              v-card-title
                h1(align-center) Log in to your account
              v-card-text
                v-text-field(
                  label="Email"
                  type="email"
                  v-model="email"
                  :rules="[required, emailCheck]"
                )
                v-text-field(
                  v-model="password"
                  label="Password"
                  type="password"
                  :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                  :append-icon-cb="() => (showPassword = !showPassword)"
                  :type="!showPassword ? 'password' : 'text'"
                  :rules="[required]"
                )
              v-card-actions
                v-layout(column align-center)
                  v-btn(large block class="my-2" color="primary" @click="login()" :disabled="loginButton") Log in             
                  v-btn(flat @click="$router.push('/register')") Create your account
      v-snackbar(
        :timeout="timeout"
        :color="color"
        v-model="snackbar"
      ) {{ message }}
</template>

<script>
import Cookies from 'js-cookie'
export default {
  data () {
    return {
      showPassword: false,
      email: '',
      password: '',
      snackbar: false,
      timeout: 3000,
      color: null,
      message: null
    }
  },
  computed: {
    loginButton () {
      return !(this.required(this.email) === true &&
        this.emailCheck(this.email) === true &&
        this.required(this.password) === true)
    }
  },
  methods: {
    required (value) {
      return !!value || 'Required'
    },

    emailCheck (value) {
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(value) || 'Invalid email'
    },

    async login () {
      try {
        const response = await this.$store.dispatch('login', { email: this.email, password: this.password })
        this.color = 'green'
        this.message = 'Logged successfully, redirecting'

        Cookies.set('token', response.token)
        setTimeout(() => {
          this.$router.push('/')
        }, 1000)
      } catch ({ response: { data } }) {
        this.color = 'red'
        this.message = data.message || 'Something was wrong'
      }

      this.snackbar = true
    }
  }
}
</script>
