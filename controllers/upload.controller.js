const { lstatSync, readdirSync } = require('fs-extra'),
    fs = require('fs-extra'),
    md5 = require('md5'),
    Promise = require(`bluebird`),
    request = require(`request`);
const { join } = require('path');
const del = require('del');
var shopListModel = require('../model/shopList');
var keywordModel = require('../model/keyword');
var phashModel = require('../model/phash');
var pmtkeyModel = require('../model/pmtkey');
var nkeyModel = require('../model/nkey');
var txtkeyModel = require('../model/txtkey');
let token = '';
var keyword = '';
const { imageHash } = require('image-hash');
const path = require('path')

const isDirectory = source => lstatSync(source).isDirectory();
const isFile = source => lstatSync(source).isFile();
const isPngFile = source => source.indexOf('.jpg') >= 0;
const isTextFile = source => source.indexOf('.txt') >= 0;
const getDirectories = source =>
    readdirSync(source).map(name => join(source, name)).filter(isDirectory);
const getFiles = source =>
    readdirSync(source).map(name => join(source, name)).filter(isFile);
var duplicatedimage = '';
var uploadstatus = false;
var willmake = 0;

class uploadController {
    async upstatus(req, res, next) {
        res.json({ status: uploadstatus })
    }
    async uploadpage(req, res, next) {
        let key = await keywordModel.find({});
        let shopList = await shopListModel.find({});
        let albumlist = await getalbum(shopList);
        let pmtkey = await pmtkeyModel.find({});
        let nkey = await nkeyModel.find({});
        let txtkey = await txtkeyModel.find({});
        // console.log(albumlist)
        res.render('upload', { key: key, albumlist: albumlist.albumlist, wxcodelist: albumlist.wxcodelist, pmtkey: pmtkey, nkey: nkey, txtkey: txtkey });
    }
    async addkey(req, res) {
        let prop = req.body.prop;
        let value = req.body.value;
        let existingkey = await keywordModel.findOne({ prop: prop });
        if (existingkey) {
            res.json({ status: false, message: 'This Key is already existing.' });
            return;
        } else {
            //save to database
            let newKey = new keywordModel();
            newKey.prop = prop;
            newKey.value = value;
            await newKey.save();
            res.json({ status: true });

        }
    }
    async addpmtkey(req, res) {
        let wxcode = req.body.wxcode;
        let pmtkey = req.body.pmtkey;
        let existingwxcode = await pmtkeyModel.findOne({ wxcode: wxcode });
        if (existingwxcode) {
            res.json({ status: false, message: 'This wx-code is already existing.' });
            return;
        } else {
            let newPmtKey = new pmtkeyModel();
            newPmtKey.wxcode = wxcode;
            newPmtKey.pmtkey = pmtkey;
            await newPmtKey.save();
            res.json({ status: true });
        }
    }
    async addnkey(req, res) {
        let wxcode = req.body.wxcode;
        let nkey = req.body.nkey;
        let newnkey = new nkeyModel();
        newnkey.wxcode = wxcode;
        newnkey.nkey = nkey;
        await newnkey.save();
        res.json({ status: true });
    }
    async addtxtkey(req, res) {
        let wxcode = req.body.wxcode;
        let existingwxcode = await txtkeyModel.findOne({ wxcode: wxcode });
        if (existingwxcode) {
            res.json({ status: false, message: 'This wx-code is already existing.' });
            return;
        } else {
            let newtxtkey = new txtkeyModel();
            newtxtkey.wxcode = wxcode;
            await newtxtkey.save();
            res.json({ status: true });
        }
    }
    async deleteItem(req, res) {
        let _id = req.body.id;
        let existingId = await keywordModel.findOne({ _id: _id });
        if (existingId) {
            await keywordModel.deleteOne({ _id: _id });
            res.json({ status: true });
        }
    }

    async deletePmtKey(req, res) {
        let _id = req.body.id;
        let existingId = await pmtkeyModel.findOne({ _id: _id });
        if (existingId) {
            await pmtkeyModel.deleteOne({ _id: _id });
            res.json({ status: true });
        }
    }

