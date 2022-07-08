const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const bookController = require("../controller/booksController")
const reviewController = require("../controller/reviewcontroller")
const auth = require('../middleware/auth')
const validator  = require("../validator/validation")

router.post("/register", validator.userValidation, userController.createUser)
router.post('/login', userController.loginUser)

/************BOOK ROUTER👍************/
router.post("/books",auth.Authenticate,bookController.createBook)
router.get("/books",auth.Authenticate,bookController.getBook)

/*********************Review ROUTER**********************/
router.post("/books/:bookId/review", validator.reviewValidation, reviewController.createReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)



router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you request is not available"
    })
})

module.exports = router
