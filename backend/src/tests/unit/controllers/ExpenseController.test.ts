import { createRequest, createResponse } from 'node-mocks-http'
import Expense from '../../../models/Expense'
import { ExpensesController } from '../../../controller/ExpensesController'
import { expenses } from '../../mocks/expenses'

jest.mock('../../../models/Expense', () => {
    return jest.fn().mockImplementation(() => {
        return { save: jest.fn() }
    })
})

describe('ExpensesController.create', () => {
    it('should create a new expense', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: { name: 'Test Expense', amount: 500 },
            budget: { id: 1 }
        })
        const res = createResponse()

        const saveMock = jest.fn().mockResolvedValue(true)
        
        const mockExpenseInstance = {
            save: saveMock
        }

        // Mock the Expense constructor
        ;(Expense as unknown as jest.Mock).mockImplementation(() => mockExpenseInstance)

        await ExpensesController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(201);
        expect(data).toEqual('Gasto creado con éxito')
        expect(saveMock).toHaveBeenCalled()
        expect(saveMock).toHaveBeenCalledTimes(1)
        expect(Expense).toHaveBeenCalledWith(req.body)
    })

    it('should handle expense creation error', async () => {
        const req = createRequest({
            method: 'POST',
            url: '/api/budgets/:budgetId/expenses',
            body: { name: 'Test Expense', amount: 100 },
            budget: { id: 1 }
        })
        const res = createResponse()

        const saveMock = jest.fn().mockRejectedValue(new Error('Hubo un error'))
        const mockExpenseInstance = {
            save: saveMock
        }

        // Mock the Expense constructor
        ;(Expense as unknown as jest.Mock).mockImplementation(() => mockExpenseInstance)

        await ExpensesController.create(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(500);
        expect(data).toEqual({error: 'Hubo un error'})
        expect(saveMock).toHaveBeenCalled()
        expect(Expense).toHaveBeenCalledWith(req.body)
    })
})

describe('ExpensesController.getById', () => {
    it('should return expense with ID 1', async () => {
        const req = createRequest({
            method: 'GET',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenses[0]
        })
        const res = createResponse()

        await ExpensesController.getById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toEqual(expenses[0])
    })
})

describe('ExpensesController.updateById', () => {
    it('should update expense and return a success message', async () => {
        const expenseMock = {
            ...expenses[0],
            update: jest.fn()
        }

        const req = createRequest({
            method: 'PUT',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock,
            body: { name: 'Updated Expense', amount: 100 }
        })
        const res = createResponse()

        await ExpensesController.updateById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toBe('Gasto actualizado con éxito')
        expect(expenseMock.update).toHaveBeenCalled()
        expect(expenseMock.update).toHaveBeenCalledWith(req.body)
        expect(expenseMock.update).toHaveBeenCalledTimes(1)
    })
})

describe('ExpensesController.deleteById', () => {
    it('should delete expense and return a success message', async () => {
        const expenseMock = {
            ...expenses[0],
            destroy: jest.fn()
        }

        const req = createRequest({
            method: 'DELETE',
            url: '/api/budgets/:budgetId/expenses/:expenseId',
            expense: expenseMock
        })
        const res = createResponse()

        await ExpensesController.deleteById(req, res)

        const data = res._getJSONData()
        expect(res.statusCode).toBe(200)
        expect(data).toBe('Gasto eliminado con éxito')
        expect(expenseMock.destroy).toHaveBeenCalled()
        expect(expenseMock.destroy).toHaveBeenCalledTimes(1)
    })
})
