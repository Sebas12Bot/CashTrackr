import { Router } from 'express'
import { body, param } from 'express-validator'
import { BudgetController } from '../controller/BudgetController'
import { handleInputErrors } from '../middleware/validation'
import { validateBudgetExists, validateBudgetId, validateBudgetInput } from '../middleware/budget'
import { ExpensesController } from '../controller/ExpensesController'
import { validateExpenseExists, validateExpenseId, validateExpenseInput } from '../middleware/expense'

const router = Router()

router.param('budgetId', validateBudgetId)
router.param('budgetId', validateBudgetExists)

router.param('expenseId', validateExpenseId)
router.param('expenseId', validateExpenseExists)

router.get('/', BudgetController.getAll)
router.get('/:budgetId', BudgetController.getById)
router.post('/', 
    validateBudgetInput,
    handleInputErrors,
    BudgetController.create)
router.put('/:budgetId', 
    validateBudgetInput,
    handleInputErrors,
    BudgetController.updateById)
router.delete('/:budgetId',BudgetController.deleteById)

router.get('/:budgetId/expenses/:expenseId', ExpensesController.getById)
router.post('/:budgetId/expenses', 
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.create)
router.put('/:budgetId/expenses/:expenseId', 
    validateExpenseId,
    validateExpenseInput,
    handleInputErrors,
    ExpensesController.updateById)
router.delete('/:budgetId/expenses/:expenseId', ExpensesController.deleteById)

export default router