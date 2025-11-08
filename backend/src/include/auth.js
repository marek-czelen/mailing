
import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"

export class Auth {
    static privateKey = "qSVfGKmHzdwfcVxFFL1eSdMKFRQtx4m1TtxhJfz2yVVjtyMhBpqeLpbx0h0bN5Wv";

    static decodeToken(token) {
        let decodedToken = null
        decodedToken = jwt.verify(token, Auth.privateKey)
        return decodedToken
    }

    static generateToken(data) {
        if (!data) return null
        if (Array.isArray(data)) return null
        data.validUntil = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // ważny 24h
        let token = jwt.sign(
            { exp: data.validUntil, data: data }, Auth.privateKey); //30sek.
        return token
    }



    static async login(email, password) {
        let returnValue = false;
        const user = await User.findOne({ where: { email: email } });
        if (!user) return false
        if (await bcrypt.compare(password, user.hash)) {
            returnValue = Auth.generateToken({ userEmail: user.email })
        }
        return returnValue
    }


}

export default Auth