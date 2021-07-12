` fibonacci sequence generator `

log := load('std').log

` naive implementation `
fib := n => n :: {
	0 -> 0
	1 -> 1
	_ -> fib(n - 1) + fib(n - 2)
}

` memoized / dynamic programming implementation `
memo := [0, 1]
fibMemo := n => (
	memo.(n) :: {
		() -> memo.(n) := fibMemo(n - 1) + fibMemo(n - 2)
	}
	memo.(n)
)

`log('fib(20) is 6765:')
`out('Naive solution: '), log(fib(20))
`out('Dynamic solution: '), log(fibMemo(20))

fibo := n => each(
	range(0, n + 1, 1)
	n => out(fibMemo(n) + ' ')
)

fibo(9), log('\n')
