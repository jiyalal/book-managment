const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const bookModel = require("../models/booksModel")
const userModel = require("../models/userModel")


exports.Authenticate = function (req, res, next) {


    try
    {
        let token = req.headers["x-api-key"];
        if (!token)
        {
            return res.status(401).send({ status: false, msg: "token is not present in headers" });
        } else
        {
            const decodedToken = jwt.verify(token, "GroupNo-27",

                function (err, token) {
                    if (err){return res.status(401).send({status: false, msg: "invalid token"})
                        } 
                        req.loggedInUserId = token.id
                        next()
                    
                }
            );
        }
       
    } catch (err)
    {
        res.status(500).send(err.message);
    }

}

exports.Authorization = async function (req, res, next) {
    try
    {
        let token = req.headers["x-api-key"]
        let decodedtoken = jwt.verify(token, "GroupNo-27")
        let loggedInUserId = decodedtoken.id
        let bookId = req.params.bookId
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: 'please put a valid ObjectId' })
        let findBook = await bookModel.findOne({ _id: bookId }).select({ userId: 1, _id: 0 })
        let verifyId = findBook.userId.toString()
        // console.log(verifyId)
        if (loggedInUserId !== verifyId) return res.status(403).send({ status: false, msg: "the user is unauthorized" })

        next();
    } catch (err)
    {
        res.status(500).send(err.message)
    }
}

