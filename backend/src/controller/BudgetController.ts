import type { Request, Response } from 'express'
import Budget from '../models/Budget'
import Expense from '../models/Expense'

export class BudgetController {
    static getAll = async (req: Request, res: Response) => {
        try {
            const budgets = await Budget.findAll({ 
                order: [['createdAt', 'DESC']],
                //TODO: Filtrar por usuario autenticado
            })
            res.status(200).json(budgets)
        } catch (error) {
            res.status(500).json({
                message: 'Error al obtener todos los presupuestos',
                error: error,
            })
        }
    }

    static create = async (req: Request, res: Response) => {
        try {
            const budget = new Budget(req.body)
            await budget.save()
            res.status(201).json('Presupuesto creado con éxito')
        } catch (error) {
            res.status(500).json({
                message: 'Error al crear el budget',
                error: error,
            })
        }
    }

    static getById = async (req: Request, res: Response) => {
        const budget = await Budget.findByPk(req.budget.id, {
            include: [Expense]
        })

        res.json(budget)
    }

    static updateById = async (req: Request, res: Response) => {
        await req.budget.update(req.body)
        res.status(200).json('Presupuesto actualizado con éxito')
    }

    static deleteById = async (req: Request, res: Response) => {
        await req.budget.destroy()
        res.status(200).json('Presupuesto eliminado con éxito')
    }
}