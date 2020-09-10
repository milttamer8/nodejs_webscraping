var request = require('request');
var jar = request.jar();
var fs = require('fs');
const http = require('http');
var goodsModel = require('../model/goods');
var shopListModel = require('../model/shopList');
const zipFolder = require('zip-a-folder');
const del = require('del');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
let month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
var date = new Date();
var today = date.getDate() + '.' + month[date.getMonth()] + '.' + date.getFullYear();
var current = today + '(' + date.getHours() + 'h' + date.getMinutes() + 'm)';
var working = 'finished';
var downloaded_img = 'false';
var downloaded_csv = 'false';
var update_num = [];
var prev = '';
var ss = 0;
let ii = 0;
var total_num = 0;


class mainController {
    async isJSON(text) {
        if (!text) return false;
        if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
            return true;
        } else {
            return false;
        }
    }
    async getstatus(req, res, nex) {
        console.log(ii);
        if (prev == ii && working == "working") {
            console.log('Same status');
            ss++;
            console.log(ss);
            if (ss > 13) {
                ii++;
                console.log('goto next step');
                startScraping();
            }
        } else {
            prev = ii;
            ss = 0;
        }
        res.json({ status: true, message: working, updates: update_num, downloaded_csv: downloaded_csv, downloaded_img: downloaded_img })
    }
    async downloadfile(req, res, next) {
        downloaded_img = 'true';
        var date = new Date();
        let today = date.getDate() + '.' + month[date.getMonth()] + '.' + date.getFullYear();
        await zipFolder.zipFolder('./images', './images/' + today + '-images' + '.zip', (err) => {
            del(['./images/**', '!./images/' + today + '-images' + '.zip']);
            res.json({ status: true, error: err });
        });
        // setTimeout(function () {  }, 21600000);

    }
    async downloadcsv(req, res, next) {
        downloaded_csv = 'true';
        var date = new Date();
        let today = date.getDate() + '.' + month[date.getMonth()] + '.' + date.getFullYear();
        await zipFolder.zipFolder('./update', './update/' + today + '-Excel' + '.zip', (err) => {
            del(['./update/**', '!./update/' + today + '-Excel' + '.zip']);
            res.json({ status: true, error: err });
        });
        // setTimeout(function () { }, 21600000);
    }
    async home(req, res, next) {
        let shop_list = await shopListModel.find({});
        res.render('index', { shop_list: shop_list, updates: update_num });

    }
    async addUrl(req, res) {
        let shopURL = req.body.url;
        let WXCode = req.body.wxcode;
        let Des = req.body.description;
        let AlbumName = req.body.albumname;
        let existingUrl = await shopListModel.findOne({ shopURL: shopURL });
        let existingWXCode = await shopListModel.findOne({ WXCode: WXCode });
        if (existingUrl) {
            res.json({ status: false, message: 'This URL is already existing.' });
            return;
        } else if (existingWXCode) {
            res.json({ status: false, message: 'This WX-Code is already existing.' });
            return;
        }
        else {
            //save to database
            let newShopList = new shopListModel();
            newShopList.shopURL = shopURL;
            newShopList.Description = Des;
            newShopList.WXCode = WXCode;
            newShopList.AlbumName = AlbumName;
            await newShopList.save();
            res.json({ status: true });

        }
    }
    async deleteItem(req, res) {
        let _id = req.body.id;
        let existingId = await shopListModel.findOne({ _id: _id });
        if (existingId) {
            await shopListModel.deleteOne({ _id: _id });
            res.json({ status: true });
        }
    }
    async getadata(req, res, next) {
        let shopList = await shopListModel.find({});
        res.json({ status: true, shop_list: shopList })
    }
    async startScraping(res) {
        downloaded_img = 'true';
        downloaded_csv = 'true';
        working = 'working';
        let shop_list = await shopListModel.find({});
        update_num = [];
        for (let kk = 0; kk < shop_list.length; kk++) {
            update_num.push('NAN');
        }
        await startScraping();
    };
}

