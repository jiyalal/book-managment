const userModel = require("../models/userModel")
const mongoose = require('mongoose')

// <=======================validation Function=================================================>
const isValidString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (!(/^[A-Za-z-._,@& ]+$/.test(value))) {
        return false
    }
    return true;
}
exports.userValidation = async function (req, res, next) {
    let data = req.body


    const fieldAllowed = ["title", "name", "phone", "email", "password"]
    const keyOf = Object.keys(data);
    const receivedKey = fieldAllowed.filter((x) => !keyOf.includes(x));
    if (receivedKey.length) {
        return res.status(400).send({ status: "false", msg: `${receivedKey} field is missing` });
    }
    let { title, name, phone, email, password } = data

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "body can not be empty" })
    /**************************title field validation*************************/

    if (!title.trim()) return res.status(400).send({ status: false, msg: "title field cannot be empty" })

    if (!/^(Mr|Miss|Mrs)*$/.test(title)) return res.status(400).send({ status: false, msg: "title field will accept only Mr or Miss or Mrs" })

    /**************************title field validation*************************/

    /**************************name field validation*************************/



    if (!/^[a-zA-Z .']{2,15}$/.test(name)) { return res.status(400).send({ status: false, msg: `${name} please enter valid name` }) }
    if (!name.trim()) { return res.status(400).send({ status: false, msg: "Name field cannot be empty" }) }
    if (name.includes("  ")) { return res.status(400).send({ status: false, msg: "Name format is not valid" }) }
    /**************************name field validation*************************/

    /**************************Phone field validation*************************/

    if (!/^[6789]\w{9}$/.test(phone)) return res.status(400).send({ status: false, msg: `${phone} phone number should be present or valid` })

    let findPhoneNumber = await userModel.findOne({ phone: phone }).select({ phone: 1 })

    if (findPhoneNumber) return res.status(400).send({ status: false, msg: "phone number is already present in our data base" })

    /**************************Phone field validation*************************/

    /**************************email field validation*************************/


    if (!/^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(email)) return res.status(400).send({ status: false, msg: `${email} email is not valid email` })

    let findEmail = await userModel.findOne({ email: email }).select({ email: 1 })

    if (findEmail) return res.status(400).send({ status: false, msg: "Email is already present in our data base" })

    /**************************email field validation*************************/

    /**************************Password field validation*************************/

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,15}$/.test(password)) return res.status(400).send({ status: false, msg: `${password} password should be strong contains a special character,number and min 8 character and should be valid` })

    /**************************Password field validation*************************/


    /**************************Address field validation*************************/
    /*************Street validation*************/
    if (data.address) {
        if (Object.keys(data.address).length != 3) { return res.status(400).send({ status: false, msg: `address must have city street and pincode` }) }
        if (!/^[a-zA-Z .,-_]{2,15}$/.test(data.address["street"])) return res.status(400).send({ status: false, msg: `${data.address["street"]} please enter valid street name` })
        /*************Street validation*************/

        /*************City validation*************/

        if (!/^[a-zA-Z .-_]{2,20}$/.test(data.address["city"])) return res.status(400).send({ status: false, msg: `${data.address["city"]} is not valid city name please enter valid city name` })
        /*************City validation*************/

        /*************Pincode validation*************/

        if (!/\d[1-6]/.test(data.address["pincode"])) return res.status(400).send({ status: false, msg: ` please enter valid pincode` })
        /*************Pincode validation*************/
    }
    next();
}
/************************Start's Review Validation****************************/
exports.reviewValidation = async function (req, res, next) {
    try {
        const fieldAllowed = ["reviewedBy", "rating"];
        const data = req.body;
        const keyOf = Object.keys(data);
        const receivedKey = fieldAllowed.filter((x) => !keyOf.includes(x));
        if (receivedKey.length) {
            return res
                .status(400)
                .send({ status: "false", msg: `${receivedKey} field is missing` });
        }
        const { reviewedBy, rating } = data

        if (!(/^[A-Za-z ]{1,15}$/.test(reviewedBy))) return res.status(400).send({ status: false, msg: "reiviewedBy can't be blank or invalid😵‍💫😵‍💫" })
        if (!(/^[1-5]{1,1}$/.test(rating))) return res.status(400).send({ status: false, msg: "enter valid ratings🤷‍♂️🤷‍♂️" })
        next();
        /************************End Review Validation****************************/
    } catch (err) {
        res.status(500).send(err.message)
    }
}
/************************start's Put Review Validation****************************/
exports.putReviewValidation = async function (req, res, next) {

    try {
        let updateReviewData = req.body
        let { review, rating, reviewedBy } = updateReviewData
        if (review) {

            if (!isValidString(review)) { return res.status(400).send({ status: false, msg: `${review} review should be only string formate` }) }
        }

        if (rating) {
            if (typeof rating !== "number") { return res.status(400).send({ status: false, msg: "rating will  only Number" }) }
            if (!(/^[1-5]{1,1}$/.test(rating))) { return res.status(400).send({ status: false, msg: `${rating} rating must be 1 to 5 only` }) }
        }
        if (reviewedBy) {

            if (!isValidString(reviewedBy)) { return res.status(400).send({ status: false, msg: `${reviewedBy} reviever name should be only string formate` }) }
            next();
        }
        /************************End Put Review Validation****************************/
    } catch (Error) {
        res.status(500).send({ status: false, msg: Error.message })
    }
}