    async deletenkey(req, res) {
        let _id = req.body.id;
        let existingId = await nkeyModel.findOne({ _id: _id });
        if (existingId) {
            await nkeyModel.deleteOne({ _id: _id });
            res.json({ status: true });
        }
    }
    async deletetxtkey(req, res) {
        let _id = req.body.id;
        let existingId = await txtkeyModel.findOne({ _id: _id });
        if (existingId) {
            await txtkeyModel.deleteOne({ _id: _id });
            res.json({ status: true });
        }
    }
    async startUpload(req, res, next) {
        uploadstatus = true;
        let album_name = req.body.album_name;
        token = req.body.token;
        keyword = await keywordModel.find({});
        let albumParentFolder = `./images/` + album_name;
        if (fs.existsSync(albumParentFolder)) {
            let firstalbum = getDirectories(albumParentFolder);
            for (let i = 0; i < firstalbum.length; i++) {
                let second = getDirectories(firstalbum[i]);
                for (let j = 0; j < second.length; j++) {
                    let albumDirs = getDirectories(second[j]);
                    await uploadimg(albumDirs);
                }
            }
            console.log("uploading all done");
            del([albumParentFolder + '/**', '!./images/temp']);
            res.json({ status: true, message: 'all done', duplicatedimage: duplicatedimage });
            duplicatedimage = '';
            uploadstatus = false;
        } else {
            res.json({ status: false, message: 'There is nothing to upload' });
            return
        }
    }
}

function getalbum(shopList) {
    return new Promise((resolve) => {
        let albumlist = [];
        let wxcodelist = [];
        for (let i = 0; i < shopList.length; i++) {
            // console.log(shopList[i].AlbumName)
            if (albumlist.find((item) => {
                return item === shopList[i].AlbumName;
            })) {
                // continue;
            } else {
                albumlist.push(shopList[i].AlbumName);
            }
            if (wxcodelist.find((item) => {
                return item === shopList[i].WXCode;
            })) { }
            else {
                wxcodelist.push(shopList[i].WXCode);
            }
        }
        // return albumlist;
        resolve({ albumlist, wxcodelist });
    })
}

function uploadimg(albumDirs) {
    return new Promise((resolve) => {
        Promise.mapSeries(albumDirs.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })), dir => {
            console.log(`Starting upload album from ${dir}`);
            return new Promise(resolve => {
                setTimeout(() => {
                    handleAlbumDir({ dir })
                        .then(resolve);
                }, 500)
            })
        })
            .then(() => {
                resolve();
            });
    })
}

function getFilesFromDir(dir, fileTypes) {
    var filesToReturn = [];
    function walkDir(currentPath) {
        var files = fs.readdirSync(currentPath);
        for (var i in files) {
            var curFile = path.join(currentPath, files[i]);
            if (fs.statSync(curFile).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
                filesToReturn.push(curFile.replace(dir, ''));
            } else if (fs.statSync(curFile).isDirectory()) {
                walkDir(curFile);
            }
        }
    };
    walkDir(dir);
    return filesToReturn;
}

const uploadImage = function (args) {
    const imagePath = args.imagePath;
    const albumId = args.albumId;
    //
    const loginData = getLoginData({ path: `/photos/` });

    const options = {
        method: 'POST',
        url: `http://x.yupoo.com/api/photos?${loginData.qs}`,
        formData: {
            albumId: albumId,
            photo: fs.createReadStream(imagePath)
        }
    };
    return new Promise((resolve, reject) => {

        const r = request(options, (err, res, body) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            // console.log(body);
            resolve(body);
        });
    });
};

const createYapooAlbum = function (args) {
    const albumName = args.albumName;
    const description = args.description;

    const loginData = getLoginData({ path: `/albums/` });
    const options = {
        method: 'POST',
        url: `http://x.yupoo.com/api/albums?${loginData.qs}`,
        json: {
            name: albumName,
            description: description
        },
    };
    return new Promise((resolve, reject) => {

        request(options, (err, res, body) => {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            // console.log(body);
            resolve(body);
        });
    });
};

const getLoginData = function (args) {
    const path = args.path;
    const openId = `4e6895405880ee4e1de7a5a9fd7fb8c0`;
    const appId = `10014`;
    const appKey = `69c939768913c59cd118728c12443340822cf010`;
    const sign = md5(`${token}${path}openId=${openId}${appKey}`);
    return {
        token,
        openId,
        sign,
        qs: `token=${token}&openId=${openId}&sign=${sign}`
    }
};

const readFilePromise = function (args) {
    const filePath = args.filePath;
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, `utf8`, function read(err, data) {
            if (err) {
                reject(err);
            }
            // console.log(data);
            resolve(data);
        });
    })
};

const guessName = function (args) {
    const description = args.description;
    for (let i = 0; i < keyword.length; i++) {
        let key = keyword[i].prop;
        if (description.indexOf(key) >= 0) {
            return keyword[i].value;
        }
    }
    return `MISSING_KEYWORD`;
};

