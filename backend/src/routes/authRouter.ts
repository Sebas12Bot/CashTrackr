import { Router } from 'express'
import { body } from 'express-validator'
import { AuthController } from '../controller/AuthController'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
        .isEmail().withMessage('Correo inválido'),
    body('password')
        .isLength({min : 8}).withMessage('La contraseña debe ser mayor a 8 caracteres'),
    handleInputErrors,
    AuthController.createAccount)

export default router