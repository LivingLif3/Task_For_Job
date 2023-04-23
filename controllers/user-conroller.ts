import express, {NextFunction, Request} from 'express'
import userService, {UserDTO} from "../services/user-service";

interface CustomResponse extends Response {
    cookie: (key: string, val: string, expires: Object) => string;
    clearCookie: (key: string) => void
}

interface ReqBody {
    email?: string,
    firstName?: string,
    lastName?: string,
    password?: string,
    img?: any
}

class UserController {
    async createUser(req: Request, res: CustomResponse, next: NextFunction) {
        try {
            const {email, firstName, lastName, password} = req.body as ReqBody
            const {img} = req.files as any

            const userData: any = await userService.createUser(email!, password!, firstName!, lastName!, img)
            if ("refreshToken" in userData) {
                res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 3600 * 1000, httpOnly: true})
            }
            // @ts-ignore
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async login(req: express.Request, res: CustomResponse, next: Function) {
        try {
            const {email, password} = req.body
            const userData: any = await userService.login(email, password)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 3600 * 1000, httpOnly: true})
            // @ts-ignore
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async logout(req: Request, res: CustomResponse, next: Function) {
        try {
            // @ts-ignore
            const {refreshToken} = req.headers.cookie
            const token = await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            // @ts-ignore
            return res.json(token)
        } catch(e) {
            next(e)
        }
    }

    async getUsers(req: express.Request, res: express.Response, next: Function) {
        try {
            const users = await userService.getUsers()
            return res.json(users)
        } catch(e) {
            next(e)
        }
    }

    async getOneUser(req: express.Request, res: express.Response, next: Function) {
        try {
            const userId = req.params.id
            const user = await userService.getOneUser(userId)
            return res.json(user)
        } catch(e) {
            next(e)
        }
    }
    async updateUser(req: express.Request, res: express.Response, next: Function) {
        try {
            const {id, email, password, firstName, lastName} = req.body
            const updatedUser = await userService.updateUser(id, email, firstName, lastName, password)
            return res.json(updatedUser)
        } catch(e) {
            next(e)
        }
    }

    async deleteUser(req: express.Request, res: express.Response, next: Function) {
        try {
            const userId = req.params.id
            const deletedUser = await userService.deleteUser(userId)
            return res.json(deletedUser)
        } catch(e) {
            next(e)
        }
    }

    async createPDF(req: express.Request, res: express.Response, next: Function) {
        try {
            const {email} = req.body
            const response = await userService.createPDF(email)
            return res.json({message: response})
        } catch (e) {
            console.log(e)
            next({message: false})
        }
    }
}

export default new UserController()
