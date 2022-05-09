
<h2 align="center"> INSERT LOGO</h2>
<h2 align="center">🖊️</h2>

<h3 align="center">This package allows you insert a logo to any image.</h3>


## Installing

Using npm:

```
npm i insert-logo
```
### Allowed Types

    ['.svg', '.png', '.jpeg', '.jpg']
## Example Usage

```js
const insertLogo = require('insert-logo')

async function main() {
  const options = {
      logo_size: 'M', // S, M, L (small, medium, large) - Default = M
      logo_position: 'top-left' , // top-left, top-right, bottom-left, bottom-right, center - Default top-left
      logo_opacity: 0.8, // min: 0.0, max: 1.0 - Default 0.8
      override: true // Allows to override insertedImage - Default false
  }
  const logoInsertedImage = await insertLogo('image.png', 'logo.svg', options)
   if(logoInsertedImage.status === 'error') {
      console.log('Error:' + logoInsertedImage.msg)
   }
   if(logoInsertedImage.status === 'success') {
      // see data on logoInsertedImage.data
      console.log('Success: Image Generated.')
   }
}

main()
```
## Example Output
![logo](./example-output/image-il.png "logo")

Logo inserted image will be generated at folder on path: 
``` 
root/output/insert-logo/{imageName}-il.{imageExtension}
```

## License
[MIT](LICENSE)
