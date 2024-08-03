import fs from 'fs-extra'

try {
  fs.copySync('./src/assets', './dist/assets')
  fs.copySync('./src/favicon', './dist/pages')
  console.log('Assets copy success!')
} catch (error) {
  console.error(error)
}
