import { Router } from 'express'
import TaskController from '../../../controllers/task'

const router = Router()

router.get('/', TaskController.getTasks)
router.get('/:id', TaskController.getTask)
router.post('/', TaskController.addTask)
router.put('/:id', TaskController.updateTask)
router.delete('/:id', TaskController.removeTask)

export default router
