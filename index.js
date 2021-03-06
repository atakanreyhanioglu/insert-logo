const Jimp = require('jimp') ;
const sharp = require("sharp")
const fs = require("fs");
const path = require('path');

async function insertLogo(imagePath, logoPath, options) {
    try {
        let imageFinalPath = imagePath
        let logoFinalPath = logoPath
        let imageSvg = false;
        let logoSvg = false;

        const defaultOptions = {
            logo_size: 'M',
            logo_position: 'top-left',
            logo_opacity: 0.8,
            override: false
        }
        const finalOptions = {
            logo_size: options.logo_size ? options.logo_size : defaultOptions.logo_size,
            logo_position: options.logo_position ? options.logo_position : defaultOptions.logo_position,
            logo_opacity: options.logo_opacity ? options.logo_opacity : defaultOptions.logo_opacity,
            override: options.override ? options.override : defaultOptions.override
        }
        const resultOption = checkOptions(finalOptions)
        if(resultOption.status === 'error') return { status: 'error', msg: resultOption.msg}

        if(!checkExistPath(imageFinalPath)) return { status: 'error', msg: 'Image is not exist on the path.'}
        if(!checkExistPath(logoFinalPath)) return { status: 'error', msg: 'Logo is not exist on the path.'}

        if(!checkMimeTypes(imageFinalPath)) return { status: 'error', msg: 'Please retry by using an image with .png, .jpeg, .jpg, .svg extensions.' }
        if(!checkMimeTypes(logoFinalPath)) return { status: 'error', msg: 'Please retry by using an image with .png, .jpeg, .jpg, .svg extensions.' }

        if(imageFinalPath.includes('.svg')) {
            await svgToPng(imageFinalPath)
            imageFinalPath = imagePath.split('.svg')[0] + '.png'
            imageSvg = true
         //   console.log('Is image Svg ? Yes, it is.')
        }
        if(logoFinalPath.includes('.svg')){
            await svgToPng(logoFinalPath)
            logoFinalPath = logoPath.split('.svg')[0] + '.png'
            logoSvg = true
        //    console.log('Is logo Svg ? Yes, it is.')
        }

        const image = await Jimp.read(imageFinalPath);
       // console.log('image read.')
        const logo = await Jimp.read(logoFinalPath);
       //  console.log('logo read.')


        const logoSizes = logoResize(logo.bitmap.width, logo.bitmap.height, finalOptions)
        logo.resize(logoSizes.width, logoSizes.height);
       // console.log('logo resized.')
        const imageSizes = {
            width: image.bitmap.width,
            height: image.bitmap.height
        }
        const logoPosition = logoPositions(logoSizes, imageSizes, finalOptions)

        image.composite(logo, logoPosition.x, logoPosition.y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: finalOptions.logo_opacity
        })
        // console.log('image combined.')
        const outputPath = `${path.dirname(require.main.filename)}/output/insert-logo/`
        if (!fs.existsSync(outputPath)){
            fs.mkdirSync(outputPath, { recursive: true });
         //   console.log('Directory created at: ' + `${path.dirname(require.main.filename)}/output/insert-logo`)
        }
        const extension = getOriginalMimeType(image._originalMime)
         // console.log('Extension checked.')
        if(!imageFinalPath.includes('/')){
            imageFinalPath = '/' + imageFinalPath
        }
        const givenImageDir =  imageFinalPath.slice(0, imageFinalPath.lastIndexOf('/'))
        const outputNameSection = (imageFinalPath.split(`${givenImageDir}/`)[1])
        if(!outputNameSection.includes(extension)) return { status: 'error', msg: 'Please retry by using an image with its original extension.' }
        const newImageName = outputNameSection.split('.' + extension)[0] + '-il'
       // console.log('Output image name created.')
        const newImagePath = `${outputPath + `${newImageName}.` + extension}`

        if(!finalOptions.override) {
            if(fs.existsSync(newImagePath)) {
                return {status: 'error', msg: 'You already have this image in insert-logo folder.'}
            }
        }

        await image.writeAsync(newImagePath);
       // console.log('Logo implemented.')
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
        image.output = {
          image_name: newImageName,
          image_path: newImagePath
        }
        return {status: 'success', data: image}
    }catch (e) {
        console.log(e)
        return e
    }
}
function logoPositions(logoSizes, imageSizes, options) {
    if(options.logo_position === 'top-left') {
        return {x: 0, y: 0}
    }
    if(options.logo_position === 'top-right') {
        return {x: imageSizes.width - logoSizes.width , y: 0}
    }
    if(options.logo_position === 'bottom-left') {
        return {x: 0 , y: imageSizes.height - logoSizes.height}
    }
    if(options.logo_position === 'bottom-right') {
        return {x: imageSizes.width - logoSizes.width , y: imageSizes.height - logoSizes.height}
    }
    if(options.logo_position === 'center') {
        return {x: (imageSizes.width - logoSizes.width) / 2 , y:( imageSizes.height - logoSizes.height) / 2}
    }
}

function logoResize(w, h, options) {
    let width;
    let height;
    if(options.logo_size === 'S') {
        width = w / 4
        height = h / 4
    }
    if(options.logo_size === 'M') {
        width = w / 2
        height = h / 2
    }
    if(options.logo_size === 'L') {
        width = w
        height = h
    }
    return {width, height}
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
function checkOptions(options) {
    const allowedLogoSizes = ['S', 'M', 'L']
    const allowedLogoPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
    let msg = '';
    let status = 'success';
    Object.keys(options).forEach(key=> {
       if(key === 'logo_size') {
           if(!allowedLogoSizes.includes(options.logo_size)) {
               msg = 'Logo size is not allowed. Please use one of "S", "M", "L".'
               status = 'error'
           }
       }
       if(key === 'logo_position') {
           if(!allowedLogoPositions.includes(options.logo_position)) {
               msg = 'Logo position is not allowed. Please use one of "top-left", "top-right", "bottom-left", "bottom-right".'
               status = 'error'
           }
       }
       if(key === 'logo_opacity') {
           if(typeof options.logo_opacity !== 'number') {
               msg = 'Logo opacity is not number. Please make sure opacity is a number and between 0.0 to 1.0.'
               status = 'error'
           }
           if(1 < options.logo_opacity) {
               msg = 'Logo opacity is not in the rage. Please make sure opacity is a number and between 0.0 to 1.0.'
               status = 'error'
           }
           if(0 > options.logo_opacity) {
               msg = 'Logo opacity is not in the rage. Please make sure opacity is a number and between 0.0 to 1.0.'
               status = 'error'
           }

       }
   })
    return {status, msg};

}

module.exports = insertLogo
