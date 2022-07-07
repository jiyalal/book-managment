const express = require("express")
const userController = require("../controller/userController")
const router = express.Router()
const bookController = require("../controller/booksController")
const validator  = require("../validator/validation")

router.get("/test", function (req, res) {
    res.send("Test api ")
})
router.post("/register",validator.userValidation, userController.createUser)
router.post('/login', userController.loginUser)
router.post("/books", bookController.createBook)
router.get("/books/:bookId",bookController.getBookById)


module.exports = router