import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter'
import authRouter from './routes/authRouter'
import dotenv from 'dotenv'

dotenv.config()

async function connectDB() {
    try {
        await db.authenticate()
        // In test environment, reset the database to ensure clean state
        if (process.env.NODE_ENV === 'test') {
            await db.sync({ force: true })
        } else {
            await db.sync()
        }
        console.log(colors.blue.bold('Base de datos conectada'))
    } catch (error) {
        console.log(colors.red.bold('Error de conexión a la base de datos: ' + error))
    }
}
connectDB()

const app = express()

app.use(morgan('dev'))
app.use(express.json())

app.use('/api/budgets', budgetRouter)
app.use('/api/auth', authRouter)

export default app