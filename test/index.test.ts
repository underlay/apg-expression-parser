const { parse } = require("../lib/index.js")

// test("Comment only", () => {
// 	const result = parse(`# This is a comment`)
// 	// console.log(result)
// })

// test("Prefix only", () => {
// 	const result = parse(`prefix s = <http://schema.org/>`)
// 	// console.log(result)
// })

// test("Comment and prefix", () => {
// 	const result = parse(`
// # neat
// prefix s = <http://schema.org/>

// # wow
// `)
// 	// console.log(result)
// })

// test("Several comments and prefixes", () => {
// 	const result = parse(`
// # neat
// prefix s = <http://schema.org/>

// # let's do it again
// prefix b = <http://schema.borg/>

// # HMMMM

// #HMM

// prefix c = <http://schema.corg/>`)
// 	// console.log(result)
// })

// test("Variable only", () => {
// 	const result = parse(`
//   # fdjsklf
// expr wow = <http:/fjdkls.fjsdl#jlfs> !
// `)
// })

test("Prefix and variable", () => {
	const result = parse(`# fdjsklf
prefix foo = <http://ffjkdls.fdsj>
expr wow = !
`)
	console.log(JSON.stringify(result, null, "  "))
})

test("Map only", () => {
	const result = parse(`map <hfda:fjdksl> <= <http://fjdksl> . <you:tube> => !`)
	console.log(JSON.stringify(result, null, "  "))
})

test("Does it work?", () => {
	const source = `prefix foo = <http://fjdskl.fjl/>
prefix fooo = <http://fjdskl.fjl/>
prefix foooo = <http://fjdskl.fjl/>
prefix ul = <http://fjdskl.fjl/>

expr a = !
expr aa = a !

expr aaa = !
expr afdsa42AAFa = aaa . foo:bar !

expr wow = (
  !
  foooo:nar
  "fjkdsla" :string
)

expr djs = \\ * foooo:fjkdls * foooo:uio % foo:bar . foo:bar * ul:jkl <schema:fds>

map foo:klfsa
  <= ul:fjksl/fjsla . ul:jfdks / ul:io
  => djs

map foo:klfsa2
  <= ul:fjksl/fjsla . ul:jfdks / ul:io
  => afdsa42AAFa !

 map foo:klfsa3
  <= ul:fjksl/fjsla . ul:jfdks / ul:io
  => wow aaa
`
	console.log("yay", parse(source))
})
