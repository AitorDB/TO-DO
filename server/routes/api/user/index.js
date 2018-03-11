import { Router } from 'express'
import task from './task'
import UserControllers from '../../../controllers/user'

const router = Router()
router.use('/task', task)

router.post('/register', UserControllers.registerUser)
router.post('/login', UserControllers.login)
router.post('/logout', UserControllers.logout)

export default router
