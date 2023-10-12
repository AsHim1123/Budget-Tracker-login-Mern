const express = require("express");
const { adddTransaction, getAllTransaction, editTransaction, deleteTransaction } = require("../controllers/transactionCtrl");

//router object
const router = express.Router();

//add transaction POST

router.post("/add-transaction", adddTransaction);

//edit transaction POST
router.post("/edit-transaction", editTransaction);

//delete transaction POST
router.post("/delete-transaction", deleteTransaction);

//get transaction POST
router.post("/get-transaction", getAllTransaction);

module.exports = router;
