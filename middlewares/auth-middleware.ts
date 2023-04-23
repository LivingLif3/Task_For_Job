import {User} from "../services/user-service";

import tokenService from '../services/token-service'
import express from 'express'
import {JwtPayload} from "jsonwebtoken";

interface  CustomRequest extends Request {
    user: string | JwtPayload
}

export default function(req: CustomRequest, res: express.Response, next: Function) {
    try {
        //@ts-ignore
        const authorizationHeader = req.headers.token

        if(!authorizationHeader) {
            return next({message: 'Не авторизован'})
        }

        let accessToken
        if (typeof authorizationHeader === "string") {
            accessToken = authorizationHeader.split(' ')[1]
        }
        if(!accessToken) {
            return next({message: 'Не авторизован'})
        }

        const userData = tokenService.validateAccessToken(accessToken)
        console.log(userData, 'here')

        if(!userData) {
            return next({message: 'Не авторизован'})
        }
        console.log('here')
        req.user = userData
        next()
    } catch (e) {
        return next({message: 'Не авторизован'})
    }
}
