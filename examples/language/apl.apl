⍝ https://www.npmjs.com/package/apl
⍝ https://github.com/optimasystems/vscode-apl-language
⍝ atom plugin - https://github.com/Alhadis/language-apl
⍝ https://codemirror.net/mode/apl/index.html
⍝ https://tryapl.org/
⍝ ⍋ << use this symbol for APL icon (grade up)
⍝ https://dfns.dyalog.com/n_keyboards.htm
⍝ https://github.com/PlanetAPL/node-apl
⍝ k language which is like apl - https://github.com/JohnEarnest/ok

⍝ all APL chars in unicode
⍝ ¯ × ÷ ∘ ∣ ∼ ≠ ≤ ≥ ≬ ⌶ ⋆ ⌾ ⍟ ⌽ ⍉ ⍦ ⍧ ⍪ ⍫ ⍬ ⍭ ← ↑ → ↓ ∆ ∇ ∧ ∨ ∩ ∪ ⌈ ⌊ ⊤ ⊥ ⊂ ⊃ ⌿ ⍀ ⍅ ⍆ ⍏ ⍖ ⍊ ⍑ ⍋ ⍒ ⍎ ⍕ ⍱ ⍲ ○ ⍳ ⍴ ⍵ ⍺ ⍶ ⍷ ⍸ ⍹ ⍘ ⍙ ⍚ ⍛ ⍜ ⍮ ¨ ⍡ ⍢ ⍣ ⍤ ⍥ ⍨ ⍩

⍝ ⋄ ??? where is this in the above list?
⍝ ⎕← prints to an alert!

⍝ hello world is very simple in APL!
'Hello World!'

⍝ anything that is printed in quotes is printed to the terminal
⍝ (⍝ in APL signifies a comment)

⍝ to store string
helloMessage ← 'Hello World'

⍝ to print it
helloMessage

⍝ fibo from replit
fibReplit ← {⍵<2:⍵ ⋄ (∇⍵-1)+∇⍵-2}
fibReplit 7

⍝ fibonacci
fibFn ← {
	⍵∊0 1:⍵
	+/∇¨⍵-1 2
}
fibResults ← fibFn ¨ ⍳ 10

⍝ only last call gets printed
fibResults


⍝ example-0
table ← 11 11 ⍴ ⍳ 121

⍝ example-1
multTable ← (⍳ 10) ∘.× ⍳ 10

⍝ example-2
f ← {(⍵,(⍴⍵)⍴0)⍪⍵,⍵}
sierpinski ← {' █'[(f⍣⍵) 1 1 ⍴ 1]}
runsierp ← { sierpinski 5 }

⍝ example-3
primes ← { (1=+⌿0=A∘.∣A)/A←2↓⍳100 }


⍝ example-4
creature ← (3 3 ⍴ ⍳ 9) ∊ 1 2 3 4 7   ⍝ Original creature from demo
creature ← (3 3 ⍴ ⍳ 9) ∊ 1 3 6 7 8   ⍝ Glider
board ← ¯1 ⊖ ¯2 ⌽ 5 7 ↑ creature
life ← {⊃1 ⍵ ∨.∧ 3 4 = +/ +⌿ 1 0 ¯1 ∘.⊖ 1 0 ¯1 ⌽¨ ⊂⍵}
gen ← {'░█'[(life ⍣ ⍵) board]}
runlife ← {
	(gen 1) (gen 2) (gen 3)
}

⍝ example-5
rule←30
n←50 ⍝ number of rows to compute
t←⌽rule⊤⍨8⍴2
runrule ← {
	'░█'[⊃⌽{⍵,⍨⊂t[2⊥¨3,/0,0,⍨↑⍵]}⍣n⊂z,1,z←n⍴0]
}

⍝ example-6
queens←{                            ⍝ The N-queens problem.
    search←{                        ⍝ Search for all solutions.
        (⊂⍬)∊⍵:0⍴⊂⍬                 ⍝ stitched: abandon this branch.
        0=⍴⍵:rmdups ⍺               ⍝ all done: solution!
        (hd tl)←(↑⍵)(1↓⍵)           ⍝ head 'n tail of remaining ranks.
        next←⍺∘,¨hd                 ⍝ possible next steps.
        rems←hd free¨⊂tl            ⍝ unchecked squares.
        ⊃,/next ∇¨rems              ⍝ ... in following ranks.
    }
    cvex←(1+⍳⍵)×⊂¯1 0 1             ⍝ Checking vectors.
    free←{⍵~¨⍺+(⍴⍵)↑cvex}           ⍝ Unchecked squares.
    rmdups←{                        ⍝ Ignore duplicate solution.
        rots←{{⍒⍵}\4/⊂⍵}            ⍝ 4 rotations.
        refs←{{⍋⍵}\2/⊂⍵}            ⍝ 2 reflections.
        best←{(↑⍋⊃⍵)⊃⍵}             ⍝ best (=lowest) solution.
        all8←,⊃refs¨rots ⍵          ⍝ all 8 orientations.
        (⍵≡best all8)⊃⍬(,⊂⍵)        ⍝ ignore if not best.
    }
    fmt←{                           ⍝ Format solution.
        chars←'·⍟'[(⊃⍵)∘.=⍳⍺]       ⍝ char array of placed queens.
        expd←1↓,⊃⍺⍴⊂0 1             ⍝ expansion mask.
        ⊃¨↓↓expd\chars              ⍝ vector of char matrices.
    }
    squares←(⊂⍳⌈⍵÷2),1↓⍵⍴⊂⍳⍵        ⍝ initial squares
    ⍵ fmt ⍬ search squares          ⍝ all distinct solutions.
}
runqueens← {
	queens 5
}

⍝ example-7
mandle← {
	'░█'[9>|⊃{⍺+⍵*2}/9⍴⊂¯3×.7j.5-⍉a∘.+0j1×a←(⍳n+1)÷n←98]
}

runqueens()
 