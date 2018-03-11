<template lang="pug">
  v-app
    v-content
      v-container(fluid fill-height)
        v-layout(justify-center align-center)
          v-flex(xs12 sm8 md4)
            v-card(class="elevation-12")
              v-card-title
                h1(align-center) Create new account
              v-card-text
                v-text-field(
                  label="Name"
                  type="name"
                  v-model="name"
                  :rules="[required]"
                )
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
                  :rules="[required, passwordCheck]"
                )
                v-text-field(
                  v-model="repeatPassword"
                  label="Repeat password"
                  type="password"
                  :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                  :append-icon-cb="() => (showPassword = !showPassword)"
                  :type="!showPassword ? 'password' : 'text'"
                  :rules="[required, repeatPasswordCheck]"
                )
              v-card-actions
                v-layout(column align-center)
                  v-btn(large block class="my-2" color="primary" @click="register()" :disabled="registerButton") Create account
      v-snackbar(
        :timeout="timeout"
        :color="color"
        v-model="snackbar"
      ) {{ message }}
</template>

<script>
export default {
  data () {
    return {
      showPassword: false,
      name: '',
      email: '',
      password: '',
      repeatPassword: '',
      snackbar: false,
      timeout: 3000,
      color: null,
      message: null
    }
  },
  computed: {
    registerButton () {
      return !(this.required(this.name) === true &&
        this.required(this.email) === true &&
        this.emailCheck(this.email) === true &&
        this.required(this.password) === true &&
        this.passwordCheck(this.password) === true &&
        this.required(this.repeatPassword) === true &&
        this.repeatPasswordCheck(this.repeatPassword) === true)
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

    passwordCheck (value) {
      return value.length >= 5 || 'Invalid password'
    },

    repeatPasswordCheck (value) {
      if (value !== this.password) {
        return 'Passwords do not match'
      }

      return value.length >= 5 || 'Invalid password'
    },

    async register () {
      try {
        await this.$store.dispatch('register', { name: this.name, email: this.email, password: this.password })

        this.color = 'green'
        this.message = 'Registered successfully, redirecting'

        setTimeout(() => {
          this.$router.push('/login')
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
