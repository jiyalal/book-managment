const bookModel = require("../models/booksModel")
const reviewModel = require('../models/reviewModel')
const userModel = require('../models/userModel')
const mongoose = require("mongoose")
const moment = require("moment")

const ObjectId = mongoose.Types.ObjectId



// const isvalid = function (value) {
//     if (typeof value === "undefined" || typeof value === null) return false
//     if (typeof value !== "string" || value.trim().length === 0) return false
//     return true
// }
// const isValidString = function (value) {
//     if (typeof value === 'string' && value.trim().length === 0) return false
//     if (!(/^[A-Za-z-._,@&]+$/.test(value))) {
//         return false
//     }
//     return true;
// }
const isValid = (str) => {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
}
const rexIsbn = /^[1-9][0-9]{9,14}$/
const nRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z])$/
const dateMatch = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
exports.createBook = async function (req, res) {
    try {
  
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title    cannot be empty" })
        }
        const foundTitle = await bookModel.findOne({ title })
        if (foundTitle) {
            return res.status(400).send({ status: false, msg: "This title is alreay being used" })
        }
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "excerpt cannot be empty" })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId cannot be empty" })
        }
        if (!mongoose.isValidObjectId(userId))  {
            return res.status(400).send({ status: false, msg: "Invalid userId" })
        }

        const userFound = await userModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN cannot be empty" })
        }
        if (!rexIsbn.test(ISBN)) return res.status(400).send({ status: false, msg: "ISBN is invalid use 10 to 15 digit ISBN" })
        const foundISBN = await bookModel.findOne({ ISBN })
        if (foundISBN) {
            return res.status(400).send({ status: false, msg: "This ISBN is already being used" })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "category cannot be empty" })
        }
        if (!nRegex.test(category)) {
            return res.status(400).send({ status: false, msg: "catgory contains invalid character" })
        }
        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, msg: "subcategory cannot be empty" })
        }
        if (!nRegex.test(subcategory)) {
            return res.status(400).send({ status: false, msg: "subcatgory contains invalid character" })
        }
        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, msg: "releasedAt cannot be empty" })
        }
        if (!dateMatch.test(releasedAt)) {
            return res.status(400).send({ status: false, msg: "releasedAt is in invalid format" })
        }
        let bookCreated = await bookModel.create({ title, excerpt, userId, ISBN, category, subcategory, releasedAt })
        if (moment(releasedAt) > moment()) return res.status(400).send({ status: false, msg: "releasedAt cannot be in future" })
        let noDate = moment().format(releasedAt, "YYYYMMDD")
        bookCreated = bookCreated.toObject()
        bookCreated.releasedAt = noDate
        res.status(201).send({ status: true, message: 'Success', data: bookCreated })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })

    }

}

exports.getBook = async function (req, res) {
    try {
        let filters = req.query

        if (Object.keys(filters).length === 0) {

            let books = await bookModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

            if (books.length == 0) { return res.status(404).send({ status: false, msg: "No result found" }) }
            let sortedBooks = books.sort(function (a, b) {
                var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                if (titleA < titleB) {
                    return -1; //titleA comes first
                }
                if (titleA > titleB) {
                    return 1; // titleB comes first
                }
                return 0;
            })
            return res.status(200).send({ status: true, data: sortedBooks })

        } else {
            Object.keys(filters).forEach(x => filters[x] = filters[x].trim())
            if (filters.userId) {
                if (filters.userId.length !== 24) { return res.status(400).send({ status: false, msg: " UserId Invalid " }) }
            }

            if (filters.subcategory) {
                if (filters.subcategory.includes(",")) {
                    let subcatArray = filters.subcategory.split(",").map(String).map(x => x.trim())
                    filters.subcategory = { $all: subcatArray }
                }
            }
        }
        filters.isDeleted = false;
        let filteredBooks = await bookModel.find(filters).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (filteredBooks.length === 0) return res.status(404).send({ status: false, msg: "No such data available" })
        else {
            let sortedBooks = filteredBooks.sort(function (a, b) {
                var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                if (titleA < titleB) {
                    return -1; //titleA comes first
                }
                if (titleA > titleB) {
                    return 1; // titleB comes first
                }
                return 0;
            })
            return res.status(200).send({ status: true, data: sortedBooks })

        }

    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}

exports.getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!(ObjectId.isValid(bookId))) return res.status(400).send({ status: false, msg: 'Enter a valid ObjectId' })
        let findBook = await bookModel.findOne({ _id: bookId }).select({ deletedAt: 0 })
        if (!findBook) return res.status(404).send({ status: false, msg: "no data found" })
        let findReview = await reviewModel.find({ bookId: bookId })

        let result = { ...findBook.toJSON(), reviewsData: findReview }

        res.status(200).send({ status: true, message: "Book-list", data: result })


    } catch (err) {
        res.status(500).send(err.message)
    }
}
// <=============================DeleteBooks==================================================>

exports.deleteBooks = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const isValidBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!isValidBookId) {
            return res.status(404).send({ status: false, msg: "book is not available" })
        }
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, msg: `${bookId} is not a valid ObjectId😥😥` })

        const deleteBook = await bookModel.findByIdAndUpdate(bookId, { isDeleted: true, deletedAt: new Date() },
            { new: true })
        res.status(200).send({ status: true, msg: "Book successfully deleted😍😍", })
    }
    catch (err) {

        res.status(500).send({ msg: err.message })
    }
}
// <=============================UpdateBooks==================================================>

exports.updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId
        // if (bookId== null||bookId=="") { 
        //     return res.status(400).send(" BookId is not available")
        //  }
        if (bookId.length != 24) {
            return res.status(400).send(" BookId Invalid ")
        }
        let book = await bookModel.findById(bookId);
        if (Object.keys(book).length == 0 || book.isDeleted == true) {
            return res.status(404).send(" No such data found ")
        }
        let reqData = req.body;
       
        let upData = {};
        if (reqData.title) {
            const foundTitle = await bookModel.findOne({ title:reqData.title })
            if (foundTitle) {
                return res.status(400).send({ status: false, msg: "This title is alreay being used" })
            }
            upData.title = reqData.title;
        }
        if (reqData.excerpt) {
            upData.excerpt = reqData.excerpt;
        }
        if (reqData.ISBN) {
            if (!rexIsbn.test(reqData.ISBN)) return res.status(400).send({ status: false, msg: "ISBN is invalid use 10 to 15 digit ISBN" })
            const foundISBN = await bookModel.findOne({ ISBN:reqData.ISBN})
            if (foundISBN) {
                return res.status(400).send({ status: false, msg: "This ISBN is already being used" })
            }
            upData.ISBN = reqData.ISBN;
        }
        if (reqData.releasedAt) {
            if (!dateMatch.test(reqData.releasedAt)) {
                return res.status(400).send({ status: false, msg: "releasedAt is in invalid format" })
            }
            upData.releasedAt = reqData.releasedAt;
        }

        if (Object.keys(upData).length == 0) {
            return res.status(400).send(" No data to update ")
        }
        // upData.releasedAt = new Date()
        let updated = await bookModel.findOneAndUpdate({ _id: bookId }, upData, { new: true })
        res.status(200).send({ status: true, Data: updated })


    }
    catch (err) {
        res.status(500).send({ msg: err.message })
    }

}



