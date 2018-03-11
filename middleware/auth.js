export default function ({ store, redirect, req }) {
  if (!store.state.authenticated && process.server && !req.cookies.token) {
    redirect('/login')
  }
}
