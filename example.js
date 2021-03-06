const fs = require('fs')
const {promisify} = require('util')

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const progress = require('cli-progress')
const {getHashes, compareHashes} = require('.')

const SAVE_HASHES = 'example-hashes.json'
const SAVE_SIMILAR = 'example-similar.json';

(async () => {
	const ICONS_DIR = './node_modules/@mdi/svg/svg'
	const items = await readdir(ICONS_DIR)

	const bar = new progress.Bar({
		etaBuffer: 8,
		barsize: 10,
		hideCursor: true,
		format: '[{bar}] {percentage}% | {eta}s | {value}/{total} | {duration}s'
	}, progress.Presets.rect)

	console.log('Rendering...')
	bar.start(items.length, 0)

	const toSVG = file => {
		bar.increment(1)
		return readFile(`${ICONS_DIR}/${file}`, 'utf8')
	}

	const hashes = await getHashes({items, toSVG})
	bar.stop()
	console.log('Saving...', SAVE_HASHES)
	await writeFile(SAVE_HASHES, JSON.stringify(hashes))
	console.log('Comparing...')
	const onStart = length => bar.start(length, 0)
	const onCompare = () => bar.increment(1)
	const similar = await compareHashes({hashes, onStart, onCompare})
	bar.stop()
	console.log('Saving...', SAVE_SIMILAR)
	await writeFile(SAVE_SIMILAR, JSON.stringify(similar))
	console.log(`Found ${similar.length} similar matches.`)
})()
