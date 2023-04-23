import express, {Express} from "express"
import userRouter from './routers/user-router'
import fileUpload from 'express-fileupload'
import path from 'path'
const PORT = 8000
import dotenv from "dotenv"
dotenv.config()
const app: Express = express();

app.use(express.json())
app.use(express.static(path.resolve('static')))
app.use(fileUpload({}))
app.use('/api', userRouter)

app.listen(PORT, () => console.log(`Server started on PORT: ${process.env.PORT}`))
