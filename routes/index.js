var express = require('express');
var router = express.Router();
var mainController = require('../controllers/main.controller');
var uploadController = require('../controllers/upload.controller');
var main = new mainController();
var upload = new uploadController();

/* GET home page. */
//GET requests
router.get('/', main.home);
router.get('/uploadpage', upload.uploadpage);
router.get('/startScraping', main.startScraping);
router.get('/getdata', main.getadata);
router.get('/download', main.downloadfile);
router.get('/downloadexecl', main.downloadcsv);
router.get('/getstatus', main.getstatus);
router.get('/upstatus', upload.upstatus);

/* POST requests */
router.post('/upload', upload.startUpload);
router.post('/addurl', main.addUrl);
router.post('/addkey', upload.addkey);
router.post('/deleteitem', main.deleteItem);
router.post('/deletekey', upload.deleteItem);
router.post('/addpmt', upload.addpmtkey);
router.post('/deletepmtkey', upload.deletePmtKey);
router.post('/addnkey', upload.addnkey);
router.post('/deletenkey', upload.deletenkey);
router.post('/addtxtkey', upload.addtxtkey);
router.post('/deletetxtkey', upload.deletetxtkey);


module.exports = router;
