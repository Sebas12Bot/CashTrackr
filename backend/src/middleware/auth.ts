import { error } from 'console'
import User from '../models/User'
import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization

        if (!bearer) {
            return res.status(401).json({
                message: 'No autorizado',
                error: error
            })
        }

        const [ , token ] = bearer.split(' ')

        if (!token) {
            return res.status(401).json({
                message: 'No autorizado',
                error: error
            })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if(typeof decoded === 'object' && decoded.id) {
                req.user = await User.findByPk(decoded.id, {
                    attributes: ['id', 'name', 'email']
                })
                next()
            }
        } catch (error) {
            res.status(500).json({
                message: 'Error, intenta de nuevo',
                error: error
            })
        }
}