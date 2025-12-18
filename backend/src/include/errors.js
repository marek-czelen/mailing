
import { Response } from "./response.js"

export function unauthorized(req, res, message=""){
    return res.status(401).send(new Response(null,false,`Not authorized, ${message}`))
}

export function unavailable(req, res, message=""){
    return res.status(503).send(new Response(null,false, `Not available: ${message}`))
}

export function badRequest(req, res, message=""){
    return res.status(400).send(new Response(null,false, `Bad request: ${message}`))
}

export default null