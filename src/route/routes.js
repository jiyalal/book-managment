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
router.get("/books/:bookId",auth.Authenticate,bookController.getBookById)
router.delete("/books/:bookId",auth.Authenticate,auth.Authorization,bookController.deleteBooks)
router.put('/books/:bookId',auth.Authenticate,auth.Authorization,bookController.updateBooks)


/*********************Review ROUTER**********************/
router.post("/books/:bookId/review", validator.reviewValidation, reviewController.createReview)
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)
router.put("/books/:bookId/review/:reviewId",validator.putReviewValidation,reviewController.UpdateRiew)

router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you request is not available"
    })
})

module.exports = router
