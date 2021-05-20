⍝ https://www.npmjs.com/package/apl
⍝ https://github.com/optimasystems/vscode-apl-language
⍝ atom plugin - https://github.com/Alhadis/language-apl
⍝ https://codemirror.net/mode/apl/index.html
⍝ https://tryapl.org/
⍝ ⍋ << use this symbol for APL icon (grade up)
⍝ https://dfns.dyalog.com/n_keyboards.htm

⍝ hello world is very simple in APL!
'Hello World!'

⍝ In APL, anything that is printed in quotes is printed to the terminal.
⍝ (⍝ in APL signifies a comment)

⍝ to store the string (and print it afterwards)
helloMessage ← 'Hello World'

⍝ fibonacci
fibFn ← {
	⍵∊0 1:⍵
	+/∇¨⍵-1 2
}
fibResults ← fibFn ¨ 0 1 2 3 4 5 6 7 8 9

⍝ in this case, only fib results get printed (I guess because they are the last things printed)
fibResults