function xxx(image, albumId, albumName) {
    return new Promise((resolve, reject) => {
        imageHash(image, 16, true, async (error, data) => {
            if (error) {
                console.log('error', error)
                resolve();
            }
            // console.log(data);
            let existingphash = await phashModel.findOne({ phash: data });
            if (existingphash) {
                console.log('This image is already uploaded.')
                duplicatedimage += image.replace(/\\/g, "/") + '\n';
            }
            else {
                //save to database
                let newPhash = new phashModel();
                newPhash.phash = data;
                await newPhash.save();
                console.log(`uploading image ${image} to album ${albumName} ${albumId}`);
                await uploadImage({ albumId: albumId, imagePath: image });
            }
            resolve();
        })
    })
}

function willmakeDir(image) {
    return new Promise((resolve, reject) => {
        imageHash(image, 16, true, async (error, data) => {
            if (error) {
                console.log('error', error);
                resolve();
            }
            let existingphash = await phashModel.findOne({ phash: data });
            if (existingphash) {
                console.log('This image is already uploaded.')
                duplicatedimage += image.replace(/\\/g, "/") + '\n';
                willmake++;
            } else {

            }
            resolve();
        })
    })
}

function findnkey(nkey, data) {
    return new Promise((resolve, reject) => {
        let nkeynum = 0;
        for (let i = 0; i < nkey.length; i++) {
            if (data.indexOf(nkey[i].nkey) >= 0) {
                nkeynum++;
            }
        }
        resolve(nkeynum);
    })
}

const handleAlbumDir = function (args) {
    const dir = args.dir;
    const files = getFiles(dir);
    const images = files.filter(isPngFile);
    const textFile = files.filter(isTextFile)[0];
    return readFilePromise({ filePath: textFile })
        .then(async data => {
            willmake = 0;
            let albumNameAndCategory = '';
            let existingtxt = await txtkeyModel.findOne({ wxcode: dir.split('/')[3] })
            console.log('text length:', data.trim().length)
            if (existingtxt && data.trim().length < 20) {
                console.log('This description length less than 20.', 'Skipped.')
            } else {
                const description = data;
                let pmtkey = await pmtkeyModel.findOne({ wxcode: dir.split('/')[3] });
                if (pmtkey) {
                    albumNameAndCategory = pmtkey.pmtkey;
                } else {
                    albumNameAndCategory = guessName({ description });
                }

                let nkey = await nkeyModel.find({ wxcode: dir.split('/')[3] });
                if (nkey) {
                    let isnkey = await findnkey(nkey, data);
                    if (isnkey > 0) {
                        console.log(`Including the Negative key. Skipped.`);
                    } else {
                        if (images.length > 1) {
                            for (let i = 0; i < images.length; i++) {
                                let image = images[i];
                                await willmakeDir(image);
                            }
                            if (willmake < 1) {
                                console.log(`starting to create album ${albumNameAndCategory}`);
                                return createYapooAlbum({ albumName: albumNameAndCategory, description })
                                    .then(async albumResp => {
                                        try {
                                            const albumId = albumResp.data.id;
                                            const albumName = albumResp.data.name;
                                            for (let i = 0; i < images.length; i++) {
                                                let image = images[i];
                                                await xxx(image, albumId, albumName);
                                            }
                                            console.log(`script finished uploading ${images.length} images to album  ${albumName} ${albumId}`)
                                        } catch {
                                            console.log('unknow error', '')
                                        }
                                    });
                            }
                            else {
                                console.log('This folder already uploaded.');

                            }
                        } else {
                            console.log('This folder has only 1 image.', 'Skipped')
                        }
                    }
                } else {
                    if (images.length > 1) {
                        for (let i = 0; i < images.length; i++) {
                            let image = images[i];
                            await willmakeDir(image);
                        }
                        if (willmake < 1) {
                            console.log(`starting to create album ${albumNameAndCategory}`);
                            return createYapooAlbum({ albumName: albumNameAndCategory, description })
                                .then(async albumResp => {
                                    const albumId = albumResp.data.id;
                                    const albumName = albumResp.data.name;
                                    for (let i = 0; i < images.length; i++) {
                                        let image = images[i];
                                        await xxx(image, albumId, albumName);
                                    }
                                    console.log(`script finished uploading ${images.length} images to album  ${albumName} ${albumId}`)
                                });
                        }
                        else {
                            console.log('This folder already uploaded.');

                        }
                    } else {
                        console.log('This folder has only 1 image.', 'Skipped')
                    }
                }

            }
        })
};

module.exports = uploadController;

// bc0ec5b323c236bbf91d39138c5a66a42ea8ce94
// belt 24bf0d828bd1f42baaea81324a96bb5e4f279474
// fashinista b317b8e1d8c51a5a212fb8116cbb6221c0fe7a8b
