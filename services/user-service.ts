import db from '../db'
import bcrypt from 'bcryptjs'
import {v4} from 'uuid'
import path from "path"
import fs from "fs"
import pdfkit from "pdfkit"
import tokenService, {Tokens} from "./token-service";

export interface User {
    id: number,
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    image: string,
    pdf: string
}

export interface UserDTO extends Tokens{
    user: User
}

interface Error {
    message: string
}

class UserService {
    async createUser(email: string, password: string, firstName: string, lastName: string, img: any): Promise<UserDTO | Error | string> {
        const candidate = await db.query(`SELECT * FROM person WHERE email IN ($1)`, [email])
        if (candidate.rows.length !== 0) {
            return {message: "Такой пользователь уже существует"}
        }

        let hashPassword = await bcrypt.hash(password, 3)
        let fileName = v4() + '.jpg'

        img.mv(path.resolve(__dirname, '..', 'static', fileName))
        const newPerson = await db.query(`INSERT INTO person (email, password, firstName, lastName, image) values ($1,$2, $3, $4, $5) returning *`, [email, hashPassword, firstName, lastName, fileName])
        const tokens = tokenService.generateTokens({...newPerson.rows[0]})
        await tokenService.saveToken(newPerson.rows[0].id, tokens.refreshToken)

        return {
            ...tokens,
            user: newPerson.rows[0]
        }
    }

    async login(email: string, password: string): Promise<UserDTO | typeof Error | string> {
        const user = await db.query(`SELECT * FROM person WHERE email IN ($1)`, [email])
        if(user.rows.length === 0) {
            throw new Error('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.rows[0].password)
        if(!isPassEquals) {
            throw new Error('Неверная почта или пароль')
        }

        const tokens = tokenService.generateTokens({...user.rows[0]})

        await tokenService.saveToken(user.rows[0].id, tokens.refreshToken)

        return {
            ...tokens,
            user: user.rows[0]
        }
    }

    async logout(refreshToken: string) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }

    async getUsers(): Promise<User[]> {
        const users = await db.query(`select * from person`)

        return users.rows
    }

    async getOneUser(userId: string): Promise<User> {
        const user = await db.query(`select * from person where id = ($1)`, [userId])

        return user.rows[0]
    }

    async updateUser(id: string, email: string, firstName: string, lastName: string, password: string): Promise<User> {
        let hashedPassword = await bcrypt.hash(password, 3)
        const user = await db.query(`UPDATE person SET email = ($1), firstName = ($2), lastName = ($3), password = ($4) WHERE id = ($5) returning *`,
            [email, firstName, lastName, hashedPassword, id])
        return user.rows[0]
    }

    async deleteUser(id: string): Promise<User> {
        const user = await db.query(`delete from person where id = ($1)`, [id])
        return user.rows[0]
    }

    async createPDF(email: string): Promise<boolean | typeof Error>{
        const user = await db.query(`select * from person where email = ($1)`, [email])
        let userDto = user.rows[0]
        let fileName = v4() + '.pdf'
        const document = new pdfkit()
        document.pipe(fs.createWriteStream((fileName)))

        document.fontSize(16)
            .text(`firstname: ${userDto.firstname} \nlastname: ${userDto.lastname}`).image(path.resolve(__dirname, '..', 'static', userDto.image), {width: 300})

        // document.fontSize(16)
        //     .text(userDto.lastName)
        //
        // document.image()
        document.end()

        // pdf.create(pdfTemplate(userDto.firstname, userDto.lastname, userDto.image), {}).toFile(path.resolve(__dirname, '..', 'static', 'pdf', fileName), (err, result) => {
        //     if(err) {
        //         res.send(Promise.reject())
        //     }
        //     console.log(result)
        //     res.send(Promise.resolve())
        // })
        fs.rename(path.resolve(__dirname, '..', fileName), path.resolve(__dirname, '..', 'static', 'pdf', fileName), err => {
            console.log(err)
            if(err) throw new Error('Не удалось переместить файл')
        })
        await db.query(`UPDATE person set pdf = ($1) where id = ($2)`, [fileName, userDto.id])
        return true
    }
}

export default new UserService()
