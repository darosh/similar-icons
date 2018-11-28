const os = require('os')
const sharp = require('sharp')
const mapLimit = require('async/mapLimit')
const eachLimit = require('async/eachLimit')

const DEFAULT_PARALLEL_LIMIT = os.cpus().length
const DEFAULT_ICON_SIZE = 24
const DEFAULT_PIXEL_LIMIT = (DEFAULT_ICON_SIZE ** 2) / 6
const DEFAULT_GRAY_THRESHOLD = 224

exports.compareHashes = compareHashes
exports.getHashes = getHashes

function getHashes({
	items,
	toSVG,
	limit = DEFAULT_PARALLEL_LIMIT,
	size = DEFAULT_ICON_SIZE,
  threshold = DEFAULT_GRAY_THRESHOLD
}) {
	return new Promise((resolve, reject) => {
		mapLimit(items, limit, async item => {
			const svg = await toSVG(item)
			let render = await toGray(svg, size)
			const hasOpacity = svg.includes('opacity')

			if (!hasOpacity) {
				render = render.threshold(threshold)
			}

			const buf = await render.raw().toBuffer()
			const hash = toHash(buf, size)
			const pixels = density(buf, size)

			return {
				hash,
				pixels
			}
		}, (err, results) => {
			if (err) {
				reject(err)
			} else {
				resolve(results)
			}
		})
	})
}

async function toGray(svg, size) {
	const buf = await sharp({
		create: {
			width: size,
			height: size,
			channels: 4,
			background: {
				r: 255,
				g: 255,
				b: 255,
				alpha: 255
			}
		}
	})
		.overlayWith(Buffer.from(svg))
		.png()
		.toBuffer()
		.catch(error => console.error(error))

	const gray = sharp(buf)
		.resize(size)
		.grayscale()

	return gray
}

function toHash(buf, size) {
	return (new Array(buf.length / 4).fill(0)).map((d, i) => lineToHex(buf, i * 4, size)).join('')
}

function lineToHex(buf, start, size) {
	let v = 0
	const x = Math.floor(start / size)

	for (let i = 0; i < 4; i++) {
		v += buf[start + i] && (buf[start + i] === 255 || (i ^ x) % 2) ? 0 : 2 ** i
	}

	return v.toString(16)
}

function density(buf, size) {
	let v = 0
	let i = 0

	for (let x = 0; x < size; x++) {
		for (let y = 0; y < size; y++) {
			v += buf[i] && (buf[i] === 255 || (x ^ y) % 2) ? 0 : 1
			i++
		}
	}

	return v
}

function compareHashes({
	hashes,
	pixelLimit = DEFAULT_PIXEL_LIMIT,
	parallel = DEFAULT_PARALLEL_LIMIT,
	onStart,
	onCompare
}) {
	const toCompare = []

	for (let x = 0; x < hashes.length; x++) {
		for (let y = x + 1; y < hashes.length; y++) {
			const limit = Math.min(pixelLimit, Math.min(hashes[x].pixels, hashes[y].pixels))
			const diff = Math.abs(hashes[x].pixels - hashes[y].pixels)

			if (diff > limit) {
				continue
			}

			toCompare.push({x, y, limit})
		}
	}

	if (onStart) {
		onStart(toCompare.length)
	}

	return parallelCompare(toCompare, hashes, parallel, onCompare)
}

function parallelCompare(toCompare, hashes, parallel, onCompare) {
	return new Promise((resolve, reject) => {
		const similar = []

		eachLimit(toCompare, parallel, (item, callback) => {
			const {x, y, limit} = item

			const a = hashes[x].hash
			const b = hashes[y].hash

			if (onCompare) {
				onCompare()
			}

			if (a === b) {
				similar.push([x, y, 0])

				return callback()
			}

			const delta = getDelta({a, b, limit})

			if (delta < limit) {
				similar.push([x, y, delta])
			}

			return callback()
		}, err => {
			if (err) {
				reject(err)
			} else {
				resolve(similar)
			}
		})
	})
}

function getDelta({a, b, limit}) {
	let d = 0

	for (let i = 0; i < a.length; i += 8) {
		d += countBits(parseInt(a.substr(i, 8), 16) ^ parseInt(b.substr(i, 8), 16))

		if (d >= limit) {
			return d
		}
	}

	return d
}

function countBits(x) {
	let v = x - ((x >> 1) & 0x55555555)
	v = (v & 0x33333333) + ((v >> 2) & 0x33333333)
	return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}
