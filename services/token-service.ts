import jwt from 'jsonwebtoken'
import db from '../db'
import {User} from "./user-service";
import dotenv from "dotenv"
dotenv.config()

export interface Tokens {
    accessToken: string,
    refreshToken: string
}

interface TokenData {
    user_id: string,
    refreshToken: string
}

const JWT_ACCESS_SECRET = "ajfbqo8tr128rh21rbuk1ytr113ty178451278"
const JWT_REFRESH_SECRET = "u4721t8712tr125ru12f871tf7"

class TokenService {
    generateTokens(payload: User): Tokens {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET  || "ghgiwuhguigw", {expiresIn: '30m'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "fwqwg98y13r8y387tfh", {expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token: string) {
        try {
            console.log(token, 'here2')
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET || JWT_ACCESS_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    async saveToken(userId: string, refreshToken: string): Promise<string> {
        const tokenData = await db.query(`SELECT * FROM token WHERE user_id IN ($1)`, [userId])
        if(tokenData) {
            tokenData.refreshToken = refreshToken
            const token = await db.query(`UPDATE token SET refreshToken = $1 WHERE user_id = $2`, [refreshToken, userId])
            return token
        }
        const token = await db.query(`INSERT INTO token (user_id, refreshToken) values ($1, $2)`, [userId, refreshToken])
        return token
    }

    async  removeToken(refreshToken: string) {
        const tokenData = await db.query(`DELETE FROM token WHERE refreshToken = ($1)`, [refreshToken])
        return tokenData
    }

    async findToken(refreshToken: string) {
        const tokenData = await db.query(`SELECT * FROM token WHERE refreshToken = ($1)`, [refreshToken])
        return tokenData
    }
}

export default new TokenService()
