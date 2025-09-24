import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5, 
  message: { "error": "Haz alcansado el limite de peticiones, espera 15 minutos" }
})