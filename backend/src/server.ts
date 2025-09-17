import express from 'express'
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter'
import dotenv from 'dotenv'

dotenv.config()

async function connectDB() {
    try {
        await db.authenticate()
        db.sync();
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

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(colors.green.bold(`Servidor corriendo en el puerto ${PORT}`))
})

export default app