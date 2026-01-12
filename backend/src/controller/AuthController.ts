import type { Request, Response } from 'express'
import User from '../models/User'
import { error } from 'console'
import { checkPassword, hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        
        const { email, password } = req.body

        //Prevenir usuarios duplicados
        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            return res.status(409).json({
                message: 'Un usuario con ese correo ya existe',
                error: error
            })
        }

        try {
            const user = new User(req.body)
            user.password = await hashPassword(password)
            user.token = generateToken()
            await user.save()

            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.status(201).json('Usuario creado con éxito')
        } catch (error) {
            res.status(500).json({
                message: 'Error al crear usuario',
                error: error
            })
        }
    }
    
    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({ where: { token }})

        if (!user) {
            return res.status(401).json({
                message: 'Token inválido',
                error: error
            })
        }

        user.confirmed = true
        user.token = null
        await user.save()

        res.status(200).json('Cuenta confirmada con éxito')
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        const user = await User.findOne({ where: { email }})

        if (!user) {
            return res.status(404).json({
                message: 'usuario no encontrado',
                error: error
            })
        }

        if (!user.confirmed) {
            return res.status(403).json({
                message: 'La cuenta no ha sido confirmada',
                error: error
            })
        }

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Contraseña incorrecta',
                error: error
            })
        }

        const token =generateJWT(user.id)

        res.status(200).json(token)
    }  
    
    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body

        const user = await User.findOne({ where: { email }})

        if (!user) {
            return res.status(404).json({
                message: 'usuario no encontrado',
                error: error
            })
        }

        user.token = generateToken()
        await user.save()

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.status(200).json('Se ha enviado un email con las instrucciones para reestablecer tu contraseña')
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body

        const tokenExists = await User.findOne({ where: { token }})

        if (!tokenExists) {
            return res.status(404).json({
                message: 'Token no encontrado',
                error: error
            })
        }

        res.status(200).json('Token validado con éxito')
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({ where: { token }})

        if (!user) {
            return res.status(404).json({
                message: 'Token no encontrado',
                error: error
            })
        }

        user.password = await hashPassword(password)
        user.token = null
        await user.save()

        res.status(200).json('Contraseña cambiada con éxito')
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        
        const { current_password, new_password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'La contraseña actual es incorrecta',
                error: error
            })
        }

        user.password = await hashPassword(new_password)
        await user.save()

        res.status(200).json('Contraseña actualizada con éxito')
    }

    static checkPassword = async (req: Request, res: Response) => {
        
        const { password } = req.body
        const { id } = req.user

        const user = await User.findByPk(id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'La contraseña actual es incorrecta',
                error: error
            })
        }
        
        res.status(200).json('Contraseña correcta')
    }
}
