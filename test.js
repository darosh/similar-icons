const test = require('ava')
const {getHashes, compareHashes} = require('./index.js')

const SVG_A = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M4.93,2.93C3.12,4.74 2,7.24 2,10C2,12.76 3.12,15.26 4.93,17.07L6.34,15.66C4.89,14.22 4,12.22 4,10C4,7.79 4.89,5.78 6.34,4.34L4.93,2.93M19.07,2.93L17.66,4.34C19.11,5.78 20,7.79 20,10C20,12.22 19.11,14.22 17.66,15.66L19.07,17.07C20.88,15.26 22,12.76 22,10C22,7.24 20.88,4.74 19.07,2.93M7.76,5.76C6.67,6.85 6,8.35 6,10C6,11.65 6.67,13.15 7.76,14.24L9.17,12.83C8.45,12.11 8,11.11 8,10C8,8.89 8.45,7.89 9.17,7.17L7.76,5.76M16.24,5.76L14.83,7.17C15.55,7.89 16,8.89 16,10C16,11.11 15.55,12.11 14.83,12.83L16.24,14.24C17.33,13.15 18,11.65 18,10C18,8.35 17.33,6.85 16.24,5.76M12,8C10.9,8 10,8.9 10,10C10,11.1 10.9,12 12,12C13.1,12 14,11.1 14,10C14,8.9 13.1,8 12,8M11,14V18H10C9.45,18 9,18.45 9,19H2V21H9C9,21.55 9.45,22 10,22H14C14.55,22 15,21.55 15,21H22V19H15C15,18.45 14.55,18 14,18H13V14H11Z" /></svg>'
const SVG_B = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24"><path d="M4.93,4.93C3.12,6.74 2,9.24 2,12C2,14.76 3.12,17.26 4.93,19.07L6.34,17.66C4.89,16.22 4,14.22 4,12C4,9.79 4.89,7.78 6.34,6.34L4.93,4.93M19.07,4.93L17.66,6.34C19.11,7.78 20,9.79 20,12C20,14.22 19.11,16.22 17.66,17.66L19.07,19.07C20.88,17.26 22,14.76 22,12C22,9.24 20.88,6.74 19.07,4.93M7.76,7.76C6.67,8.85 6,10.35 6,12C6,13.65 6.67,15.15 7.76,16.24L9.17,14.83C8.45,14.11 8,13.11 8,12C8,10.89 8.45,9.89 9.17,9.17L7.76,7.76M16.24,7.76L14.83,9.17C15.55,9.89 16,10.89 16,12C16,13.11 15.55,14.11 14.83,14.83L16.24,16.24C17.33,15.15 18,13.65 18,12C18,10.35 17.33,8.85 16.24,7.76M12,10C10.9,10 10,10.9 10,12C10,13.1 10.9,14 12,14C13.1,14 14,13.1 14,12C14,10.9 13.1,10 12,10Z" /></svg>'
const SVG_OPACITY = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14.47 13.5L11 20v-5.5H9l.53-1H7v7.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13.5h-2.53z"/><path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v8.17h2.53L13 7v5.5h2l-.53 1H17V5.33C17 4.6 16.4 4 15.67 4z"/></svg>'

const HASHES_AB = [
	{
		hash: '0000000000000000000c00301e00781c003839819c3b81dc3bbddc333ccc333ccc3bbddc3b81dc39819c1c18381e18780c1830001800007e003ffffc3ffffc007e00000000000000',
		pixels: 196
	},
	{
		hash: '0000000000000000000000000000000c00301e00781c003839819c3b81dc3bbddc333ccc333ccc3bbddc3b81dc39819c1c00381e00780c0030000000000000000000000000000000',
		pixels: 136
	}
]

const HASH_OPACITY = {
	hash: '00000000000000280000140000aa8001550000aa8001550000aa8001550000a28001450000a28001410001a38001e78001eb8001e78001ef8001ff8000ff80017f00000000000000',
	pixels: 115
}

test('get hashes', async t => {
	const hashes = await getHashes({
		items: [SVG_A, SVG_B],
		toSVG: svg => svg
	})

	t.deepEqual(hashes, HASHES_AB)
})

test('compare hashes', async t => {
	const hashes = await getHashes({
		items: [SVG_A, SVG_B],
		toSVG: svg => svg
	})

	const similar = await compareHashes({
		hashes
	})

	t.deepEqual(similar, [])
})

test('opacity hash', async t => {
	const hashes = await getHashes({
		items: [SVG_OPACITY],
		toSVG: svg => svg
	})

	t.deepEqual(hashes, [HASH_OPACITY])
})

test('compare progress report', async t => {
	const items = [SVG_A, SVG_B]
	let calls = 0
	let expectedCalls

	const hashes = await getHashes({
		items,
		toSVG: svg => svg
	})

	await compareHashes({
		hashes,
		onStart: length => {
			expectedCalls = length
		},
		onCompare: () => calls++
	})

	t.is(calls, expectedCalls)
})

test('compare same icons', async t => {
	const hashes = await getHashes({
		items: [SVG_A, SVG_A],
		toSVG: svg => svg
	})

	const similar = await compareHashes({
		hashes
	})

	t.deepEqual(similar, [[0, 1, 0]])
})
