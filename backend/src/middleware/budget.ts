import type { Request, Response, NextFunction } from 'express'
import { param, validationResult } from 'express-validator'
import Budget from '../models/Budget'
import { body } from 'express-validator'

declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}

export const  validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {
    await param('budgetId')
        .isInt().withMessage('ID no valido')
        .custom((value) => value > 0).withMessage('El ID no es valido')
        .run(req)
    let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
    next()
}

export const  validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId)
        if (!budget) {
            return res.status(404).json({
                message: 'No se encontró el presupuesto',
            })
        }
        req.budget = budget
        next()
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el presupuesto',
            error: error,
        })
    }
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name')
        .notEmpty().withMessage('El nombre del presupuesto no puede ir vacío')
        .run(req)
    await body('amount')
        .notEmpty().withMessage('La cantidad del presupuesto no puede ir vacía')
        .isNumeric().withMessage('Cantidad no válida')
        .custom(value => value > 0).withMessage('El presupuesto debe ser mayor a 0')
        .run(req)
    next()
}