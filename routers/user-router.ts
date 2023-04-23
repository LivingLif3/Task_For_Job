import {NextFunction, Request, Response, Router} from "express";
import UserController from "../controllers/user-conroller";
import authMiddleware from "../middlewares/auth-middleware";
const router = Router()

// @ts-ignore
router.post('/user', UserController.createUser)
// @ts-ignore
router.post('/login', UserController.login)
// @ts-ignore
router.post('/logout', UserController.logout)
// @ts-ignore
router.post('/pdf', authMiddleware, UserController.createPDF)
// @ts-ignore
router.get('/user', authMiddleware, UserController.getUsers)
// @ts-ignore
router.get('/user/:id', authMiddleware, UserController.getOneUser)
// @ts-ignore
router.put('/user', authMiddleware, UserController.updateUser)
// @ts-ignore
router.delete('/user/:id', authMiddleware, UserController.deleteUser)

export default router
