const imageToBase64 = require('image-to-base64');
const path = require('path');

module.exports.imgEncoding = async (req) => {
    try{
        const imagePath = path.resolve(`./image/${req.imgPath}`);
        const res = await imageToBase64(imagePath)
        const dataUrl = `data:image/jpeg;base64,${res}`
        return dataUrl
      } catch(err){
        console.log(err);
      }
    }