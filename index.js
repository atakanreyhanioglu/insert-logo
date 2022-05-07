const Jimp = require('jimp') ;
const sharp = require("sharp")
const fs = require("fs");
const path = require('path');

async function insertLogo(imagePath, logoPath) {
    try {
        let imageFinalPath = imagePath
        let logoFinalPath = logoPath
        let imageSvg = false;
        let logoSvg = false;

        if(!checkExistPath(imageFinalPath)) return { status: 'error', msg: 'Image is not exist on the path.'}
        if(!checkExistPath(logoFinalPath)) return { status: 'error', msg: 'Logo is not exist on the path.'}

        if(!checkMimeTypes(imageFinalPath)) return { status: 'error', msg: 'Please retry by using an image with .png, .jpeg, .jpg, .svg extensions.' }
        if(!checkMimeTypes(logoFinalPath)) return { status: 'error', msg: 'Please retry by using an image with .png, .jpeg, .jpg, .svg extensions.' }

        if(imageFinalPath.includes('.svg')) {
            await svgToPng(imageFinalPath)
            imageFinalPath = imagePath.split('.svg')[0] + '.png'
            imageSvg = true
            console.log('Is image Svg ? Yes, it is.')
        }
        if(logoFinalPath.includes('.svg')){
            await svgToPng(logoFinalPath)
            logoFinalPath = logoPath.split('.svg')[0] + '.png'
            logoSvg = true
            console.log('Is logo Svg ? Yes, it is.')
        }
        const image = await Jimp.read(imageFinalPath);
        console.log('image read.')
        const logo = await Jimp.read(logoFinalPath);
        console.log('logo read.')

        logo.resize(140,140);
        console.log('logo resized.')

        image.composite(logo, 0, 0, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 0.6
        })
        console.log('image combined.')
        const outputPath = `${path.dirname(require.main.filename)}/output/insert-logo/`
        if (!fs.existsSync(outputPath)){
            fs.mkdirSync(outputPath, { recursive: true });
            console.log('Directory created at: ' + `${path.dirname(require.main.filename)}/output/insert-logo`)
        }
        const extension = getOriginalMimeType(image._originalMime)
        console.log('Extension checked.')
        const givenImageDir =  imageFinalPath.slice(0, imageFinalPath.lastIndexOf('/'))
        const outputNameSection = (imageFinalPath.split(`${givenImageDir}/`)[1])
        if(!outputNameSection.includes(extension)) return { status: 'error', msg: 'Please retry by using an image with its original extension.' }
        const newImageName = outputNameSection.split('.' + extension)[0] + '-il'
        console.log('Output image name created.')
        const newImagePath = `${outputPath + `${newImageName}.` + extension}`
        if(fs.existsSync(newImagePath)) {
            return {status: 'error', msg: 'You already have this image in insert-logo folder.'}
        }

        await image.writeAsync(newImagePath);
        console.log('Logo implemented.')
        if(imageSvg) {
            if(fs.existsSync(imageFinalPath)) {
                fs.unlinkSync(imageFinalPath)
            }
        }
        if(logoSvg) {
            if(fs.existsSync(logoFinalPath)) {
                fs.unlinkSync(logoFinalPath)
            }
        }
        return {status: 'success', data: image}
    }catch (e) {
        console.log(e)
        return e
    }
}

async function svgToPng(svgPath) {
      await sharp(`${svgPath}`)
            .png()
            .toFile(`${svgPath.split('.svg')[0] + '.png'}`)
}
function checkMimeTypes(path) {
    const allowedTypes = ['.svg', '.png', '.jpeg', '.jpg']
    let allowed = false;
    allowedTypes.forEach((type) => {
        if(path.includes(type)) {
            allowed = true
        }
    })
    return allowed
}
function checkExistPath(path) {
    if (!fs.existsSync(path)) {
        return false
    }
    return true
}

function getOriginalMimeType(mimeType) {
    const allowedTypes = ['svg', 'png', 'jpeg', 'jpg']
    let type = 'png';
    allowedTypes.forEach((t) => {
        if(mimeType.includes(t)) {
            type = t
        }
    })
    return type
}

module.exports = insertLogo
