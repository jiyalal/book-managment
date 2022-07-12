const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")

/**************************************Start's Create User Api's😍😊****************************************/
exports.createUser = async function (req, res) {

    try {
        let data = req.body

        let savedData = await userModel.create(data);

        res.status(201).send({ status: true, message: 'Success', data: savedData })
    } catch (Error) {
        res.status(500).send({ status: false, msg: Error.message })
    }
}

/**************************************End Create User Api's😍😊****************************************/

/**************************************Start's Login User Api's😍😊****************************************/
exports.loginUser = async function (req, res) {
    try {
        let email = req.body.email

        let password = req.body.password

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: 'body can not be empty' })
        }
        if(!email){return res.status(400).send({status:false,msg:"email is missing"})}
        if(email){if (!email.trim()) return res.status(400).send({ status: false, msg: 'email must be present' })}
        if(!password){return res.status(400).send({status:false,msg:"password is missing"})}
        
        if (!password.trim()) return res.status(400).send({ status: false, msg: 'password must be present' })
        let user = await userModel.findOne({ email: email, password: password })

        if (!user) return res.status(404).send({ status: false, msg: "No user exist according to given details" })

        let token = jwt.sign({
            id: user._id.toString(),
            batch: "radon",
            organization: "functionUp"
        }, "GroupNo-27", { expiresIn: '1h' })

        res.setHeader("x-api-key", token);

        res.status(200).send({ status: true, message: 'Success', data: token })

    } catch (err) {
        res.status(500).send(err.message)
    }
}

/**************************************End Login User Api's😍😊****************************************/