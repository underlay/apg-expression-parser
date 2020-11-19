const parse = require("./index.js")

test("Does it work?", () => {
	const source = `prefix foo = http://fjdskl.fjl/
prefix fooo = http://fjdskl.fjl/
prefix foooo = http://fjdskl.fjl/
prefix fooooo = http://fjdskl.fjl/


expr a = !
expr aa = a !

expr aaa = !
expr afdsa42AAFa = aaa . foo:bar !

expr wow = (
  !
  <foo:nar>
  "fjkdsla" :fdksl
)

expr djs = / * fjsl:fjkdls * jsdl:uio % foo:bar . foo:bar * fjk:jkl <foo:fds>

return map {
  fas:klfsa
    <= ul:fjksl/fjsla . fjsl:jfdks \\ fjsdl:io
    => ! ;
  fas:klfsa2
    <= ul:fjksl/fjsla . fjsl:jfdks \\ fjsdl:io
    => ! ;
  fas:klfsa3
    <= ul:fjksl/fjsla . fjsl:jfdks \\ fjsdl:io
    => ! ;
}`
	console.log(parse(source))
})
