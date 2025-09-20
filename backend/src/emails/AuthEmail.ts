import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: '"CashTrackr" <no-reply@midominio.com>',
            to: user.email,
            subject: 'CashTrackr - Confirmación de cuenta',
            html: `
                <h1>Hola ${user.name}</h1>
                <p>Has creado tu cuenta en CashTrackr, ya esta casi lista</p>
                <p>Para confirmar tu cuenta, haz click en el siguiente enlace:</p>
                <a href="#">Confirmar cuenta</a>
                <p>Ingresa el codigo que te he enviado: <b>${user.token}</b></p>
                <p>¡Muchas gracias por usar CashTrackr!</p>
                `,
        })

        console.log('Email enviado con éxito', email.messageId)
    }   
}