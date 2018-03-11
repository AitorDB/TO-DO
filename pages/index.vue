<template lang="pug">
  v-app
    v-toolbar(color="primary" dark)
      v-toolbar-title(color="accent") TO-DO App 
      v-spacer
      v-progress-circular(v-if="loading" indeterminate class="mx-5")
      v-tooltip(bottom)
        v-btn(flat icon color="accent" slot="activator" @click="logout()")
          v-icon exit_to_app
        span Log out
    v-content
      v-container(fluid)
        div(class="mt-2 d-flex")
          v-text-field(name="todo" label="Add a new task" v-model="task" solo)
          v-btn(flat color="teal" :disabled="loading || task.length === 0" @click="addTask()") Add task
        h1(class="mt-5") TO-DO List        
        v-card(class="mt-2")
          v-list
            template(v-if="todoTasks.length > 0")
              v-list-tile(v-for="(task, index) in todoTasks" :key="index" href="javascript:;")
                v-list-tile-action
                  v-checkbox(v-model="task.state" class="d-flex" @change="editTask(task.id)")
                v-layout(@click.stop="openEditor(task.id)" class="d-flex" align-center style="overflow: hidden; height: 100%")
                  p(class="task") {{ task.text }}
                v-list-tile-action
                  v-btn(flat icon color="red" @click.stop="removeTask(task.id)")
                    v-icon clear
            v-list-tile(v-else)
              | No tasks
        
        h1(class="mt-5") Done List
        v-card(class="mt-2")
          v-list
            template(v-if="doneTasks.length > 0")
              v-list-tile(v-for="(task, index) in doneTasks" :key="index" href="javascript:;")
                v-list-tile-action
                  v-checkbox(v-model="task.state" @change="editTask(task.id)")
                v-layout(@click.stop="openEditor(task.id)" class="d-flex" align-center full-height style="overflow: hidden")
                  p(class="task") {{ task.text }}
                v-list-tile-action
                  v-btn(flat icon color="red" @click.stop="removeTask(task.id)")
                    v-icon clear
            v-list-tile(v-else)
              | No tasks

    v-dialog(v-model="dialog" max-width="500px")
      v-card
        v-card-title Edit task
        v-card-text
          v-text-field(v-model="text" multiLine)
        v-card-actions(align-right)
          v-btn(color="red" flat @click.stop="closeEditor(false)") Cancel
          v-btn(color="primary" flat @click.stop="closeEditor(true)" :disabled="text.length === 0") Save

    v-snackbar(
      :timeout="timeout"
      :color="color"
      v-model="snackbar"
    ) {{ message }}
</template>

<script>
import axios from '~/plugins/axios'
import Cookies from 'js-cookie'

export default {
  middleware: 'auth',
  data () {
    return {
      tasks: [],
      task: '',
      text: '',
      dialog: false,
      loading: false,
      selected: null,
      snackbar: false,
      color: null,
      message: '',
      timeout: 3000
    }
  },
  computed: {
    doneTasks () {
      return this.tasks.filter((task) => task.state)
    },

    todoTasks () {
      return this.tasks.filter((task) => !task.state)
    }
  },
  methods: {
    openEditor (id) {
      this.selected = this.tasks.findIndex((task) => task.id === id)
      this.text = this.tasks[this.selected].text
      this.dialog = true
    },

    closeEditor (save) {
      if (save) {
        this.tasks[this.selected].text = this.text
        this.editTask(this.tasks[this.selected].id)
      }

      this.dialog = false
      this.selected = null
      this.text = ''
    },

    async getTasks () {
      try {
        this.loading = true
        const { data } = await axios.get('/api/user/task')
        this.tasks = data
      } catch (error) {
        if (error.response.status === 401) {
          if (Cookies.get('token')) {
            this.logout()
          } else {
            this.$router.push('/login')
          }
        } else {
          this.snackbar = true
          this.color = 'error'
          this.message = 'Something was wrong'
        }
      }

      this.loading = false
    },

    async addTask () {
      try {
        this.loading = true
        await axios.post('/api/user/task', { text: this.task })
        this.task = ''
        this.getTasks()

        this.snackbar = true
        this.color = 'sucess'
        this.message = 'Task added successfully'
      } catch (error) {
        this.snackbar = true
        this.color = 'error'
        this.message = 'Something was wrong'
      }

      this.loading = false
    },

    async removeTask (id) {
      try {
        const pos = this.tasks.findIndex((task) => task.id === id)
        this.loading = true
        await axios.delete(`/api/user/task/${id}`, this.tasks[pos])
        this.getTasks()

        this.snackbar = true
        this.color = 'success'
        this.message = 'Task removed successfully'
      } catch (error) {
        this.snackbar = true
        this.color = 'error'
        this.message = 'Something was wrong'
      }

      this.loading = false
    },

    async editTask (id) {
      try {
        const pos = this.tasks.findIndex((task) => task.id === id)
        this.loading = true
        await axios.put(`/api/user/task/${id}`, this.tasks[pos])
        this.getTasks()

        this.snackbar = true
        this.color = 'success'
        this.message = 'Task updated successfully'
      } catch (error) {
        this.snackbar = true
        this.color = 'error'
        this.message = 'Something was wrong'
      }

      this.loading = false
    },

    async logout () {
      try {
        await this.$store.dispatch('logout')
        Cookies.remove('token')
        this.$router.push('/login')
      } catch (error) {
        this.snackbar = true
        this.color = 'error'
        this.message = 'Something was wrong'
      }
    }
  },
  mounted () {
    this.getTasks()
  }
}
</script>

<style lang="sass" scoped>
.task
  margin: auto 5px
  flex: 1
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
</style>
