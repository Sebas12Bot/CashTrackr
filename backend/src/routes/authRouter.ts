import { Router } from 'express'
import { body, param } from 'express-validator'
import { AuthController } from '../controller/AuthController'
import { handleInputErrors } from '../middleware/validation'
import { limiter } from '../config/limiter'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(limiter)

router.post('/create-account', 
    body('name')
        .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
        .isEmail().withMessage('Correo inválido'),
    body('password')
        .isLength({min : 8}).withMessage('La contraseña debe ser mayor a 8 caracteres'),
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    body('token')
        .notEmpty()
        .isLength({min : 6, max : 6})
        .withMessage('Token inválido'),
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/login', 
    body('email')
        .isEmail().withMessage('Correo inválido'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    AuthController.login)

router.post('/forgot-password',
    body('email')
        .isEmail().withMessage('Correo inválido'),
    handleInputErrors,
    AuthController.forgotPassword)

router.post('/validate-token',
    body('token')
        .notEmpty()
        .isLength({min : 6, max : 6})
        .withMessage('El token es obligatorio'),
    handleInputErrors,
    AuthController.validateToken)

router.post('/reset-password/:token',
    param('token')
        .notEmpty()
        .isLength({min : 6, max : 6})
        .withMessage('El token es obligatorio'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    AuthController.resetPasswordWithToken
)

router.get('/user',
    authenticate,
    AuthController.user
)

export default router