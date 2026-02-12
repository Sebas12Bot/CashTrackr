import type { Request, Response } from 'express'
import User from '../models/User'

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
                error: 'Un usuario con ese correo ya existe'
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
                error: 'Error al crear usuario'
            })
        }
    }
    
    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({ where: { token }})

        if (!user) {
            return res.status(401).json({
                error: 'Token inválido'
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
                error: 'usuario no encontrado'
            })
        }

        if (!user.confirmed) {
            return res.status(403).json({
                error: 'La cuenta no ha sido confirmada'
            })
        }

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: 'Contraseña incorrecta'
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
                error: 'usuario no encontrado'
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
                error: 'Token no encontrado'
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
                error: 'Token no encontrado'
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
                error: 'La contraseña actual es incorrecta'
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
                error: 'La contraseña actual es incorrecta'
            })
        }
        
        res.status(200).json('Contraseña correcta')
    }
}