async function startScraping() {

    var date = new Date();
    let today = date.getDate() + '.' + month[date.getMonth()] + '.' + date.getFullYear();
    let shop_list = await shopListModel.find({});
    total_num = 0;
    if (ii < shop_list.length) {
        while (ii < shop_list.length) {
            // console.log()
            let url = shop_list[ii].shopURL.trim();
            let size = 100;
            let description = shop_list[ii].Description;
            let albumname = shop_list[ii].AlbumName.trim();
            let wxcode = shop_list[ii].WXCode.trim();
            console.log(wxcode, url);
            let num = 0;
            const records = [];
            var date1 = new Date();
            let today1 = date1.getDate() + '.' + month[date1.getMonth()] + '.' + date1.getFullYear();
            let current = today1 + '(' + date1.getHours() + 'h' + date1.getMinutes() + 'm)';
            const csvWriter = createCsvWriter({
                path: './update/' + wxcode + '-' + current + '.csv',
                header: [
                    { id: 'no', title: 'No.' },
                    { id: 'wxcode', title: 'WX-Code' },
                    { id: 'des', title: 'Description' },
                    { id: 'good_id', title: 'Good ID' },
                    { id: 'imgs', title: 'Image URL' }
                ]
            });

            await openSiteForToken();
            //parse shop id
            let url_split = url.split('/');
            let shop_id = url_split[url_split.length - 1];
            let album_url = 'https://www.szwego.com/service/album/get_album_themes_list.jsp?act=single_album&shop_id=' + shop_id + '&search_value=&search_img=&start_date=&end_date=&tag=[]&page_index=1&from_id=';
            let album_result = await getAlbumList(album_url);
            try {
                album_result = JSON.parse(album_result);
            } catch (e) {
                console.log('not json');
                continue;
            }

            let goods_list = album_result.result.goods_list;
            while (goods_list.length < size) {
                let time_stamp = goods_list[goods_list.length - 1].time_stamp;
                album_url = 'https://www.szwego.com/service/album/get_album_themes_list.jsp?act=single_album&shop_id=' + shop_id + '&search_value=&search_img=&start_date=&end_date=&tag=[]&page_index=1&from_id=&time_stamp=' + time_stamp;
                let album_result2 = await getAlbumList(album_url);
                try {
                    album_result2 = JSON.parse(album_result2);
                    let goods_list2 = album_result2.result.goods_list;
                    goods_list = goods_list.concat(goods_list2);
                }
                catch{
                    console.log('json parse error.')
                    continue;
                }

            }
            console.log('count of loaded blocks: ' + goods_list.length);
            for (let i = 0; i < goods_list.length; i++) {
                let good = goods_list[i];
                let title = good.title;
                let imgs = good.imgsSrc;
                if (i >= size) break;
                //download images
                for (let j = 0; j < imgs.length; j++) {
                    let existingimgs = await goodsModel.findOne({ imgsSrc: imgs[j] });
                    let existingGoodID = await goodsModel.findOne({ goods_id: good.goods_id });
                    // console.log(imgs)
                    if (existingGoodID && existingimgs) {
                        console.log('this image alreay downloaded');
                        // continue;
                    } else {
                        // make folder
                        let directory = './images/' + albumname;
                        if (!fs.existsSync(directory)) {
                            fs.mkdirSync(directory);
                        }
                        //make subfolder with date
                        let direct = './images/' + albumname + '/' + today;
                        if (!fs.existsSync(direct)) {
                            fs.mkdirSync(direct);
                        }
                        //make sub folder
                        let subdir = './images/' + albumname + '/' + today + '/' + wxcode;
                        if (!fs.existsSync(subdir)) {
                            fs.mkdirSync(subdir);
                        }
                        let dir = './images/' + albumname + '/' + today + '/' + wxcode + '/' + good.goods_id;
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir);
                        }
                        //write text in txt file
                        fs.writeFile(dir + '/title.txt', wxcode + ' ' + title, (err) => {
                            if (err) {
                                console.error(err)
                            }
                            //file written successfully
                        })
                        let goodData = new goodsModel();
                        goodData.goods_id = good.goods_id;
                        goodData.imgsSrc = imgs[j];
                        await goodData.save();
                        num++;
                        records.push({ no: num, wxcode: wxcode, des: description, good_id: good.goods_id, imgs: imgs[j] });
                        try {
                            await downloadImages(imgs[j], dir, j);
                        } catch (err) {
                            console.log(err);
                            continue;
                        }
                    }
                }
            }
            console.log(num)
            update_num[ii] = num;
            total_num += num;
            csvWriter.writeRecords(records)       // returns a promise
                .then(() => {
                    console.log('CSV is created');
                });
            ii++;
        }//for loop 
    } else {
        ii = 0;
        console.log('all done');
        console.log(update_num);
        console.log(`Today ${total_num} images downloaded.`)
        console.log(ii);
        working = 'finished';
        downloaded_img = 'false';
        downloaded_csv = 'false';
        // res.json({ status: true })
    }
    return
}
// open the site to get token
function openSiteForToken() {
    let url = 'https://www.szwego.com';
    let options = {
        url: url,
        method: 'GET',
        headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36',
            cookie: 'token=REIxRTVGMkFEMzZBNEExRDU5Njc1NTRCMjFFNzI0NDcwQzc4MjJCQzZGNzYxMjBEQkI4Rjc3NEI0QjExQUQyQjc0RkM4RDdFNjMwM0MyOEQwQ0Y0NzFDMDIzOEU5QTU4; Max-Age=315360000; Expires=Sun, 19-Aug-2029 11:02:20 GMT; Path=/'
        },
        jar: jar
    }
    return new Promise(resolve => {
        request(options, function (error, response, body) {
            resolve();
        });
    })
}

//get album list function
function getAlbumList(url) {
    let options = {
        url: url,
        method: 'GET',
        headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36',
            cookie: 'token=REIxRTVGMkFEMzZBNEExRDU5Njc1NTRCMjFFNzI0NDcwQzc4MjJCQzZGNzYxMjBEQkI4Rjc3NEI0QjExQUQyQjc0RkM4RDdFNjMwM0MyOEQwQ0Y0NzFDMDIzOEU5QTU4; Max-Age=315360000; Expires=Sun, 19-Aug-2029 11:02:20 GMT; Path=/'
        },
        jar: jar
    }
    return new Promise(resolve => {
        request(options, function (error, response, body) {
            if (error) {
                console.log(error)
            }
            resolve(body);
        });
    })

}
//download image function
function downloadImages(url, dir, index) {
    return new Promise((resolve, reject) => {
        var download = function (uri, filename, callback) {
            request.head(uri, async function (err, res, body) {
                if (err) console.log('Error occured while downloading ' + uri)
                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
        };
        download(url, dir + '/' + index + '.jpg', function () {
            console.log(dir + '/' + index + '.jpg' + ' downloaded. ')
            resolve('');
        });
    })
}

module.exports = mainController;