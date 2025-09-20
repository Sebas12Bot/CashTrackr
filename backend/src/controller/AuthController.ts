import type { Request, Response } from 'express'
import User from '../models/User'
import { error } from 'console'
import { hashPassword } from '../utils/auth'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'

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
}