export interface Concept {
	name: string;
	desc: string;
}

export interface Practice {
	title: string;
	prompt: string;
	startCode: string;
	solution: string;
}

export interface Step {
	id: number;
	title: string;
	subtitle: string;
	tweet: boolean;
	duration: string;
	content: string;
	keyIdea: string;
	concepts: Concept[];
	docsLink: string;
	trap: string;
	tsCode?: string;
	code?: string;
	diagram?: string;
	practice?: Practice[];
}

export interface Phase {
	phase: string;
	slug: string;
	phaseColor: string;
	steps: Step[];
}

export const PHASES: Phase[] = [
	{
		phase: "Foundation",
		slug: "foundation",
		phaseColor: "#E8D5B7",
		steps: [
			{
				id: 1,
				title: "The Mental Model",
				subtitle: "Why Effect exists & what it replaces",
				tweet: false,
				duration: "10 min",
				content:
					"Before writing any code, understand what Effect actually is. It's NOT just another utility library — it's a complete paradigm for describing programs.",
				keyIdea:
					'Effect<Success, Error, Requirements> — this single type replaces Promise, try/catch, dependency injection, and more. Think of it as a "blueprint" for a computation, not the computation itself.',
				concepts: [
					{
						name: "Effect<A, E, R>",
						desc: "The core type. A = success value, E = expected errors, R = required dependencies.",
					},
					{
						name: "Lazy execution",
						desc: "Unlike Promises, Effects are cold. They describe WHAT to do, not DO it. Nothing runs until you call a runner.",
					},
					{
						name: "Referential transparency",
						desc: "You can pass Effects around, compose them, store them — they're just values until executed.",
					},
				],
				docsLink:
					"https://effect.website/docs/getting-started/the-effect-type/",
				trap: 'Coming from async/await, you\'ll instinctively think an Effect "runs" when created. It doesn\'t. const x = Effect.log("hi") prints nothing. You must run it.',
				practice: [
					{
						title: "Predict the output",
						prompt:
							"What gets printed to the console? Remember: Effects are lazy blueprints, not eager Promises.",
						startCode: `import { Effect } from "effect"

const a = Effect.sync(() => console.log("hello"))
const b = Effect.succeed(42)
console.log("done")

// What prints? (A) "hello" then "done"  (B) "done" only  (C) nothing`,
						solution: `// Answer: (B) "done" only
// Effect.sync wraps a function but does NOT execute it.
// Effect.succeed wraps a value — no side effect at all.
// Only console.log("done") runs because it's plain TS, not an Effect.`,
					},
					{
						title: "Label the types",
						prompt:
							"Fill in the A (success), E (error), and R (requirements) for each Effect type.",
						startCode: `import { Effect } from "effect"

// What are A, E, R for each?
const a = Effect.succeed("hello")
// Effect<???, ???, ???>

const b = Effect.fail(new Error("boom"))
// Effect<???, ???, ???>

const c = Effect.sync(() => Math.random())
// Effect<???, ???, ???>`,
						solution: `import { Effect } from "effect"

const a = Effect.succeed("hello")
// Effect<string, never, never>
// A=string (the value), E=never (can't fail), R=never (no deps)

const b = Effect.fail(new Error("boom"))
// Effect<never, Error, never>
// A=never (never succeeds), E=Error, R=never

const c = Effect.sync(() => Math.random())
// Effect<number, never, never>
// A=number (return type of the fn), E=never (sync assumes no throw), R=never`,
					},
				],
			},
			{
				id: 2,
				title: "Creating Effects",
				subtitle: "succeed, fail, sync, promise, try",
				tweet: false,
				duration: "15 min",
				content:
					"Learn the constructors — how to wrap existing values, sync code, and async code into the Effect world.",
				keyIdea:
					"Match the constructor to what you're wrapping. Already have a value? succeed/fail. Sync code that might throw? try. Async code? promise or tryPromise.",
				concepts: [
					{
						name: "Effect.succeed(value)",
						desc: "Wraps a plain value. Always succeeds. Type: Effect<A, never, never>",
					},
					{
						name: "Effect.fail(error)",
						desc: "Creates a failed Effect. Type: Effect<never, E, never>",
					},
					{
						name: "Effect.sync(() => ...)",
						desc: "Wraps sync code that WON'T throw. Lazy evaluation.",
					},
					{
						name: "Effect.try(() => ...)",
						desc: "Wraps sync code that MIGHT throw. Catches and channels the error.",
					},
					{
						name: "Effect.promise(() => ...)",
						desc: "Wraps a Promise that WON'T reject. For promises that might reject, use tryPromise.",
					},
					{
						name: "Effect.tryPromise(() => ...)",
						desc: "Wraps a Promise that MIGHT reject. Maps rejection to the error channel.",
					},
				],
				docsLink:
					"https://effect.website/docs/getting-started/creating-effects/",
				trap: "Don't use Effect.sync for code that throws — use Effect.try instead. sync assumes no exceptions. Also, never use Effect.promise for fetch() — it can reject, so use tryPromise.",
				practice: [
					{
						title: "Pick the right constructor",
						prompt:
							"For each scenario, choose the correct Effect constructor. Think about: does it throw? Is it async? Do you already have the value?",
						startCode: `import { Effect } from "effect"

// 1. You have a config object already loaded
const config = { port: 3000 }
const getConfig = Effect.???(config)

// 2. Reading from localStorage (sync, might throw in SSR)
const getToken = Effect.???(() => localStorage.getItem("token"))

// 3. Calling an external API (async, might reject)
const fetchUser = Effect.???(() => fetch("/api/user"))

// 4. Getting the current date (sync, never throws)
const now = Effect.???(() => new Date())`,
						solution: `import { Effect } from "effect"

// 1. Already have a value → succeed
const config = { port: 3000 }
const getConfig = Effect.succeed(config)

// 2. Sync code that might throw → try
const getToken = Effect.try(() => localStorage.getItem("token"))

// 3. Async code that might reject → tryPromise
const fetchUser = Effect.tryPromise(() => fetch("/api/user"))

// 4. Sync code that won't throw → sync
const now = Effect.sync(() => new Date())`,
					},
					{
						title: "Wrap a real function",
						prompt:
							"Convert this vanilla TS function into an Effect. JSON.parse can throw, so pick the right constructor and map the error.",
						startCode: `import { Effect } from "effect"

// Vanilla TS — throws on invalid JSON
function parseJson(raw: string) {
  return JSON.parse(raw)
}

// TODO: rewrite as an Effect that captures the error
const parseJsonEffect = (raw: string) =>
  Effect.???(/* your code here */)`,
						solution: `import { Effect } from "effect"

// Why is (raw: string) outside Effect.try?
// Effect.try(...) returns a single Effect — a blueprint for one computation.
// The outer function parameterizes it: raw is captured via closure.
// This is the same pattern as: const fn = (x) => new Promise(r => r(x))
// You'll see this everywhere in Effect: regular function outside, Effect inside.

const parseJsonEffect = (raw: string) =>
  Effect.try({
    try: () => JSON.parse(raw),
    catch: (error) => new Error(\`Invalid JSON: \${error}\`)
  })
// Type: (raw: string) => Effect<unknown, Error, never>`,
					},
				],
				code: `// Wrapping existing values
const success = Effect.succeed(42)        // Effect<number, never, never>
const failure = Effect.fail("oh no")      // Effect<never, string, never>

// Wrapping sync code
const random = Effect.sync(() => Math.random())
const parsed = Effect.try(() => JSON.parse(input))

// Wrapping async code
const fetched = Effect.tryPromise({
  try: () => fetch("https://api.example.com/data"),
  catch: (err) => new HttpError({ cause: err })
})`,
			},
			{
				id: 3,
				title: "Running Effects",
				subtitle: "runSync, runPromise, runPromiseExit",
				tweet: false,
				duration: "15 min",
				content:
					"Effects are blueprints. Runners execute them. Choose the right runner for your context.",
				keyIdea:
					"There should be exactly ONE runner at the edge of your program. Everything else composes Effects together without running them.",
				concepts: [
					{
						name: "Effect.runSync(effect)",
						desc: "Runs synchronously. Throws if the Effect is async or fails.",
					},
					{
						name: "Effect.runPromise(effect)",
						desc: "Returns a Promise. Rejects if the Effect fails.",
					},
					{
						name: "Effect.runPromiseExit(effect)",
						desc: "Returns Promise<Exit> — never rejects, gives you Success or Failure.",
					},
					{
						name: "Effect.runFork(effect)",
						desc: "Runs on a lightweight Fiber (covered in Phase 8: Concurrency). You won't need this yet.",
					},
				],
				docsLink:
					"https://effect.website/docs/getting-started/running-effects/",
				trap: "Don't sprinkle runners throughout your code. One runner at the entry point. Compose everything else with pipe, gen, map, flatMap.",
				practice: [
					{
						title: "Match the runner",
						prompt:
							"Each runner behaves differently on success, failure, and async effects. Predict what happens in each case.",
						startCode: `import { Effect } from "effect"

const success = Effect.succeed(42)
const failure = Effect.fail("oops")
const async_ = Effect.tryPromise(() => fetch("https://example.com"))

// What does each return or throw?
Effect.runSync(success)     // → ???
Effect.runSync(failure)     // → ???
Effect.runSync(async_)      // → ???

Effect.runPromise(success)  // → ???
Effect.runPromise(failure)  // → ???`,
						solution: `import { Effect } from "effect"

Effect.runSync(success)     // → 42
Effect.runSync(failure)     // → throws (runSync throws when the Effect fails)
Effect.runSync(async_)      // → throws (runSync can't handle async Effects)

Effect.runPromise(success)  // → Promise that resolves to 42
Effect.runPromise(failure)  // → Promise that rejects with "oops"`,
					},
					{
						title: "runPromise vs runSync",
						prompt:
							"This code crashes. Figure out why, and fix it by choosing a different runner.",
						startCode: `import { Effect } from "effect"

const fetchData = Effect.tryPromise(
  () => fetch("https://api.example.com/data")
)

// This crashes — why?
const result = Effect.runSync(fetchData)
console.log(result)`,
						solution: `import { Effect } from "effect"

const fetchData = Effect.tryPromise(
  () => fetch("https://api.example.com/data")
)

// runSync can't handle async Effects — fetch returns a Promise.
// Fix: use runPromise, which returns a Promise itself.
Effect.runPromise(fetchData).then(console.log)`,
					},
				],
				code: `// One runner at the edge of your program
const program = Effect.gen(function* () {
  yield* Effect.log("Starting...")
  return yield* myApp
})

// Pick the right runner:
Effect.runSync(program)          // sync only, throws on async/failure
Effect.runPromise(program)       // returns Promise, rejects on failure
Effect.runPromiseExit(program)   // returns Promise<Exit>, never rejects`,
			},
			{
				id: 4,
				title: "Generators (Effect.gen)",
				subtitle: "The async/await of Effect",
				tweet: true,
				duration: "15 min",
				content:
					"Effect.gen is how you write sequential Effect code that reads like async/await. This is the syntax you'll use 90% of the time.",
				keyIdea:
					"yield* is to Effect.gen what await is to async functions. But unlike await, yield* works with ANY Effect — sync or async, with typed errors and dependencies.",
				concepts: [
					{
						name: "Effect.gen(function* () { ... })",
						desc: "Creates an Effect using generator syntax. The most readable way to compose Effects.",
					},
					{
						name: "yield*",
						desc: '"Unwraps" an Effect inside a generator. Like await but for Effects.',
					},
					{
						name: "Return value",
						desc: "What you return from the generator becomes the success value of the resulting Effect.",
					},
				],
				docsLink:
					"https://effect.website/docs/getting-started/using-generators/",
				trap: "You MUST use yield* (with the asterisk), not plain yield. Also, the generator must be function*, not an arrow function.",
				practice: [
					{
						title: "Convert async/await to Effect.gen",
						prompt:
							"Rewrite this async function using Effect.gen. Replace await with yield*, and wrap the fetch call properly.",
						startCode: `// Original async/await code
async function getUser(id: string) {
  const res = await fetch(\`/api/users/\${id}\`)
  const user = await res.json()
  return user.name
}

// TODO: rewrite using Effect.gen
import { Effect } from "effect"

const getUser = (id: string) =>
  Effect.gen(function* () {
    // your code here
  })`,
						solution: `import { Effect } from "effect"

const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: () => fetch(\`/api/users/\${id}\`),
      catch: () => new Error("fetch failed")
    })
    const user = yield* Effect.tryPromise({
      try: () => res.json(),
      catch: () => new Error("invalid JSON")
    })
    return user.name as string
  })
// Type: (id: string) => Effect<string, Error, never>
// The catch mapper controls what goes in the E channel.
// Nothing runs until you call a runner!`,
					},
					{
						title: "Compose multiple effects",
						prompt:
							"Use Effect.gen to sequence three independent effects and combine their results into one object.",
						startCode: `import { Effect } from "effect"

const getName = Effect.succeed("Alice")
const getAge = Effect.succeed(30)
const getRole = Effect.succeed("admin")

// TODO: use Effect.gen to combine into { name, age, role }
const getProfile = Effect.gen(function* () {
  // your code here
})

// Then run it:
// Effect.runSync(getProfile)
// → { name: "Alice", age: 30, role: "admin" }`,
						solution: `import { Effect } from "effect"

const getName = Effect.succeed("Alice")
const getAge = Effect.succeed(30)
const getRole = Effect.succeed("admin")

const getProfile = Effect.gen(function* () {
  const name = yield* getName   // no parentheses — getName is already an Effect
  const age = yield* getAge     // same as: await myPromise (not myPromise())
  const role = yield* getRole   // use () only when calling a function that RETURNS an Effect
  return { name, age, role }
})

console.log(Effect.runSync(getProfile))
// → { name: "Alice", age: 30, role: "admin" }`,
					},
				],
				code: `const program = Effect.gen(function* () {
  const user = yield* fetchUser(id)    // like: await fetchUser(id)
  const posts = yield* fetchPosts(user.id)
  return { user, posts }
})
// program is Effect<{ user, posts }, Error, never>
// Nothing has executed yet — it's still just a blueprint!`,
			},
		],
	},
	{
		phase: "Composition",
		slug: "composition",
		phaseColor: "#C5D5C0",
		steps: [
			{
				id: 5,
				title: "pipe & Pipelines",
				subtitle: "The functional composition backbone",
				tweet: false,
				duration: "15 min",
				content:
					"pipe is the other main way to compose Effects (besides generators). If you've ever chained .then().then().catch() on Promises, pipe is the same idea — but with separate operators for each concern.",
				keyIdea:
					"pipe reads top-to-bottom like method chaining. In TS you write promise.then(f).then(g). In Effect you write pipe(effect, Effect.map(f), Effect.flatMap(g)). Same flow, explicit operators.",
				concepts: [
					{
						name: "pipe(value, fn1, fn2, ...) — standalone",
						desc: "Imported from 'effect'. Passes value through fn1, then fn2, etc. Works with any value, not just Effects.",
					},
					{
						name: "effect.pipe(fn1, fn2, ...) — method",
						desc: "Every Effect value has a .pipe() method. Same result, but reads like method chaining. No import needed. Most code uses this style.",
					},
					{
						name: "Effect.map(f)",
						desc: "Transforms the success value. Like .then(x => x * 2) — f returns a plain value, not an Effect.",
					},
					{
						name: "Effect.flatMap(f)",
						desc: "Chains Effects. f returns a new Effect. Like .then(x => fetch(...)) where .then receives another Promise.",
					},
					{
						name: "Effect.andThen(f)",
						desc: "Unified map + flatMap. Pass a value, a function, or an Effect — it figures out the right behavior. The most flexible operator.",
					},
					{
						name: "Effect.tap(f)",
						desc: "Runs a side effect without changing the value. The value passes through unchanged. Great for logging.",
					},
				],
				docsLink:
					"https://effect.website/docs/getting-started/building-pipelines/",
				trap: "When to use pipe vs gen? Use gen for complex sequential logic (like async/await). Use pipe for adding behaviors to an existing Effect (retry, timeout, logging). They compose together — build your logic with gen, then wrap it in pipe to add cross-cutting concerns.",
				practice: [
					{
						title: "Translate Promise chains to pipe",
						prompt:
							"Convert this Promise chain to an Effect pipeline using pipe. Think about which operator replaces each .then().",
						startCode: `// Promise version
fetch("/api/user")
  .then(res => res.json())             // returns a Promise → flatMap
  .then(user => user.name.toUpperCase()) // returns a value → map
  .then(name => console.log(name))     // side effect → tap

// TODO: rewrite with pipe
import { pipe, Effect, Console } from "effect"

const program = pipe(
  Effect.tryPromise(() => fetch("/api/user")),
  // your code here
)`,
						solution: `import { pipe, Effect, Console } from "effect"

const program = pipe(
  Effect.tryPromise(() => fetch("/api/user")),
  // res.json() is async + can fail → flatMap with tryPromise
  Effect.flatMap((res) =>
    Effect.tryPromise(() => res.json())
  ),
  // .name.toUpperCase() is sync transform → map
  Effect.map((user) => user.name.toUpperCase()),
  // console.log is a side effect → tap (value passes through)
  Effect.tap((name) => Console.log(name))
)
// The rule: returns an Effect? → flatMap. Returns a value? → map.
// Or just use andThen for everything — it auto-detects.`,
					},
					{
						title: "map vs flatMap vs andThen",
						prompt:
							"Fix the type errors. Each operator has a specific contract — using the wrong one won't compile.",
						startCode: `import { pipe, Effect } from "effect"

const getUser = Effect.succeed({ name: "Alice", id: 1 })
const fetchPosts = (id: number) =>
  Effect.succeed(["post1", "post2"])

// BUG: map expects a plain value, but fetchPosts returns an Effect
const posts = pipe(
  getUser,
  Effect.map((user) => fetchPosts(user.id))
)
// posts is Effect<Effect<string[]>> — double wrapped!

// TODO: fix the operator choice so posts is Effect<string[]>`,
						solution: `import { pipe, Effect } from "effect"

const getUser = Effect.succeed({ name: "Alice", id: 1 })
const fetchPosts = (id: number) =>
  Effect.succeed(["post1", "post2"])

// Fix 1: use flatMap — it "unwraps" the inner Effect
const posts = pipe(
  getUser,
  Effect.flatMap((user) => fetchPosts(user.id))
)
// posts is Effect<string[]> ✓

// Fix 2: use andThen — it auto-detects that fetchPosts returns an Effect
const posts2 = pipe(
  getUser,
  Effect.andThen((user) => fetchPosts(user.id))
)
// andThen works like map AND flatMap — pick it when you don't want to think about it`,
					},
				],
				code: `// Two ways to pipe — same result, different syntax:

// --- Style 1: standalone pipe() (import { pipe } from "effect") ---
import { pipe, Effect } from "effect"

const program1 = pipe(
  fetchUser(id),
  Effect.map((user) => user.name),
  Effect.flatMap((name) => saveGreeting(name))
)

// --- Style 2: .pipe() method on the Effect value ---
const program2 = fetchUser(id).pipe(
  Effect.map((user) => user.name),
  Effect.flatMap((name) => saveGreeting(name))
)

// Both produce the same Effect. Most Effect code uses .pipe()
// because it reads like method chaining and needs no extra import.

// Full example with cross-cutting concerns:
const resilient = fetchUser(id).pipe(
  Effect.map((user) => user.name),
  Effect.tap((name) => Effect.log(name)),
  Effect.flatMap((name) => saveGreeting(name)),
  Effect.timeout("5 seconds"),
  Effect.retry({ times: 3 })
)`,
			},
			{
				id: 6,
				title: "Control Flow",
				subtitle: "if/else, loops, matching in Effect",
				tweet: true,
				duration: "15 min",
				content:
					"Effect gives you two styles. Imperative: normal if/else and for-loops inside Effect.gen — you already know this from TS. Declarative: Effect.if, Effect.forEach, Effect.all — describe WHAT should happen, not HOW. Imperative is better when logic is complex with many branches, early returns, or intermediate variables — it reads like regular TS. Declarative wins when you need composability: swapping sequential for concurrent is a one-line option change, and operators chain cleanly in pipes without nesting.",
				keyIdea:
					"Imperative (generators): best for complex branching, early returns, and readable step-by-step logic. Declarative (operators): best for composable pipelines where you want to add concurrency, retries, or timeouts without restructuring. You don't have to choose one — mix both in the same program.",
				concepts: [
					{
						name: "Effect.if(condition, { onTrue, onFalse })",
						desc: "Declarative conditional. Same as if/else in a generator, but composable in a pipeline.",
					},
					{
						name: "Effect.forEach(items, fn)",
						desc: "Declarative loop. Like items.map(fn) but each fn returns an Effect. Sequential by default.",
					},
					{
						name: "Effect.all([...effects])",
						desc: "Run multiple Effects and collect results. Like Promise.all but sequential by default — opt into concurrency explicitly.",
					},
					{
						name: "Effect.match / matchEffect",
						desc: "Declarative success/failure handling. match returns a plain value (like a ternary), matchEffect returns a new Effect.",
					},
				],
				docsLink: "https://effect.website/docs/getting-started/control-flow/",
				trap: 'Effect.all is sequential by default! For parallel execution, pass { concurrency: "unbounded" } or a number. This is the opposite of Promise.all which is always concurrent.',
				practice: [
					{
						title: "Promise.all vs Effect.all",
						prompt:
							"You're used to Promise.all running everything concurrently. Effect.all is different. Predict the output order, then fix the code to run concurrently.",
						startCode: `import { Effect } from "effect"

const task = (label: string, ms: number) =>
  Effect.gen(function* () {
    yield* Effect.sleep(\`\${ms} millis\`)
    yield* Effect.log(label)
    return label
  })

// What order do the logs print?
const program = Effect.all([
  task("A", 100),
  task("B", 50),
  task("C", 10),
])

// (A) A, B, C  (B) C, B, A  (C) all at once

// TODO: make them run concurrently so fastest finishes first`,
						solution: `import { Effect } from "effect"

const task = (label: string, ms: number) =>
  Effect.gen(function* () {
    yield* Effect.sleep(\`\${ms} millis\`)
    yield* Effect.log(label)
    return label
  })

// Answer: (A) A, B, C — sequential by default!
// Effect.all runs them one by one, in order.

// Fix: add concurrency option
const program = Effect.all(
  [task("A", 100), task("B", 50), task("C", 10)],
  { concurrency: "unbounded" }
)
// Now prints: C, B, A (fastest first)
// You can also use { concurrency: 2 } to limit parallelism —
// something Promise.all can't do without extra libraries.`,
					},
					{
						title: "Rewrite a for-loop with Effect.forEach",
						prompt:
							"Convert this imperative loop into Effect.forEach. Think about what the callback returns and what the final result looks like.",
						startCode: `import { Effect } from "effect"

const sendEmail = (to: string) =>
  Effect.succeed(\`sent to \${to}\`)

// Imperative version inside Effect.gen
const imperative = Effect.gen(function* () {
  const users = ["alice@x.com", "bob@x.com", "carol@x.com"]
  const results: string[] = []
  for (const user of users) {
    const result = yield* sendEmail(user)
    results.push(result)
  }
  return results
})

// TODO: rewrite using Effect.forEach in one line
const declarative = Effect.forEach(/* ??? */)`,
						solution: `import { Effect } from "effect"

const sendEmail = (to: string) =>
  Effect.succeed(\`sent to \${to}\`)

// Effect.forEach maps over items, running an Effect for each,
// and collects all success values into an array.
const declarative = Effect.forEach(
  ["alice@x.com", "bob@x.com", "carol@x.com"],
  (user) => sendEmail(user)
)
// Type: Effect<string[], never, never>
// Returns: ["sent to alice@x.com", "sent to bob@x.com", "sent to carol@x.com"]

// Like Effect.all, it's sequential by default.
// Add { concurrency: "unbounded" } to send in parallel:
const parallel = Effect.forEach(
  ["alice@x.com", "bob@x.com", "carol@x.com"],
  (user) => sendEmail(user),
  { concurrency: "unbounded" }
)`,
					},
					{
						title: "Effect.if — conditional without if/else",
						prompt:
							"Rewrite the generator's if/else as a pipeline using Effect.if. When would you prefer one over the other?",
						startCode: `import { Effect } from "effect"

const isAdmin = (role: string) => role === "admin"

// Generator style — normal TS if/else
const checkAccess = (role: string) =>
  Effect.gen(function* () {
    if (isAdmin(role)) {
      return yield* Effect.succeed("full access")
    } else {
      return yield* Effect.succeed("read only")
    }
  })

// TODO: rewrite as a pipeline using Effect.if
const checkAccessPipe = (role: string) =>
  Effect.if(/* ??? */)`,
						solution: `import { Effect } from "effect"

const isAdmin = (role: string) => role === "admin"

const checkAccessPipe = (role: string) =>
  Effect.if(isAdmin(role), {
    onTrue: () => Effect.succeed("full access"),
    onFalse: () => Effect.succeed("read only"),
  })
// Type: Effect<string, never, never>

// When to use which?
// - In a generator: just use normal if/else — it's simpler
// - In a pipe chain: Effect.if keeps the pipeline flat
// Both are valid. Don't force Effect.if where plain if/else reads better.`,
					},
					{
						title: "Effect.match — handle both outcomes",
						prompt:
							"Use Effect.match to convert a fallible Effect into a user-friendly message string, handling both success and failure without try/catch.",
						startCode: `import { Effect } from "effect"

const parseAge = (input: string) =>
  Effect.try({
    try: () => {
      const n = Number(input)
      if (isNaN(n)) throw new Error("not a number")
      return n
    },
    catch: () => new Error("invalid age"),
  })

// TODO: use Effect.match to produce a string message for both cases
// Success → "Your age is 25"
// Failure → "Error: invalid age"
const getMessage = (input: string) =>
  parseAge(input).pipe(
    Effect.match({
      // ???
    })
  )`,
						solution: `import { Effect } from "effect"

const parseAge = (input: string) =>
  Effect.try({
    try: () => {
      const n = Number(input)
      if (isNaN(n)) throw new Error("not a number")
      return n
    },
    catch: () => new Error("invalid age"),
  })

// Effect.match handles BOTH success and failure,
// collapsing them into a single non-failing Effect.
const getMessage = (input: string) =>
  parseAge(input).pipe(
    Effect.match({
      onSuccess: (age) => \`Your age is \${age}\`,
      onFailure: (err) => \`Error: \${err.message}\`,
    })
  )
// Type: Effect<string, never, never>  — the error channel is gone!

// Effect.runSync(getMessage("25"))   → "Your age is 25"
// Effect.runSync(getMessage("abc"))  → "Error: invalid age"

// match returns a plain value → the result can't fail.
// matchEffect returns an Effect → use it when your handler needs to do more Effects.`,
					},
				],
				code: `// Normal JS control flow works in generators
const program = Effect.gen(function* () {
  const user = yield* getUser(id)
  if (user.role === "admin") {
    yield* grantAccess()
  }
  // Effect.all — sequential by default!
  const [posts, comments] = yield* Effect.all(
    [fetchPosts(user.id), fetchComments(user.id)],
    { concurrency: "unbounded" } // parallel
  )
})`,
			},
		],
	},
	{
		phase: "Error Handling",
		slug: "error-handling",
		phaseColor: "#D4C5C7",
		steps: [
			{
				id: 7,
				title: "The Two Error Types",
				subtitle: "Expected vs Unexpected — the core insight",
				tweet: true,
				duration: "20 min",
				content:
					"In TypeScript, try/catch treats all errors the same — you never know what a function might throw. Effect splits errors into two categories. The rule is simple: could a user or the outside world cause this error? → Effect.fail (expected). Should it be impossible if the code is correct? → Effect.die (defect). You don't use Effect.die because you expect a bug — you use it as a safety net for things you believe are impossible, so if you're wrong, you crash loudly with a clear message instead of silently continuing with bad state.",
				keyIdea:
					"Expected errors (Effect.fail) go in the E type — the compiler forces callers to handle them. Defects (Effect.die) guard invariants — conditions that should never happen if the code is correct. They're not predictions of bugs, they're safety nets. When one fires, you get a clear message + full fiber trace in Cause, making it easy to debug.",
				concepts: [
					{
						name: "Expected errors (E channel)",
						desc: "Things that CAN happen in normal operation: user not found, invalid input, network timeout. They're in the type signature. Callers must handle them.",
					},
					{
						name: "Defects (unexpected errors)",
						desc: "Safety nets for things you believe are impossible if the code is correct: an unreachable switch case, a missing config at startup, corrupted internal state. You don't predict these — you guard against them so you crash loudly instead of silently continuing.",
					},
					{
						name: "The decision rule",
						desc: "Ask: should this be impossible if my code is correct? Yes → Effect.die (guard the invariant). No, it can happen in normal operation → Effect.fail (let the caller handle it).",
					},
					{
						name: "Effect.fail(new MyError())",
						desc: "Creates an expected error. It shows up in the type: Effect<never, MyError, never>",
					},
					{
						name: "Effect.die(message)",
						desc: "Creates a defect. NOT in the type: Effect<never, never, never>. Use when the error means your program has a bug.",
					},
					{
						name: "Effect.dieMessage(text)",
						desc: "Convenience for Effect.die(new RuntimeException(text)). Use for quick defects with a message.",
					},
					{
						name: "Cause<E>",
						desc: "The data type that tracks the full error history — failures, defects, interruptions, and even parallel/sequential combinations of errors.",
					},
					{
						name: "Effect.catchAllDefect(effect, handler)",
						desc: "Catches defects and lets you recover. Use sparingly — defects usually mean a bug you should fix, not catch.",
					},
				],
				docsLink:
					"https://effect.website/docs/error-management/two-error-types/",
				trap: "Don't make everything an expected error. Use expected errors for things callers should handle (network failures, validation). Use defects for programming bugs. Also don't routinely catch defects — if you find yourself using catchAllDefect often, you're probably misclassifying errors.",
				code: `// --- The question: could a user cause this error? ---

// YES → Effect.fail (expected, in the type)
const findUser = (id: string) =>
  id === "0"
    ? Effect.fail(new UserNotFound({ id }))
    : Effect.succeed({ id, name: "Alice" })
// Type: Effect<User, UserNotFound, never>
// A missing user is normal — the caller should handle it

// NO → Effect.die (defect, NOT in the type)
// A switch that should be exhaustive hitting default:
type Status = "active" | "inactive"
const label = (s: Status) => {
  switch (s) {
    case "active": return Effect.succeed("Active")
    case "inactive": return Effect.succeed("Inactive")
    default: return Effect.die(\`Unhandled status: \${s}\`)
    // If this runs, a developer forgot to add a case.
    // No user action or retry can fix this.
  }
}
// Type: Effect<string, never, never>

// More defect examples:
// - Required env var missing at startup → die (deployment is broken)
// - JSON.parse fails on data YOU generated → die (your code is wrong)
// - Array access after you just checked length → die (logic bug)

// More expected error examples:
// - API returns 404 → fail (normal, show "not found" to user)
// - User submits invalid email → fail (validate and show message)
// - Network timeout → fail (retry or show error to user)`,
				practice: [
					{
						title: "Classify the errors",
						prompt:
							"A function fetches a user from an API. It can fail because the user doesn't exist (404) or because of a JSON parse error. Create the function using Effect.fail for the expected error and Effect.die for the defect.",
						startCode: `import { Effect } from "effect"

class UserNotFound {
  readonly _tag = "UserNotFound" as const
  constructor(readonly id: string) {}
}

// TODO: implement fetchUser
// - If id is "missing", fail with UserNotFound
// - If id is "corrupt", die with "Invalid JSON response"
// - Otherwise, succeed with { id, name: "Alice" }
const fetchUser = (id: string) => {
  // your code here
}`,
						solution: `import { Effect } from "effect"

class UserNotFound {
  readonly _tag = "UserNotFound" as const
  constructor(readonly id: string) {}
}

const fetchUser = (id: string) => {
  if (id === "missing") return Effect.fail(new UserNotFound("missing"))
  if (id === "corrupt") return Effect.die("Invalid JSON response")
  return Effect.succeed({ id, name: "Alice" })
}
// Type: Effect<{ id: string; name: string }, UserNotFound, never>
// UserNotFound is visible in the type — callers must handle it
// The JSON defect is NOT in the type — it's a bug`,
					},
					{
						title: "Spot the mistake",
						prompt:
							"This code uses Effect.fail for a missing config value at startup. A missing config means the deployment is broken — no user action can fix it. Refactor it to use the correct error type.",
						startCode: `import { Effect } from "effect"

class MissingConfig {
  readonly _tag = "MissingConfig" as const
  constructor(readonly key: string) {}
}

// This is wrong — a missing config at startup is not something
// callers should handle. It means the deployment is broken.
const getConfig = (key: string) => {
  const value = process.env[key]
  return value === undefined
    ? Effect.fail(new MissingConfig(key))
    : Effect.succeed(value)
}

// Fix it: use the right error type`,
						solution: `import { Effect } from "effect"

// A missing required config means the program can't run.
// A developer needs to fix the deployment — this is a defect.
const getConfig = (key: string) => {
  const value = process.env[key]
  return value === undefined
    ? Effect.die(\`Missing required config: \${key}\`)
    : Effect.succeed(value)
}
// Type: Effect<string, never, never>
// No error in the type — if this fails, fix the deployment.`,
					},
				],
			},
			{
				id: 8,
				title: "Handling Expected Errors",
				subtitle: "catchTag, catchAll, mapError",
				tweet: false,
				duration: "20 min",
				content:
					"Learn the operators to recover from, transform, or propagate typed errors.",
				keyIdea:
					"Use tagged errors (classes with a _tag field) + catchTag for surgical error recovery. This is the Effect equivalent of catching specific exception types.",
				concepts: [
					{
						name: "Tagged errors",
						desc: "Create error classes with _tag: class NotFound { readonly _tag = 'NotFound' }. This enables catchTag.",
					},
					{
						name: "Effect.catchTag('NotFound', handler)",
						desc: "Catches only errors with that _tag. Other errors pass through. The E type updates automatically — the caught error disappears from the union.",
					},
					{
						name: "Effect.catchTags({ A: handler, B: handler })",
						desc: "Handle multiple tagged errors at once. Each key is a _tag, each value is a handler. Cleaner than chaining multiple catchTag calls.",
					},
					{
						name: "Effect.catchAll(handler)",
						desc: "Catches all expected errors regardless of tag. You receive the error union and must return a new Effect.",
					},
					{
						name: "Effect.mapError(f)",
						desc: "Transforms the error without handling it — the error stays in E, just with a different type. Useful for wrapping low-level errors into domain errors.",
					},
					{
						name: "Effect.orElse(fallback)",
						desc: "If the Effect fails, discard the error and run a completely different Effect instead.",
					},
				],
				docsLink:
					"https://effect.website/docs/error-management/expected-errors/",
				trap: "catchTag only works with tagged unions. If your errors don't have _tag, use catchAll or match instead.",
				code: `// --- Setup: tagged error classes + a function that can fail ---
class NotFound { readonly _tag = "NotFound" as const; constructor(readonly id: string) {} }
class Forbidden { readonly _tag = "Forbidden" as const }

const getResource = (id: string) => {
  if (id === "missing") return Effect.fail(new NotFound(id))
  if (id === "secret") return Effect.fail(new Forbidden())
  return Effect.succeed({ id, name: "Resource" })
}
// Type: Effect<Resource, NotFound | Forbidden, never>

// --- catchTag: handle ONE specific error ---
const withFallback = getResource("missing").pipe(
  Effect.catchTag("NotFound", ({ id }) =>
    Effect.succeed({ id, name: "Default" })
  )
)
// Type: Effect<Resource, Forbidden, never>
// NotFound is gone from the type! Forbidden still needs handling.

// --- catchTags: handle MULTIPLE errors at once ---
const withAllHandled = getResource("missing").pipe(
  Effect.catchTags({
    NotFound: ({ id }) => Effect.succeed({ id, name: "Default" }),
    Forbidden: () => Effect.succeed({ id: "0", name: "Guest" }),
  })
)
// Type: Effect<Resource, never, never>
// All errors handled — no E left.

// --- catchAll: handle ALL expected errors (any tag) ---
const withCatchAll = getResource("missing").pipe(
  Effect.catchAll((error) =>
    Effect.succeed({ id: "0", name: \`Fallback (\${error._tag})\` })
  )
)
// Type: Effect<Resource, never, never>

// --- mapError: transform without handling ---
class AppError { readonly _tag = "AppError" as const; constructor(readonly cause: unknown) {} }

const withWrapped = getResource("missing").pipe(
  Effect.mapError((e) => new AppError(e))
)
// Type: Effect<Resource, AppError, never>
// Error is still there, just wrapped. Caller still must handle it.

// --- orElse: swap to a completely different Effect ---
const withOrElse = getResource("missing").pipe(
  Effect.orElse(() => Effect.succeed({ id: "0", name: "Fallback" }))
)
// Type: Effect<Resource, never, never>`,
				practice: [
					{
						title: "Use catchTag to handle one error",
						prompt:
							"The program below can fail with NotFound or RateLimited. Use catchTag to handle ONLY NotFound by returning a default post. Let RateLimited pass through.",
						startCode: `import { Effect } from "effect"

class NotFound { readonly _tag = "NotFound" as const; constructor(readonly id: string) {} }
class RateLimited { readonly _tag = "RateLimited" as const }

const getPost = (id: string) => {
  if (id === "missing") return Effect.fail(new NotFound(id))
  if (id === "busy") return Effect.fail(new RateLimited())
  return Effect.succeed({ id, title: "Hello World" })
}

// TODO: handle only NotFound, return { id, title: "Default Post" }
// RateLimited should still be in the error type
const program = getPost("missing")`,
						solution: `import { Effect } from "effect"

class NotFound { readonly _tag = "NotFound" as const; constructor(readonly id: string) {} }
class RateLimited { readonly _tag = "RateLimited" as const }

const getPost = (id: string) => {
  if (id === "missing") return Effect.fail(new NotFound(id))
  if (id === "busy") return Effect.fail(new RateLimited())
  return Effect.succeed({ id, title: "Hello World" })
}

const program = getPost("missing").pipe(
  Effect.catchTag("NotFound", ({ id }) =>
    Effect.succeed({ id, title: "Default Post" })
  )
)
// Type: Effect<{ id: string; title: string }, RateLimited, never>`,
					},
					{
						title: "Wrap errors with mapError",
						prompt:
							"Use mapError to wrap both NotFound and RateLimited into a single AppError type. Don't handle the errors — just transform them.",
						startCode: `import { Effect } from "effect"

class NotFound { readonly _tag = "NotFound" as const; constructor(readonly id: string) {} }
class RateLimited { readonly _tag = "RateLimited" as const }
class AppError { readonly _tag = "AppError" as const; constructor(readonly message: string) {} }

const getPost = (id: string) => {
  if (id === "missing") return Effect.fail(new NotFound(id))
  if (id === "busy") return Effect.fail(new RateLimited())
  return Effect.succeed({ id, title: "Hello World" })
}

// TODO: use mapError to wrap all errors into AppError
// Hint: use the _tag to build a descriptive message
const program = getPost("missing")`,
						solution: `import { Effect } from "effect"

class NotFound { readonly _tag = "NotFound" as const; constructor(readonly id: string) {} }
class RateLimited { readonly _tag = "RateLimited" as const }
class AppError { readonly _tag = "AppError" as const; constructor(readonly message: string) {} }

const getPost = (id: string) => {
  if (id === "missing") return Effect.fail(new NotFound(id))
  if (id === "busy") return Effect.fail(new RateLimited())
  return Effect.succeed({ id, title: "Hello World" })
}

const program = getPost("missing").pipe(
  Effect.mapError((e) => new AppError(
    e._tag === "NotFound"
      ? \`Post \${e.id} not found\`
      : "Too many requests"
  ))
)
// Type: Effect<{ id: string; title: string }, AppError, never>
// Error is still there — just unified into one type.`,
					},
					{
						title: "Handle all errors with catchTags",
						prompt:
							"Use catchTags to handle both NotFound and RateLimited in a single call. Return a fallback post for NotFound and retry message for RateLimited.",
						startCode: `import { Effect } from "effect"

class NotFound { readonly _tag = "NotFound" as const; constructor(readonly id: string) {} }
class RateLimited { readonly _tag = "RateLimited" as const }

const getPost = (id: string) => {
  if (id === "missing") return Effect.fail(new NotFound(id))
  if (id === "busy") return Effect.fail(new RateLimited())
  return Effect.succeed({ id, title: "Hello World" })
}

// TODO: use catchTags to handle both errors
// NotFound → succeed with { id, title: "Default Post" }
// RateLimited → succeed with { id: "0", title: "Try again later" }
const program = getPost("missing")`,
						solution: `import { Effect } from "effect"

class NotFound { readonly _tag = "NotFound" as const; constructor(readonly id: string) {} }
class RateLimited { readonly _tag = "RateLimited" as const }

const getPost = (id: string) => {
  if (id === "missing") return Effect.fail(new NotFound(id))
  if (id === "busy") return Effect.fail(new RateLimited())
  return Effect.succeed({ id, title: "Hello World" })
}

const program = getPost("missing").pipe(
  Effect.catchTags({
    NotFound: ({ id }) =>
      Effect.succeed({ id, title: "Default Post" }),
    RateLimited: () =>
      Effect.succeed({ id: "0", title: "Try again later" }),
  })
)
// Type: Effect<{ id: string; title: string }, never, never>
// Both errors handled — E is never.`,
					},
				],
			},
			{
				id: 9,
				title: "Retrying & Timeouts",
				subtitle: "Schedule-based resilience",
				tweet: false,
				duration: "15 min",
				content:
					"In TypeScript, retrying means a while loop with try/catch, manual delay, and a counter. Timeouts mean wrapping everything in Promise.race with a setTimeout. It's messy, error-prone, and doesn't compose. Effect gives you declarative retry and timeout that snap onto any Effect with .pipe().",
				keyIdea:
					'Retries use Schedule — a composable description of "when to retry". Timeouts add a new error type to your Effect\'s E channel automatically.',
				concepts: [
					{
						name: "Effect.retry(policy)",
						desc: "Retries on failure using a Schedule. The schedule controls timing and max attempts.",
					},
					{
						name: "Schedule.exponential('1 second')",
						desc: "Exponential backoff schedule. Compose with && or || for complex policies.",
					},
					{
						name: "Effect.timeout('5 seconds')",
						desc: "Fails with a TimeoutException if the effect takes too long.",
					},
					{
						name: "Effect.timeoutFail({ ... })",
						desc: "Like timeout but with a custom error type.",
					},
				],
				docsLink: "https://effect.website/docs/error-management/retrying/",
				trap: "timeout adds TimeoutException to your error channel. If you want to handle it specifically, use catchTag('TimeoutException', ...).",
				tsCode: `async function fetchWithRetry(url: string) {
  for (let i = 0; i < 3; i++) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(id)
      return await res.json()
    } catch (e) {
      if (i === 2) throw e
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i))
    }
  }
}
// 15 lines. Manual loop, manual backoff, manual abort.
// Want to change the strategy? Rewrite the whole function.`,
				code: `// --- Effect.retry: retry on failure ---
// Simplest: retry up to 3 times
const retried = fetchData.pipe(
  Effect.retry({ times: 3 })
)

// With a Schedule: exponential backoff, max 3 attempts
const withBackoff = fetchData.pipe(
  Effect.retry(
    Schedule.exponential("1 second").pipe(
      Schedule.compose(Schedule.recurs(3))
    )
  )
)
// Waits 1s, 2s, 4s between retries

// Fixed delay between retries
const withFixed = fetchData.pipe(
  Effect.retry(Schedule.fixed("500 millis"))
)

// --- Effect.timeout: fail if too slow ---
const withTimeout = fetchData.pipe(
  Effect.timeout("5 seconds")
)
// Type adds TimeoutException to the E channel automatically

// --- Effect.timeoutFail: custom error on timeout ---
class MyTimeout { readonly _tag = "MyTimeout" as const }

const withCustomTimeout = fetchData.pipe(
  Effect.timeoutFail({
    duration: "5 seconds",
    onTimeout: () => new MyTimeout()
  })
)
// Type: Effect<Data, OriginalError | MyTimeout, never>

// --- Composing them together ---
const resilient = fetchData.pipe(
  Effect.timeout("5 seconds"),
  Effect.retry({ times: 3 }),
  Effect.catchTag("TimeoutException", () =>
    Effect.succeed(cachedData)
  )
)
// timeout each attempt, retry up to 3 times, fallback on timeout`,
				practice: [
					{
						title: "Add retry with backoff",
						prompt:
							"The API call below is flaky. Add a retry policy with exponential backoff starting at 500ms, max 3 attempts.",
						startCode: `import { Effect, Schedule } from "effect"

const callApi = Effect.tryPromise(() =>
  fetch("https://api.example.com/data").then((r) => r.json())
)

// TODO: add retry with exponential backoff
// - Start at 500ms
// - Max 3 attempts
const program = callApi`,
						solution: `import { Effect, Schedule } from "effect"

const callApi = Effect.tryPromise(() =>
  fetch("https://api.example.com/data").then((r) => r.json())
)

const program = callApi.pipe(
  Effect.retry(
    Schedule.exponential("500 millis").pipe(
      Schedule.compose(Schedule.recurs(3))
    )
  )
)`,
					},
					{
						title: "Timeout with fallback",
						prompt:
							"Add a 3-second timeout to the slow effect. If it times out, return the cached value instead of failing.",
						startCode: `import { Effect } from "effect"

const slowQuery = Effect.tryPromise(() =>
  fetch("https://api.example.com/slow")
)
const cachedResult = { data: "cached" }

// TODO: add a 3-second timeout
// If it times out, return cachedResult
const program = slowQuery`,
						solution: `import { Effect } from "effect"

const slowQuery = Effect.tryPromise(() =>
  fetch("https://api.example.com/slow")
)
const cachedResult = { data: "cached" }

const program = slowQuery.pipe(
  Effect.timeout("3 seconds"),
  Effect.catchTag("TimeoutException", () =>
    Effect.succeed(cachedResult)
  )
)`,
					},
				],
			},
			{
				id: 10,
				title: "Yieldable Errors",
				subtitle: "Errors as first-class values",
				tweet: true,
				duration: "15 min",
				content:
					'A powerful Effect pattern: make your errors yieldable so you can use yield* to "throw" them in generators.',
				keyIdea:
					"Extend Data.TaggedError to create error classes that are both proper data types AND yieldable inside Effect.gen.",
				concepts: [
					{
						name: "Data.TaggedError<Tag>()",
						desc: "Creates an error class with _tag, structural equality, and yieldability built in.",
					},
					{
						name: "yield* new MyError()",
						desc: "Inside a generator, yielding a TaggedError short-circuits with that error — like throwing but type-safe.",
					},
				],
				docsLink:
					"https://effect.website/docs/error-management/yieldable-errors/",
				trap: "You need to extend Data.TaggedError, not just add a _tag manually, for the yield* trick to work.",
				code: `class NotFound extends Data.TaggedError("NotFound")<{
  readonly id: string
}> {}

const getUser = (id: string) => Effect.gen(function* () {
  const user = yield* findUser(id)
  if (!user) yield* new NotFound({ id }) // type-safe "throw"
  return user
})
// Type: Effect<User, NotFound, Database>`,
			},
		],
	},
	{
		phase: "Dependency Injection",
		slug: "dependency-injection",
		phaseColor: "#C5CDD8",
		steps: [
			{
				id: 11,
				title: "Services & Context",
				subtitle: "The R in Effect<A, E, R>",
				tweet: true,
				duration: "15 min",
				content:
					"The R type parameter tracks what an Effect NEEDS to run. This is Effect's built-in dependency injection — no framework needed. In TypeScript you'd wire dependencies manually or use a DI container. Effect makes dependencies part of the type system.",
				keyIdea:
					"Use Effect.Service to define services as classes with auto-generated layers. The R type ensures you provide all dependencies before running — the compiler is your DI container.",
				concepts: [
					{
						name: "Effect.Service",
						desc: "Defines a service as a class with tag, implementation, and auto-generated layers (Default, DefaultWithoutDependencies). The recommended way to create services.",
					},
					{
						name: "succeed option",
						desc: "Use when the implementation is a plain object — no async, no dependencies needed to build it. Example: { succeed: { log: (msg) => Effect.sync(...) } }",
					},
					{
						name: "effect option",
						desc: "Use when building the service requires an Effect — e.g. you need to yield* another service during construction. Example: { effect: Effect.gen(function* () { const dep = yield* Other; return { ... } }) }",
					},
					{
						name: "R type parameter",
						desc: "Accumulates required services. Effect<User, Error, Database | Logger> needs both Database and Logger provided before it can run.",
					},
					{
						name: "yield* ServiceTag",
						desc: "Inside Effect.gen, yield* MyService pulls the service from context. Type-safe — the compiler adds it to R automatically.",
					},
					{
						name: "Context.GenericTag",
						desc: "Lower-level API to create a service tag without Effect.Service. Useful for simple services or understanding what Effect.Service abstracts.",
					},
					{
						name: "dependencies option",
						desc: "Pass dependencies: [OtherService.Default] in Effect.Service to wire up the dependency graph declaratively. No manual pipe/provide needed.",
					},
					{
						name: "Effect.provideService(tag, impl)",
						desc: "Provides one service implementation inline. Removes it from R. Great for tests.",
					},
				],
				docsLink:
					"https://effect.website/docs/requirements-management/services/",
				trap: "The R type is like a checklist. The compiler won't let you run an Effect until R = never (all dependencies provided). If you see a type error about missing services, you forgot to provide something — not a bug, a feature.",
				tsCode: `// TypeScript: manual dependency wiring
interface Database {
  query(sql: string): Promise<unknown[]>
}

function createDatabase(pool: Pool): Database {
  return { query: (sql) => pool.query(sql) }
}

// Caller must remember to pass the right pool.
// Nothing prevents passing the wrong one.
// Nothing tracks which functions need a Database.
const db = createDatabase(pool)
const users = await db.query("SELECT * FROM users")`,
				code: `import { Effect, Context } from "effect"

// === Option 1: Effect.Service (recommended) ===
class Database extends Effect.Service<Database>()("Database", {
  effect: Effect.gen(function* () ({
    query: (sql: string) => Effect.tryPromise(() => pool.query(sql))
  })),
  dependencies: [ConnectionPool.Default]
}) {}

// Auto-generated:
// Database.Default — includes all dependencies
// Database.DefaultWithoutDependencies — requires them externally

const getUsers = Effect.gen(function* () {
  const db = yield* Database  // pulls from context, adds Database to R
  return yield* db.query("SELECT * FROM users")
})
// Type: Effect<User[], SqlError, Database>

// === Option 2: Context.GenericTag (lower-level) ===
interface Logger {
  readonly log: (msg: string) => Effect.Effect<void>
}
const Logger = Context.GenericTag<Logger>("Logger")

const program = Effect.gen(function* () {
  const logger = yield* Logger
  yield* logger.log("hello")
})
// Type: Effect<void, never, Logger>

// Provide and run
program.pipe(
  Effect.provideService(Logger, {
    log: (msg) => Effect.sync(() => console.log(msg))
  }),
  Effect.runPromise
)`,
				diagram: `  TS interface                     Effect Service
  ─────────────                    ──────────────
  interface Logger {               class Logger extends
    log(msg: string): void           Effect.Service<Logger>()("Logger", {
  }                                    succeed: { log: ... }
                                     }) {}
          │                                │
          │                                ├── Tag (unique identity)
          │                                ├── .Default (auto Layer)
          │                                └── R type tracking
          │                                        │
          ▼                                        ▼
  You wire it manually.            Compiler enforces it:
  Forget? Runtime error.           R ≠ never? Won't compile.


  ┌─────────────────────────────────────────────────────────┐
  │  yield* Logger     ← pulls Logger from context          │
  │         │                                               │
  │         └──► adds Logger to R automatically             │
  │                                                         │
  │  Effect<void, never, Logger>                            │
  │                      ^^^^^^                             │
  │              "this needs a Logger to run"               │
  │                                                         │
  │  pipe(Effect.provideService(Logger, impl))              │
  │                                                         │
  │  Effect<void, never, never>                             │
  │                      ^^^^^                              │
  │              "all dependencies satisfied — can run"     │
  └─────────────────────────────────────────────────────────┘`,
				practice: [
					{
						title: "Define a service and use it",
						prompt:
							"Create a Clock service using Effect.Service that has a single method `now` returning an Effect with the current timestamp. Then write a program that uses the service.",
						startCode: `import { Effect } from "effect"

// TODO: Define a Clock service with Effect.Service
// It should have a method: now: () => Effect.Effect<number>
// Use Effect.sync(() => Date.now()) in the implementation

// TODO: Write a program that uses Clock to get the current time
// const program = Effect.gen(function* () { ... })`,
						solution: `import { Effect } from "effect"

class Clock extends Effect.Service<Clock>()("Clock", {
  succeed: {
    now: () => Effect.sync(() => Date.now())
  }
}) {}

const program = Effect.gen(function* () {
  const clock = yield* Clock
  const time = yield* clock.now()
  return time
})
// Type: Effect<number, never, Clock>

// Run it:
// program.pipe(Effect.provide(Clock.Default), Effect.runPromise)`,
					},
					{
						title: "Swap a service for testing",
						prompt:
							"Given the Clock service below, provide a fake implementation that always returns 0. Use Effect.provideService to swap the real implementation for a test one.",
						startCode: `import { Effect } from "effect"

class Clock extends Effect.Service<Clock>()("Clock", {
  succeed: {
    now: () => Effect.sync(() => Date.now())
  }
}) {}

const program = Effect.gen(function* () {
  const clock = yield* Clock
  return yield* clock.now()
})

// TODO: provide a fake Clock that always returns 0
// and run the program
const test = program.pipe(
  // your code here
)`,
						solution: `import { Effect } from "effect"

class Clock extends Effect.Service<Clock>()("Clock", {
  succeed: {
    now: () => Effect.sync(() => Date.now())
  }
}) {}

const program = Effect.gen(function* () {
  const clock = yield* Clock
  return yield* clock.now()
})

const test = program.pipe(
  Effect.provideService(Clock, {
    now: () => Effect.succeed(0)
  }),
  Effect.runPromise
)
// test resolves to 0 — no real clock involved`,
					},
					{
						title: "Use Context.GenericTag",
						prompt:
							"Create a Random service using Context.GenericTag (not Effect.Service). Define the interface, the tag, a program that uses it, and provide an implementation.",
						startCode: `import { Effect, Context } from "effect"

// TODO: Define a Random interface with:
//   next: () => Effect.Effect<number>

// TODO: Create a tag with Context.GenericTag

// TODO: Write a program that calls random.next()

// TODO: Provide an implementation and run it`,
						solution: `import { Effect, Context } from "effect"

interface Random {
  readonly next: () => Effect.Effect<number>
}
const Random = Context.GenericTag<Random>("Random")

const program = Effect.gen(function* () {
  const random = yield* Random
  return yield* random.next()
})
// Type: Effect<number, never, Random>

const result = program.pipe(
  Effect.provideService(Random, {
    next: () => Effect.sync(() => Math.random())
  }),
  Effect.runPromise
)`,
					},
				],
			},
			{
				id: 12,
				title: "Layers",
				subtitle: "Composable dependency graphs",
				tweet: false,
				duration: "60 min",
				content:
					"In Step 11 you used Effect.provideService to give one service at a time. That works for simple cases. But real apps have chains: Database needs a ConnectionPool, which needs Config. Layers let you describe these chains once, and Effect wires them for you — in the right order, creating each service once. Key distinction: a Service is WHAT exists (the interface), a Layer is HOW to build it (the recipe). Effect.Service bundles both — that's why you already have layers via MyService.Default without writing any Layer code.",
				keyIdea:
					"A Layer is a recipe, not the service itself. Layer<Out, Err, In> says: 'give me In, and I'll build Out (or fail with Err)'. Effect.Service auto-generates layers — manual Layer.effect/Layer.succeed is for when you need more control.",
				concepts: [
					{
						name: "MyService.Default",
						desc: "Auto-generated by Effect.Service. Includes all declared dependencies. Use this 90% of the time — you already have layers without knowing it.",
					},
					{
						name: "Layer.succeed(tag, value)",
						desc: "Wraps a plain value as a layer. No async, no dependencies. Use for config objects, constants, feature flags.",
					},
					{
						name: "Layer.effect(tag, effect)",
						desc: "Builds a service from an Effect. Inside the effect, yield* other services to declare dependencies. Most common manual layer.",
					},
					{
						name: "Layer.merge(a, b)",
						desc: "Bundles two layers into one that provides both. Resolve each layer's dependencies first, then merge — so you're merging ready-to-use layers.",
					},
					{
						name: "Layer.provide(source)",
						desc: "Plugs one layer's output into another's input. 'LoggerLive needs Config? Here's ConfigLive.' → Layer.provide(ConfigLive).",
					},
					{
						name: "Effect.provide(layer)",
						desc: "Final step: hands a fully-built layer to your program. Removes those services from R.",
					},
					{
						name: "Memoization",
						desc: "Layers are created once per provide call by default. If Logger and Database both need Config, Config is built once and shared.",
					},
				],
				docsLink: "https://effect.website/docs/requirements-management/layers/",
				trap: "You don't always need manual layers. If you defined services with Effect.Service and its dependencies option, just use MyService.Default. Manual Layer.effect/Layer.merge is for advanced cases — don't reach for it by default.",
				tsCode: `// TypeScript: you wire dependencies by hand in main()
function createConfig() {
  return { logLevel: "INFO", connection: "postgres://..." }
}
function createLogger(config: Config) {
  return { log: (msg: string) => console.log(\`[\${config.logLevel}] \${msg}\`) }
}
function createDatabase(config: Config, logger: Logger) {
  return { query: (sql: string) => { logger.log(sql); /* ... */ } }
}

// The order matters. Forget a step? Runtime error.
// Two things need config? You pass it twice manually.
const config = createConfig()
const logger = createLogger(config)
const db = createDatabase(config, logger)`,
				code: `import { Effect, Context, Layer } from "effect"

// ── 1. Layer.succeed: wrap a plain value ──
// Use for config, constants — things that don't need setup
class Config extends Context.Tag("Config")<Config, {
  readonly logLevel: string
  readonly connection: string
}>() {}

const ConfigLive = Layer.succeed(Config, {
  logLevel: "INFO",
  connection: "postgres://localhost/mydb"
})
// Layer<Config, never, never>
// "I provide Config. I need nothing."

// ── 2. Layer.effect: build a service that needs other services ──
class Logger extends Context.Tag("Logger")<Logger, {
  readonly log: (msg: string) => Effect.Effect<void>
}>() {}

const LoggerLive = Layer.effect(
  Logger,
  Effect.gen(function* () {
    const config = yield* Config   // ← I need Config to build Logger
    return {
      log: (msg) => Effect.sync(() =>
        console.log(\`[\${config.logLevel}] \${msg}\`)
      )
    }
  })
)
// Layer<Logger, never, Config>
// "I provide Logger. I need Config."

// ── 3. Layer.provide: satisfy a layer's dependencies ──
// LoggerLive needs Config. Give it ConfigLive.
const LoggerResolved = LoggerLive.pipe(Layer.provide(ConfigLive))
// Layer<Logger, never, never>  ← resolved! No more dependencies.

// ── 4. Layer.merge: bundle resolved layers together ──
// Your program needs both Config AND Logger?
// Merge the resolved layers into one:
const AppLive = Layer.merge(ConfigLive, LoggerResolved)
// Layer<Config | Logger, never, never>
// Both resolved. Nothing left to wire.

// ── 5. Putting it all together ──
class Database extends Context.Tag("Database")<Database, {
  readonly query: (sql: string) => Effect.Effect<unknown>
}>() {}

const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const config = yield* Config
    const logger = yield* Logger
    return {
      query: (sql) => Effect.gen(function* () {
        yield* logger.log(\`Executing: \${sql}\`)
        return { result: \`data from \${config.connection}\` }
      })
    }
  })
)
// Layer<Database, never, Config | Logger>

// Database needs Config+Logger. AppLive provides both.
const MainLive = DatabaseLive.pipe(Layer.provide(AppLive))
// Layer<Database, never, never>  ← fully resolved!

const program = Effect.gen(function* () {
  const db = yield* Database
  return yield* db.query("SELECT * FROM users")
})

Effect.runPromise(Effect.provide(program, MainLive))`,
				diagram: `  Step 1: Each layer is a recipe
  ─────────────────────────────────────────────────────

  ConfigLive                    LoggerLive
  ┌──────────────────┐          ┌──────────────────────┐
  │ Layer.succeed     │          │ Layer.effect          │
  │                   │          │                       │
  │ provides: Config  │          │ provides: Logger      │
  │ needs:    nothing │          │ needs:    Config  ←── │── "I can't build
  └──────────────────┘          └──────────────────────┘     without Config"


  Step 2: Resolve dependencies (Layer.provide)
  ─────────────────────────────────────────────────────

  LoggerLive.pipe(Layer.provide(ConfigLive))
                        │
               "here's the Config you need"
                        │
                        ▼
               LoggerResolved
               ┌──────────────────────┐
               │ provides: Logger      │
               │ needs:    nothing ✓   │
               └──────────────────────┘


  Step 3: Bundle together (Layer.merge)
  ─────────────────────────────────────────────────────

  Layer.merge(ConfigLive, LoggerResolved)
                        │
                        ▼
                    AppLive
               ┌──────────────────────┐
               │ provides: Config      │
               │           Logger      │
               │ needs:    nothing ✓   │
               └──────────────────────┘


  Step 4: Wire to your program (Effect.provide)
  ─────────────────────────────────────────────────────

  program ──── needs Config + Logger
      │
      │  Effect.provide(program, AppLive)
      │
      ▼
  runnable ── needs nothing → Effect.runPromise(runnable)`,
				practice: [
					{
						title: "Use Effect.Service layers (the easy path)",
						prompt:
							"Most of the time you don't write layers manually. Create a Logger and a Metrics service with Effect.Service, where Metrics depends on Logger. Then provide Metrics.Default to a program.",
						startCode: `import { Effect } from "effect"

// TODO: Create Logger with Effect.Service
// It should have: log(msg: string) => Effect.Effect<void>

// TODO: Create Metrics with Effect.Service
// It should have: track(event: string) => Effect.Effect<void>
// Metrics should depend on Logger (use dependencies option)

// TODO: Write a program that uses Metrics, provide Metrics.Default`,
						solution: `import { Effect } from "effect"

class Logger extends Effect.Service<Logger>()("Logger", {
  succeed: {
    log: (msg: string) => Effect.sync(() => console.log(msg))
  }
}) {}

class Metrics extends Effect.Service<Metrics>()("Metrics", {
  effect: Effect.gen(function* () {
    const logger = yield* Logger
    return {
      track: (event: string) => logger.log(\`[metric] \${event}\`)
    }
  }),
  dependencies: [Logger.Default]
}) {}

const program = Effect.gen(function* () {
  const metrics = yield* Metrics
  yield* metrics.track("page_view")
})

// Metrics.Default includes Logger automatically
Effect.runPromise(program.pipe(Effect.provide(Metrics.Default)))`,
					},
					{
						title: "Build a layer with Layer.succeed",
						prompt:
							"Create a Config service using Context.Tag and a ConfigLive layer using Layer.succeed. Config has a port (number) and host (string).",
						startCode: `import { Effect, Context, Layer } from "effect"

// TODO: Define Config with Context.Tag
// TODO: Create ConfigLive with Layer.succeed`,
						solution: `import { Effect, Context, Layer } from "effect"

class Config extends Context.Tag("Config")<Config, {
  readonly port: number
  readonly host: string
}>() {}

const ConfigLive = Layer.succeed(Config, {
  port: 3000,
  host: "localhost"
})
// Layer<Config, never, never>`,
					},
					{
						title: "Wire a dependent layer with Layer.effect",
						prompt:
							"Given Config below, create a Server service that depends on Config. Use Layer.effect. Then use Layer.provide to plug ConfigLive into ServerLive.",
						startCode: `import { Effect, Context, Layer } from "effect"

class Config extends Context.Tag("Config")<Config, {
  readonly port: number
  readonly host: string
}>() {}

const ConfigLive = Layer.succeed(Config, {
  port: 3000,
  host: "localhost"
})

// TODO: Define Server service (with a start() method returning Effect<void>)
// TODO: Create ServerLive with Layer.effect — yield* Config inside
// TODO: Use Layer.provide to give ConfigLive to ServerLive`,
						solution: `import { Effect, Context, Layer } from "effect"

class Config extends Context.Tag("Config")<Config, {
  readonly port: number
  readonly host: string
}>() {}

const ConfigLive = Layer.succeed(Config, {
  port: 3000,
  host: "localhost"
})

class Server extends Context.Tag("Server")<Server, {
  readonly start: () => Effect.Effect<void>
}>() {}

const ServerLive = Layer.effect(
  Server,
  Effect.gen(function* () {
    const config = yield* Config
    return {
      start: () => Effect.sync(() =>
        console.log(\`Listening on \${config.host}:\${config.port}\`)
      )
    }
  })
)
// Layer<Server, never, Config> — needs Config

// Plug ConfigLive into ServerLive:
const ServerResolved = ServerLive.pipe(Layer.provide(ConfigLive))
// Layer<Server, never, never> — fully resolved!`,
					},
					{
						title: "Merge two layers together",
						prompt:
							"You have ConfigLive and LoggerLive (which depends on Config). Your program needs both Config and Logger. First resolve LoggerLive's dependency, then merge both resolved layers.",
						startCode: `import { Effect, Context, Layer } from "effect"

class Config extends Context.Tag("Config")<Config, {
  readonly env: string
}>() {}
const ConfigLive = Layer.succeed(Config, { env: "production" })

class Logger extends Context.Tag("Logger")<Logger, {
  readonly log: (msg: string) => Effect.Effect<void>
}>() {}
const LoggerLive = Layer.effect(Logger, Effect.gen(function* () {
  const config = yield* Config
  return { log: (msg) => Effect.sync(() => console.log(\`[\${config.env}] \${msg}\`)) }
}))

// TODO: 1. Resolve LoggerLive by providing ConfigLive to it
// TODO: 2. Merge ConfigLive and the resolved Logger layer
// TODO: 3. Provide AppLive to the program

const program = Effect.gen(function* () {
  const logger = yield* Logger
  yield* logger.log("hello")
})`,
						solution: `import { Effect, Context, Layer } from "effect"

class Config extends Context.Tag("Config")<Config, {
  readonly env: string
}>() {}
const ConfigLive = Layer.succeed(Config, { env: "production" })

class Logger extends Context.Tag("Logger")<Logger, {
  readonly log: (msg: string) => Effect.Effect<void>
}>() {}
const LoggerLive = Layer.effect(Logger, Effect.gen(function* () {
  const config = yield* Config
  return { log: (msg) => Effect.sync(() => console.log(\`[\${config.env}] \${msg}\`)) }
}))

// 1. Resolve LoggerLive's dependency on Config
const LoggerResolved = LoggerLive.pipe(Layer.provide(ConfigLive))
// Layer<Logger, never, never>  ← no more dependencies

// 2. Merge two resolved layers
const AppLive = Layer.merge(ConfigLive, LoggerResolved)
// Layer<Config | Logger, never, never>  ← both ready!

const program = Effect.gen(function* () {
  const logger = yield* Logger
  yield* logger.log("hello")
})

Effect.runPromise(Effect.provide(program, AppLive))`,
					},
				],
			},
		],
	},
	{
		phase: "Resource Management",
		slug: "resource-management",
		phaseColor: "#D8D4C5",
		steps: [
			{
				id: 13,
				title: "Scope & acquireRelease",
				subtitle: "Never leak a resource again",
				tweet: false,
				duration: "45 min",
				content:
					"In TypeScript you use try/finally to clean up resources — but it's easy to forget, doesn't compose, and gets messy with multiple resources. Scope ensures resources (DB connections, file handles, sockets) are always cleaned up — even on errors or interruption. Acquire runs uninterruptibly (can't be cancelled halfway), and release is guaranteed. Multiple resources are released in reverse order (LIFO), just like nested try/finally blocks.",
				keyIdea:
					"Effect.acquireRelease pairs an acquire Effect with a release Effect. The release is GUARANTEED to run — on success, failure, or interruption. Scope manages the lifecycle automatically.",
				concepts: [
					{
						name: "Effect.acquireRelease(acquire, release)",
						desc: "Creates a scoped resource. Acquire runs uninterruptibly. Release receives the resource and an Exit value so you can react to how the scope ended.",
					},
					{
						name: "Effect.acquireUseRelease(acquire, use, release)",
						desc: "One-shot variant: acquire → use → release in one call. No Scope needed — good when you don't need to compose resources.",
					},
					{
						name: "Effect.scoped",
						desc: "Runs a scoped Effect, closing all acquired resources when done. Removes Scope from R.",
					},
					{
						name: "Scope (R parameter)",
						desc: "When R includes Scope, the Effect manages resources. Use Effect.scoped to remove it before running.",
					},
					{
						name: "Effect.addFinalizer(exit => ...)",
						desc: "Registers cleanup logic that runs when the scope closes. Receives Exit so you can log differently on failure vs success.",
					},
					{
						name: "Layer.scoped",
						desc: "Creates a Layer from a scoped Effect — the resource lives as long as the Layer's scope (typically the app lifetime).",
					},
				],
				docsLink: "https://effect.website/docs/resource-management/scope/",
				trap: "Don't forget Effect.scoped! Without it, Scope stays in R and you can't run the Effect. Think of it like try/finally — acquireRelease defines what to clean up, Effect.scoped is the block that triggers the cleanup.",
				tsCode: `// TypeScript: manual try/finally — fragile with multiple resources
async function fetchData() {
  const conn = await pool.connect()
  try {
    const file = await fs.open("/tmp/output", "w")
    try {
      const data = await conn.query("SELECT * FROM users")
      await file.write(JSON.stringify(data))
      return data
    } finally {
      await file.close() // must remember this
    }
  } finally {
    conn.release() // must remember this too
  }
  // Problems:
  // - Nested try/finally for each resource
  // - Easy to forget cleanup
  // - If file.close() throws, conn.release() still runs? (yes, but messy)
  // - Doesn't handle interruption/cancellation
}`,
				code: `// ── acquireRelease: define resource lifecycle ──
const dbConnection = Effect.acquireRelease(
  Effect.tryPromise(() => pool.connect()),       // acquire (uninterruptible)
  (conn, exit) => Effect.sync(() => {             // release (guaranteed)
    if (Exit.isFailure(exit)) console.log("cleaning up after failure")
    conn.release()
  })
)
// Type: Effect<Connection, Error, Scope>
//                                  ^^^^^ needs a scope to manage it

const program = Effect.gen(function* () {
  const conn = yield* dbConnection
  return yield* conn.query("SELECT * FROM users")
}).pipe(Effect.scoped) // ← closes scope → releases connection
// Type: Effect<QueryResult, Error, never>
//                                  ^^^^^ Scope removed, ready to run

// ── acquireUseRelease: one-shot, no Scope needed ──
const oneShot = Effect.acquireUseRelease(
  Effect.tryPromise(() => pool.connect()),         // acquire
  (conn) => conn.query("SELECT 1"),                // use
  (conn) => Effect.sync(() => conn.release())      // release
)
// Type: Effect<QueryResult, Error, never> — no Scope in R

// ── addFinalizer: register cleanup in a generator ──
const withCleanup = Effect.gen(function* () {
  yield* Effect.addFinalizer((exit) =>
    Effect.sync(() => console.log(\`ended with: \${exit._tag}\`))
  )
  return 42
}).pipe(Effect.scoped)

// ── Layer.scoped: resource lives as long as the app ──
const DbLive = Layer.scoped(
  Database,
  Effect.acquireRelease(
    Effect.tryPromise(() => pool.connect()),
    (conn) => Effect.sync(() => conn.release())
  ).pipe(Effect.map((conn) => ({ query: (sql) => conn.query(sql) })))
)`,
				diagram: `  TypeScript try/finally          Effect Scope
  ─────────────────────          ────────────────────

  try {                          Effect.acquireRelease(
    resource = acquire()           acquire,  ← uninterruptible
                                   release   ← guaranteed
                                 )

    use(resource)                yield* resource   // use it

  } finally {                    Effect.scoped     // closes scope
    resource.close()               → release runs automatically
  }                                → even on error or interruption


  Multiple resources — LIFO release order:
  ─────────────────────────────────────────

  const program = Effect.gen(function* () {
    const a = yield* resourceA    // acquired 1st
    const b = yield* resourceB    // acquired 2nd
    const c = yield* resourceC    // acquired 3rd
    // use them...
  }).pipe(Effect.scoped)

  // On scope close:
  // release(c) → release(b) → release(a)
  // Just like nested try/finally — last in, first out`,
				practice: [
					{
						title: "Convert try/finally to acquireRelease",
						prompt:
							"Convert this TypeScript function to use Effect.acquireRelease + Effect.scoped. The resource is a file handle.",
						startCode: `import { Effect } from "effect"

// Original TypeScript:
// async function readFile(path: string) {
//   const handle = await fs.open(path, "r")
//   try {
//     return await handle.readFile("utf-8")
//   } finally {
//     await handle.close()
//   }
// }

// TODO: Rewrite using Effect.acquireRelease
// 1. Define fileHandle as a scoped resource
// 2. Use it in Effect.gen
// 3. Apply Effect.scoped`,
						solution: `import { Effect } from "effect"

const fileHandle = (path: string) => Effect.acquireRelease(
  Effect.tryPromise(() => fs.open(path, "r")),     // acquire
  (handle) => Effect.promise(() => handle.close())  // release
)

const readFile = (path: string) => Effect.gen(function* () {
  const handle = yield* fileHandle(path)
  return yield* Effect.tryPromise(() => handle.readFile("utf-8"))
}).pipe(Effect.scoped)
// Type: Effect<string, Error, never> — no Scope, ready to run`,
					},
					{
						title: "Use acquireUseRelease for a one-shot operation",
						prompt:
							"Use Effect.acquireUseRelease to acquire a DB connection, run a query, and release it. No Scope needed.",
						startCode: `import { Effect } from "effect"

// Helpers (pretend these exist):
// pool.connect(): Promise<Connection>
// conn.query(sql: string): Effect<Row[]>
// conn.release(): void

// TODO: Use Effect.acquireUseRelease to:
// 1. Acquire a connection from the pool
// 2. Query "SELECT * FROM orders"
// 3. Release the connection`,
						solution: `import { Effect } from "effect"

const getOrders = Effect.acquireUseRelease(
  Effect.tryPromise(() => pool.connect()),          // acquire
  (conn) => conn.query("SELECT * FROM orders"),     // use
  (conn) => Effect.sync(() => conn.release())       // release (guaranteed)
)
// Type: Effect<Row[], Error, never>
// No Scope in R — acquireUseRelease manages it internally`,
					},
					{
						title: "Compose multiple scoped resources",
						prompt:
							"Create two scoped resources (a DB connection and a file handle) and use them together in a single Effect.gen. Apply Effect.scoped once at the end. Predict the release order.",
						startCode: `import { Effect } from "effect"

// TODO:
// 1. Define dbConn as a scoped resource (acquireRelease)
// 2. Define fileHandle as a scoped resource (acquireRelease)
// 3. Use both in Effect.gen — query DB, write result to file
// 4. Apply Effect.scoped
// 5. Add a comment: which resource is released first?`,
						solution: `import { Effect } from "effect"

const dbConn = Effect.acquireRelease(
  Effect.tryPromise(() => pool.connect()),
  (conn) => Effect.sync(() => {
    console.log("releasing DB connection")
    conn.release()
  })
)

const fileHandle = Effect.acquireRelease(
  Effect.tryPromise(() => fs.open("/tmp/output", "w")),
  (handle) => Effect.promise(() => {
    console.log("closing file")
    return handle.close()
  })
)

const program = Effect.gen(function* () {
  const conn = yield* dbConn       // acquired 1st
  const file = yield* fileHandle   // acquired 2nd
  const data = yield* conn.query("SELECT * FROM users")
  yield* Effect.tryPromise(() => file.write(JSON.stringify(data)))
  return data
}).pipe(Effect.scoped)

// Release order: file closed FIRST, then DB connection released
// LIFO — last acquired, first released (like nested try/finally)`,
					},
					{
						title: "Use addFinalizer with Exit",
						prompt:
							"Use Effect.addFinalizer inside an Effect.gen to log whether the scope ended in success or failure. Use Exit.isSuccess to check.",
						startCode: `import { Effect, Exit } from "effect"

// TODO: Create an Effect.gen that:
// 1. Registers a finalizer with addFinalizer
// 2. The finalizer should log "success" or "failure" based on Exit
// 3. Returns "hello"
// 4. Wrap with Effect.scoped`,
						solution: `import { Effect, Exit } from "effect"

const program = Effect.gen(function* () {
  yield* Effect.addFinalizer((exit) =>
    Effect.sync(() => {
      if (Exit.isSuccess(exit)) {
        console.log("scope ended successfully")
      } else {
        console.log("scope ended with failure")
      }
    })
  )
  return "hello"
}).pipe(Effect.scoped)

// Effect.runPromise(program) logs "scope ended successfully"`,
					},
				],
			},
		],
	},
	{
		phase: "Schema & Data",
		slug: "schema-data",
		phaseColor: "#E5D5C5",
		steps: [
			{
				id: 14,
				title: "Schema Basics",
				subtitle: "Validation, parsing, encoding — one tool",
				tweet: true,
				duration: "60 min",
				content:
					"In TypeScript, you validate with Zod/Yup, define types manually, and serialize with yet another library. Schema does all three from one definition. It decodes (validate/parse external data), encodes (serialize for output), and infers TypeScript types — no duplication. Schema.decodeUnknown returns an Effect (can fail), Schema.decodeUnknownSync throws on failure.",
				keyIdea:
					"A Schema is bidirectional: it can decode (validate/parse external data) AND encode (serialize for output). One definition, multiple uses. Think of it as Zod + TypeScript types + serialization in one.",
				concepts: [
					{
						name: "Schema.Struct({ ... })",
						desc: "Defines an object schema. Like z.object() in Zod.",
					},
					{
						name: "Schema.decodeUnknown(schema)",
						desc: "Returns a function (data) => Effect<A, ParseError>. Effectful — compose in gen or pipe.",
					},
					{
						name: "Schema.decodeUnknownSync(schema)",
						desc: "Sync variant — throws ParseError on failure. Good for scripts or tests.",
					},
					{
						name: "Schema.encode(schema)",
						desc: "Serializes a typed value back to the encoded form. Bidirectional.",
					},
					{
						name: "Schema.String, Number, Boolean",
						desc: "Primitive schemas. Compose them into Struct, Array, Union, etc.",
					},
					{
						name: "Schema.Array(schema)",
						desc: "Array of a schema. Like z.array(). Schema.NonEmptyArray for non-empty.",
					},
					{
						name: "Schema.Union(A, B, ...)",
						desc: "Union of schemas. Like z.union(). For literals: Schema.Literal('a', 'b').",
					},
					{
						name: "Schema.optional / Schema.optionalWith",
						desc: "Makes a field optional. optionalWith supports defaults: { default: () => value }.",
					},
					{
						name: "Schema.Schema.Type<typeof S>",
						desc: "Extracts the TypeScript type from a schema. No manual interface needed.",
					},
				],
				docsLink: "https://effect.website/docs/schema/introduction/",
				trap: "Schema.decodeUnknown returns an Effect, not a plain value. You need to yield* it or use decodeUnknownSync. This is because decoding can fail with a ParseError — Effect makes that explicit in the type.",
				tsCode: `// TypeScript: separate validation lib + manual types + manual serialization
import { z } from "zod"

// 1. Define Zod schema for validation
const UserSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
  tags: z.array(z.string()).default([])
})

// 2. Extract type (at least Zod gives you this)
type User = z.infer<typeof UserSchema>

// 3. Parse (throws on failure — no typed errors)
const user = UserSchema.parse(apiResponse)

// 4. Serialize? Zod doesn't help — manual JSON.stringify
// 5. Transform for API response? Write another function
// 6. Different encoded vs decoded shapes? More manual work`,
				code: `import { Schema } from "effect"

// ── 1. Define schema — types are inferred automatically ──
const User = Schema.Struct({
  name: Schema.String,
  age: Schema.Number.pipe(Schema.int(), Schema.positive()),
  email: Schema.String.pipe(Schema.pattern(/@/)),
  role: Schema.Literal("admin", "user"),
  tags: Schema.optionalWith(Schema.Array(Schema.String), {
    default: () => []        // default value if missing
  })
})

// Type is inferred — no manual interface needed
type User = typeof User.Type
// { name: string; age: number; email: string; role: "admin" | "user"; tags: string[] }

// ── 2. Decode (effectful — ParseError is a typed error) ──
const parseUser = Schema.decodeUnknown(User)
const program = Effect.gen(function* () {
  const user = yield* parseUser(apiResponse)
  //    ^? User — fully typed
  return user
})

// ── 3. Decode (sync — throws on failure) ──
const user = Schema.decodeUnknownSync(User)(apiResponse)

// ── 4. Encode — serialize back to encoded form ──
const encoded = Schema.encodeSync(User)(user)

// ── 5. Compose schemas ──
const CreateUser = Schema.Struct({
  ...User.fields,
  password: Schema.String.pipe(Schema.minLength(8))
})`,
				diagram: `  Zod                              Effect Schema
  ───                              ─────────────

  z.object({...})                  Schema.Struct({...})
  z.string()                       Schema.String
  z.number()                       Schema.Number
  z.array(z.string())             Schema.Array(Schema.String)
  z.enum(["a","b"])                Schema.Literal("a", "b")
  z.union([a, b])                  Schema.Union(a, b)
  z.optional()                     Schema.optional
  .default(val)                    Schema.optionalWith(..., { default: () => val })
  .refine(fn)                      Schema.filter(fn)

  z.infer<typeof S>                typeof S.Type

  schema.parse(data)               Schema.decodeUnknownSync(S)(data)  // throws
                                   Schema.decodeUnknown(S)(data)      // returns Effect
                                   Schema.encodeSync(S)(data)         // encode back!

  Key difference:
  ┌─────────────────────────────────────────────────────┐
  │ Zod: decode only (one direction)                    │
  │ Schema: decode AND encode (bidirectional)            │
  │                                                     │
  │ Zod: parse() throws or returns                      │
  │ Schema: decodeUnknown returns Effect<A, ParseError>  │
  │         (typed errors, composable)                   │
  └─────────────────────────────────────────────────────┘`,
				practice: [
					{
						title: "Define a schema and decode data",
						prompt:
							"Create a Product schema with name (string), price (positive number), and inStock (boolean). Decode an unknown object using Schema.decodeUnknown inside Effect.gen.",
						startCode: `import { Schema, Effect } from "effect"

// TODO: Define a Product schema with:
// - name: string
// - price: positive number
// - inStock: boolean

// TODO: Extract the TypeScript type

// TODO: Decode this object using Schema.decodeUnknown in Effect.gen
const data = { name: "Widget", price: 9.99, inStock: true }`,
						solution: `import { Schema, Effect } from "effect"

const Product = Schema.Struct({
  name: Schema.String,
  price: Schema.Number.pipe(Schema.positive()),
  inStock: Schema.Boolean
})

type Product = typeof Product.Type

const program = Effect.gen(function* () {
  const product = yield* Schema.decodeUnknown(Product)(data)
  return product // Product type — fully typed
})

const data = { name: "Widget", price: 9.99, inStock: true }`,
					},
					{
						title: "Handle decode errors",
						prompt:
							"Decode invalid data with Schema.decodeUnknown and catch the ParseError. Log a message when decoding fails.",
						startCode: `import { Schema, Effect } from "effect"

const Age = Schema.Number.pipe(Schema.int(), Schema.positive())

// TODO: Try to decode the string "not a number" with Schema.decodeUnknown(Age)
// TODO: Catch the error and log "Invalid age"`,
						solution: `import { Schema, Effect } from "effect"

const Age = Schema.Number.pipe(Schema.int(), Schema.positive())

const program = Schema.decodeUnknown(Age)("not a number").pipe(
  Effect.catchTag("ParseError", () =>
    Effect.sync(() => console.log("Invalid age"))
  )
)`,
					},
					{
						title: "Use optional fields with defaults",
						prompt:
							"Create a Config schema where port is optional (defaults to 3000) and host is optional (defaults to 'localhost'). Decode an empty object and verify the defaults.",
						startCode: `import { Schema } from "effect"

// TODO: Create a Config schema where:
// - port: optional number, defaults to 3000
// - host: optional string, defaults to "localhost"

// TODO: Decode {} and verify you get { port: 3000, host: "localhost" }`,
						solution: `import { Schema } from "effect"

const Config = Schema.Struct({
  port: Schema.optionalWith(Schema.Number, { default: () => 3000 }),
  host: Schema.optionalWith(Schema.String, { default: () => "localhost" })
})

const result = Schema.decodeUnknownSync(Config)({})
// { port: 3000, host: "localhost" }`,
					},
				],
			},
			{
				id: 15,
				title: "Schema Classes & Transformations",
				subtitle: "Branded types, classes, transforms",
				tweet: false,
				duration: "45 min",
				content:
					"In TypeScript you define classes, interfaces, and validation separately. Schema classes unify all three: a class with built-in schema, type inference, structural equality, and constructor validation. Branded types solve a classic TS problem — preventing string-typed IDs from being mixed up. Transformations handle the \"API sends snake_case but I want camelCase\" problem bidirectionally.",
				keyIdea:
					"Schema classes combine schema + class definition. Branded types prevent mixing up primitives (UserId vs PostId). Transformations let you decode into different shapes and encode back.",
				concepts: [
					{
						name: 'class Foo extends Schema.Class<Foo>("Foo")({fields})',
						desc: "Creates a class with built-in schema, structural equality, and constructor validation.",
					},
					{
						name: 'Schema.TaggedClass<Self>("Tag")({fields})',
						desc: "Like Schema.Class but auto-adds a _tag field. Great for discriminated unions.",
					},
					{
						name: 'Schema.TaggedError<Self>("Tag")({fields})',
						desc: "Defines a typed error with _tag + schema. Use as your E type in Effect<A, E, R>.",
					},
					{
						name: "Schema.brand('UserId')",
						desc: "Creates a branded type. UserId is a string at runtime but a unique type at compile time. Prevents mixing up IDs.",
					},
					{
						name: "Schema.transform(from, to, { decode, encode })",
						desc: "Pure bidirectional transform between two schemas.",
					},
					{
						name: "Schema.transformOrFail(from, to, { decode, encode })",
						desc: "Effectful transform — decode/encode can fail with ParseError.",
					},
					{
						name: "Schema.filter(predicate)",
						desc: "Adds validation to a schema. Like z.refine(). Returns a ParseError on failure.",
					},
					{
						name: "Schema.withConstructorDefault(() => value)",
						desc: "Sets a default for class constructors. Field is required in decode but optional in new Foo().",
					},
				],
				docsLink: "https://effect.website/docs/schema/classes/",
				trap: "Schema classes are NOT regular TS classes. They have structural equality (two instances with same data are equal) and a _tag. Don't add mutable state to them — treat them as immutable data.",
				tsCode: `// TypeScript: separate class, validation, and type definitions
interface UserData {
  id: string
  name: string
  createdAt: string  // ISO string from API
}

class User {
  readonly id: string
  readonly name: string
  readonly createdAt: Date  // Parsed to Date internally

  constructor(data: UserData) {
    // Manual validation
    if (!data.id) throw new Error("id required")
    if (!data.name) throw new Error("name required")
    this.id = data.id
    this.name = data.name
    this.createdAt = new Date(data.createdAt)  // Manual transform
  }
}

// Problems:
// - No type-safe error handling (throws generic Error)
// - No encode back to API format
// - UserId and PostId are both just "string" — easy to mix up
// - Two users with same data are !== (reference equality)
type UserId = string   // ← nothing stops you passing a PostId here
type PostId = string`,
				code: `import { Schema } from "effect"

// ── Schema.Class: schema + class in one ──
class User extends Schema.Class<User>("User")({
  id: Schema.String,
  name: Schema.NonEmptyString,
  createdAt: Schema.Date         // decodes ISO string → Date, encodes Date → string
}) {
  // Access fields via this — just like a normal class
  greet(): string {
    return \`Hi, I'm \${this.name} (id: \${this.id})\`
  }

  get displayName(): string {
    return this.name.toUpperCase()
  }
}

const user = new User({ id: "1", name: "Alice", createdAt: new Date() })
user.name         // "Alice" — access fields directly
user.greet()      // "Hi, I'm Alice (id: 1)"
user.displayName  // "ALICE"
// ✓ Constructor validates fields
// ✓ Structural equality: new User({...}) === new User({...}) if same data

// ── Schema.TaggedClass: auto _tag for discriminated unions ──
class Circle extends Schema.TaggedClass<Circle>()("Circle", {
  radius: Schema.Number
}) {}

class Square extends Schema.TaggedClass<Square>()("Square", {
  side: Schema.Number
}) {}

const Shape = Schema.Union(Circle, Square)
type Shape = typeof Shape.Type
// { _tag: "Circle", radius: number } | { _tag: "Square", side: number }

// ── Schema.TaggedError: typed errors with schema ──
class NotFound extends Schema.TaggedError<NotFound>()("NotFound", {
  message: Schema.String,
  resourceId: Schema.String
}) {}
// Use: Effect<User, NotFound, Deps>

// ── Branded types: prevent ID mixups ──
const UserId = Schema.String.pipe(Schema.brand("UserId"))
const PostId = Schema.String.pipe(Schema.brand("PostId"))
type UserId = typeof UserId.Type  // string & Brand<"UserId">
type PostId = typeof PostId.Type  // string & Brand<"PostId">

// const oops: UserId = "abc" as PostId  // ← compile error!

// ── Transform: different shapes for decode vs encode ──
const DateFromString = Schema.transform(
  Schema.String,                              // encoded (API)
  Schema.DateFromSelf,                        // decoded (app)
  {
    strict: true,
    decode: (s) => new Date(s),               // string → Date
    encode: (d) => d.toISOString()            // Date → string
  }
)

// ── Constructor defaults ──
class Post extends Schema.Class<Post>("Post")({
  title: Schema.String,
  published: Schema.Boolean.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => false)  // optional in constructor
  ),
  createdAt: Schema.Number.pipe(
    Schema.propertySignature,
    Schema.withConstructorDefault(() => Date.now())
  )
}) {}

const post = new Post({ title: "Hello" })
// { title: "Hello", published: false, createdAt: 1712345678901 }`,
				diagram: `  Regular TS class              Schema.Class
  ────────────────              ────────────

  class User {                  class User extends Schema.Class<User>("User")({
    id: string                    id: Schema.String,
    name: string                  name: Schema.String,
  }                             }) {}

  Manual validation             ✓ Constructor validates automatically
  Reference equality            ✓ Structural equality
  No serialization              ✓ Encode/decode built-in
  No _tag                       ✓ _tag for discriminated unions (TaggedClass)

  Branded types:
  ──────────────
  type UserId = string          const UserId = Schema.String.pipe(Schema.brand("UserId"))
  type PostId = string          const PostId = Schema.String.pipe(Schema.brand("PostId"))

  fn(userId: string) ← accepts any string     fn(id: UserId) ← only UserId
  fn(postId)         ← no error!              fn(postId)     ← compile error!

  TaggedError:
  ────────────
  class NotFound extends Error { ... }         class NotFound extends Schema.TaggedError<NotFound>()
                                                 ("NotFound", { id: Schema.String }) {}
  try/catch (no type info)                     Effect<A, NotFound> (typed in E)`,
				practice: [
					{
						title: "Create a Schema.Class with TaggedError",
						prompt:
							"Define a User class using Schema.Class with id (string), name (non-empty string), and email (string). Define a UserNotFound error using Schema.TaggedError with a userId field.",
						startCode: `import { Schema, Effect } from "effect"

// TODO: Define User with Schema.Class
// Fields: id (string), name (non-empty string), email (string)

// TODO: Define UserNotFound with Schema.TaggedError
// Fields: userId (string)

// TODO: Write a function that returns Effect<User, UserNotFound>`,
						solution: `import { Schema, Effect } from "effect"

class User extends Schema.Class<User>("User")({
  id: Schema.String,
  name: Schema.NonEmptyString,
  email: Schema.String
}) {}

class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", {
  userId: Schema.String
}) {}

const findUser = (id: string): Effect.Effect<User, UserNotFound> =>
  id === "1"
    ? Effect.succeed(new User({ id: "1", name: "Alice", email: "alice@example.com" }))
    : Effect.fail(new UserNotFound({ userId: id }))`,
					},
					{
						title: "Use branded types to prevent ID mixups",
						prompt:
							"Create UserId and PostId branded types from Schema.String. Write a findUser function that accepts only UserId. Verify that passing a PostId causes a type error.",
						startCode: `import { Schema } from "effect"

// TODO: Create UserId and PostId branded types

// TODO: Write findUser that only accepts UserId

// TODO: Show that passing a PostId would be a compile error`,
						solution: `import { Schema, Effect } from "effect"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
const PostId = Schema.String.pipe(Schema.brand("PostId"))
type UserId = typeof UserId.Type
type PostId = typeof PostId.Type

const findUser = (id: UserId): Effect.Effect<string> =>
  Effect.succeed(\`User \${id}\`)

// Correct usage:
const userId = Schema.decodeUnknownSync(UserId)("user-123")
findUser(userId)  // ✓ compiles

// Type error:
// const postId = Schema.decodeUnknownSync(PostId)("post-456")
// findUser(postId)  // ✗ Argument of type 'PostId' is not assignable to 'UserId'`,
					},
					{
						title: "Build a discriminated union with TaggedClass",
						prompt:
							"Create Circle and Rectangle tagged classes. Create a Shape union. Decode an object with _tag: 'Circle' and radius: 5.",
						startCode: `import { Schema } from "effect"

// TODO: Define Circle with TaggedClass (field: radius)
// TODO: Define Rectangle with TaggedClass (fields: width, height)
// TODO: Create Shape = Schema.Union(Circle, Rectangle)
// TODO: Decode { _tag: "Circle", radius: 5 }`,
						solution: `import { Schema } from "effect"

class Circle extends Schema.TaggedClass<Circle>()("Circle", {
  radius: Schema.Number
}) {}

class Rectangle extends Schema.TaggedClass<Rectangle>()("Rectangle", {
  width: Schema.Number,
  height: Schema.Number
}) {}

const Shape = Schema.Union(Circle, Rectangle)
type Shape = typeof Shape.Type

const shape = Schema.decodeUnknownSync(Shape)({ _tag: "Circle", radius: 5 })
// Circle { _tag: "Circle", radius: 5 }`,
					},
				],
			},
			{
				id: 16,
				title: "Option & Either",
				subtitle: "Explicit absence, explicit branching",
				tweet: false,
				duration: "30 min",
				content:
					"In TypeScript you use null/undefined for absence and union types for branching — but they don't compose and are easy to forget. Option makes absence explicit: Some(value) or None. Either gives you type-safe branching: Right(success) or Left(failure). Both are plain data (not Effects) with a rich API for mapping, chaining, and matching. They bridge to existing TS code with fromNullable/getOrNull.",
				keyIdea:
					"Option replaces null/undefined with explicit Some(value) or None. Either<Right, Left> gives you a type-safe union of two outcomes. Both compose with pipe and match. They're data containers, not Effects.",
				concepts: [
					{
						name: "Option.some(value) / Option.none()",
						desc: "Creates an Option. Use instead of null/undefined for explicit absence.",
					},
					{
						name: "Option.fromNullable(value)",
						desc: "Converts null | undefined to None, everything else to Some. Bridges to existing code.",
					},
					{
						name: "Option.map(fn) / Option.flatMap(fn)",
						desc: "Transform the value inside Some. flatMap returns Option (can go from Some to None).",
					},
					{
						name: "Option.getOrElse(() => fallback)",
						desc: "Unwrap with a fallback for None. Like ?? in TypeScript but composable.",
					},
					{
						name: "Option.getOrNull / getOrUndefined",
						desc: "Convert back to nullable for interop with existing TS code.",
					},
					{
						name: "Either.right(value) / Either.left(error)",
						desc: "Creates an Either. Right = success, Left = failure (by convention).",
					},
					{
						name: "Either.map / Either.mapLeft",
						desc: "Transform the Right (success) or Left (error) side independently.",
					},
					{
						name: "Option.match / Either.match",
						desc: "Pattern match to handle both cases explicitly. Exhaustive — can't forget a case.",
					},
					{
						name: "Option.isSome / Option.isNone",
						desc: "Type guards. Narrow the type in if statements.",
					},
				],
				docsLink: "https://effect.website/docs/data-types/option/",
				trap: "Option and Effect are different! Option is a simple data container (like a box). Effect is a lazy computation (like a recipe). Don't confuse Effect.succeed(Option.some(x)) with just Option.some(x). Option is for data you already have; Effect is for work you want to do.",
				tsCode: `// TypeScript: null/undefined — implicit, easy to forget
function findUser(id: string): User | null {
  return db.get(id) ?? null
}

const user = findUser("123")
// Oops — forgot to check for null!
console.log(user.name) // 💥 runtime error

// TypeScript: union types for branching
type Result = { ok: true; data: User } | { ok: false; error: string }
function fetchUser(id: string): Result { ... }

const result = fetchUser("123")
if (result.ok) {
  result.data  // User
} else {
  result.error // string
}
// Works, but:
// - No standard API (map, flatMap, match)
// - Every team invents their own Result type
// - Doesn't compose with pipe`,
				code: `import { Option, Either, pipe } from "effect"

// ── Option: explicit absence ──
const user: Option.Option<User> = Option.fromNullable(db.get("123"))
// Option.some({ name: "Alice" }) or Option.none()

// Transform with map (only runs on Some)
const name = user.pipe(
  Option.map((u) => u.name),
  Option.getOrElse(() => "Anonymous")
)
// "Alice" or "Anonymous"

// Chain with flatMap (can return None)
const email = user.pipe(
  Option.flatMap((u) => Option.fromNullable(u.email)),
  Option.getOrElse(() => "no-email")
)

// Pattern match — exhaustive, can't forget a case
const greeting = Option.match(user, {
  onNone: () => "Hello, stranger",
  onSome: (u) => \`Hello, \${u.name}\`
})

// Interop: convert back to nullable
const nullable: User | null = Option.getOrNull(user)

// Type guards
if (Option.isSome(user)) {
  user.value.name  // narrowed to User
}

// ── Either: explicit branching ──
const parsed: Either.Either<number, string> = pipe(
  "42",
  (s) => {
    const n = parseInt(s)
    return isNaN(n)
      ? Either.left("not a number")   // Left = failure
      : Either.right(n)                // Right = success
  }
)

// Transform the success side
const doubled = parsed.pipe(Either.map((n) => n * 2))

// Transform the error side
const withContext = parsed.pipe(
  Either.mapLeft((e) => \`Parse failed: \${e}\`)
)

// Pattern match
Either.match(parsed, {
  onLeft: (err) => console.log(\`Error: \${err}\`),
  onRight: (val) => console.log(\`Value: \${val}\`)
})`,
				diagram: `  TypeScript                      Effect
  ──────────                      ──────

  null / undefined                Option.none()
  value                           Option.some(value)
  value ?? fallback               Option.getOrElse(() => fallback)
  value?.property                 Option.map((v) => v.property)
  if (value != null)              if (Option.isSome(opt))
  value!                          Option.getOrThrowWith(...)

  { ok, data } | { err }         Either.right(data) | Either.left(err)

  Composability:
  ──────────────
  // TypeScript — manual null checks at every step
  const a = getA()           // A | null
  const b = a ? getB(a) : null
  const c = b ? getC(b) : null

  // Option — flatMap chains, None short-circuits
  const c = pipe(
    getA(),                   // Option<A>
    Option.flatMap(getB),     // Option<B> — None if A was None
    Option.flatMap(getC),     // Option<C> — None if B was None
  )

  Option vs Effect:
  ─────────────────
  Option.some(42)     → data container (value exists NOW)
  Effect.succeed(42)  → lazy computation (value produced LATER)`,
				practice: [
					{
						title: "Replace null checks with Option",
						prompt:
							"Convert this TypeScript function to use Option. Chain two lookups with flatMap.",
						startCode: `import { Option, pipe } from "effect"

// Original TypeScript:
// function getUserEmail(id: string): string | null {
//   const user = db.get(id)        // User | null
//   if (!user) return null
//   const email = user.email       // string | null
//   if (!email) return null
//   return email
// }

// TODO: Rewrite using Option.fromNullable and Option.flatMap`,
						solution: `import { Option, pipe } from "effect"

const getUserEmail = (id: string): Option.Option<string> =>
  pipe(
    Option.fromNullable(db.get(id)),
    Option.flatMap((user) => Option.fromNullable(user.email))
  )

// Usage:
const email = getUserEmail("123").pipe(
  Option.getOrElse(() => "no-email@example.com")
)`,
					},
					{
						title: "Use Either for validation",
						prompt:
							"Write a parseAge function that returns Either<number, string>. Left if the input isn't a valid positive integer, Right if it is. Use Either.map to double the age.",
						startCode: `import { Either, pipe } from "effect"

// TODO: Write parseAge(input: string): Either<number, string>
// - Left("not a number") if parseInt fails
// - Left("must be positive") if <= 0
// - Right(age) if valid

// TODO: Use Either.map to double the result`,
						solution: `import { Either, pipe } from "effect"

const parseAge = (input: string): Either.Either<number, string> => {
  const n = parseInt(input)
  if (isNaN(n)) return Either.left("not a number")
  if (n <= 0) return Either.left("must be positive")
  return Either.right(n)
}

const doubled = parseAge("21").pipe(
  Either.map((age) => age * 2)
)
// Either.right(42)

const invalid = parseAge("abc").pipe(
  Either.map((age) => age * 2)
)
// Either.left("not a number") — map is skipped`,
					},
					{
						title: "Pattern match with Option.match",
						prompt:
							"Use Option.match to render a greeting. If the user exists, greet them by name. If not, show 'Hello, guest'.",
						startCode: `import { Option } from "effect"

type User = { name: string }
const currentUser: Option.Option<User> = Option.fromNullable(getUser())

// TODO: Use Option.match to produce:
// - "Hello, guest" when None
// - "Hello, {name}" when Some`,
						solution: `import { Option } from "effect"

type User = { name: string }
const currentUser: Option.Option<User> = Option.fromNullable(getUser())

const greeting = Option.match(currentUser, {
  onNone: () => "Hello, guest",
  onSome: (user) => \`Hello, \${user.name}\`
})`,
					},
				],
			},
		],
	},
	{
		phase: "Observability",
		slug: "observability",
		phaseColor: "#C5D8D4",
		steps: [
			{
				id: 17,
				title: "Structured Logging",
				subtitle: "From console.log to composable logs",
				tweet: false,
				duration: "40 min",
				content:
					"In TypeScript you scatter console.log calls everywhere, lose context in production, and bolt on Winston/Pino as an afterthought. Effect treats logging as a first-class Effect — composable, structured, annotated, and swappable without changing application code.",
				keyIdea:
					"Effect.log is an Effect, not a side effect. It composes in pipes and generators, carries structured data, and the logger implementation is a service you can swap via Layers — no code changes needed to go from dev console to production JSON to OpenTelemetry.",
				concepts: [
					{
						name: "Effect.log / logDebug / logInfo / logWarning / logError / logFatal",
						desc: "Log at different levels. Each returns an Effect — you must yield* or pipe it. Default level is INFO (logDebug is hidden unless you change the minimum).",
					},
					{
						name: "Logger.withMinimumLogLevel",
						desc: "Controls which log levels are visible. Wrap an effect to filter noise: pipe(myEffect, Logger.withMinimumLogLevel(LogLevel.Debug)).",
					},
					{
						name: "Effect.annotateLogs",
						desc: "Attaches key-value pairs to every log within a scope. Think of it like adding context (userId, requestId) that flows through all nested logs automatically.",
					},
					{
						name: "Effect.withLogSpan('label')",
						desc: "Wraps a section of code in a named timing span. Logs inside show elapsed time — useful for performance debugging without manual Date.now() bookkeeping.",
					},
					{
						name: "Logger.replace / Logger.none",
						desc: "Swap the logger implementation via Layers. Logger.none silences all logs (great for tests). You can provide a custom JSON logger for production.",
					},
				],
				docsLink: "https://effect.website/docs/observability/logging/",
				trap: "Effect.log returns an Effect — you must yield* it or include it in a pipe. console.log works inside Effect.gen but loses all structured logging benefits (no levels, no annotations, no spans, can't be swapped).",
				tsCode: `// TypeScript: scattered console.log, no structure
function processOrder(order: Order) {
  console.log("Processing order", order.id)
  try {
    const result = chargeCard(order)
    console.log("Order processed", order.id, result)
    return result
  } catch (err) {
    console.error("Order failed", order.id, err)
    throw err
  }
}

// Want structured JSON logs? Install winston/pino,
// create a logger instance, pass it everywhere,
// update every call site...`,
				code: `import { Effect, Logger, LogLevel } from "effect"

// ── Logging is an Effect — it composes naturally ──
const processOrder = (order: Order) =>
  Effect.gen(function* () {
    yield* Effect.log("Processing order")
    const result = yield* chargeCard(order)
    yield* Effect.log("Order processed")
    return result
  }).pipe(
    // annotations flow to ALL logs inside this scope
    Effect.annotateLogs("orderId", order.id),
    Effect.annotateLogs("customer", order.customerId),
    // timing span — logs show elapsed time
    Effect.withLogSpan("processOrder")
  )

// ── Swap the logger without touching application code ──
// Dev: default pretty logger
// Test: silence everything
const testProgram = processOrder(order).pipe(
  Effect.provide(Logger.none)
)
// Prod: set minimum level
const prodProgram = processOrder(order).pipe(
  Logger.withMinimumLogLevel(LogLevel.Warning)
)`,
				diagram: `  TypeScript                          Effect
  ─────────────────────────          ─────────────────────────────
  console.log("msg")                 yield* Effect.log("msg")
  │                                  │
  ├─ fire-and-forget                 ├─ returns Effect (composable)
  ├─ no levels                       ├─ logDebug/Info/Warning/Error
  ├─ no structure                    ├─ annotateLogs({ key: val })
  ├─ hardcoded destination           ├─ withLogSpan("timing")
  └─ refactor to change              └─ swap via Layer (0 code changes)

  winston.createLogger({...})        Logger layer
  ├─ import logger everywhere        ├─ provided once at the edge
  ├─ pass instance around            ├─ flows through all Effects
  └─ different API per library       └─ same Effect.log everywhere`,
				practice: [
					{
						title: "Add structured logging to a pipeline",
						prompt:
							"Add logging to this order processing pipeline. Use appropriate log levels, annotate with the orderId, and wrap in a log span.",
						startCode: `import { Effect } from "effect"

interface Order { id: string; amount: number }

const validateOrder = (order: Order) =>
  order.amount > 0
    ? Effect.succeed(order)
    : Effect.fail("Invalid amount")

const chargeCard = (order: Order) =>
  Effect.succeed({ transactionId: "tx_123" })

// TODO: Add logging, annotations, and a log span
const processOrder = (order: Order) =>
  Effect.gen(function* () {
    const validated = yield* validateOrder(order)
    const result = yield* chargeCard(validated)
    return result
  })`,
						solution: `import { Effect } from "effect"

interface Order { id: string; amount: number }

const validateOrder = (order: Order) =>
  order.amount > 0
    ? Effect.succeed(order)
    : Effect.fail("Invalid amount")

const chargeCard = (order: Order) =>
  Effect.succeed({ transactionId: "tx_123" })

const processOrder = (order: Order) =>
  Effect.gen(function* () {
    yield* Effect.log("Validating order")
    const validated = yield* validateOrder(order)
    yield* Effect.log("Charging card")
    const result = yield* chargeCard(validated)
    yield* Effect.log(\`Charged successfully: \${result.transactionId}\`)
    return result
  }).pipe(
    Effect.annotateLogs("orderId", order.id),
    Effect.withLogSpan("processOrder")
  )`,
					},
					{
						title: "Silence logs in tests",
						prompt:
							"The program below logs heavily. Run it with all logs silenced (for tests), then run it showing only Warning and above (for prod).",
						startCode: `import { Effect, Logger, LogLevel } from "effect"

const noisyProgram = Effect.gen(function* () {
  yield* Effect.logDebug("debug details")
  yield* Effect.log("processing...")
  yield* Effect.logWarning("disk almost full")
  return 42
})

// TODO: Run with no logs (test mode)
// const testResult = ...

// TODO: Run showing only Warning+ (prod mode)
// const prodResult = ...`,
						solution: `import { Effect, Logger, LogLevel } from "effect"

const noisyProgram = Effect.gen(function* () {
  yield* Effect.logDebug("debug details")
  yield* Effect.log("processing...")
  yield* Effect.logWarning("disk almost full")
  return 42
})

// Test mode: silence all logs
const testResult = noisyProgram.pipe(
  Effect.provide(Logger.none)
)

// Prod mode: Warning and above only
const prodResult = noisyProgram.pipe(
  Logger.withMinimumLogLevel(LogLevel.Warning)
)`,
					},
				],
			},
			{
				id: 18,
				title: "Tracing, Metrics & Supervision",
				subtitle: "Spans, counters, and fiber monitoring",
				tweet: false,
				duration: "45 min",
				content:
					"Distributed tracing and metrics usually require heavy instrumentation libraries and manual plumbing. Effect bakes them in: withSpan creates trace spans, Metric gives you type-safe counters/histograms/gauges, and Supervisor lets you monitor fiber lifecycles — all composable and exportable to OpenTelemetry.",
				keyIdea:
					"Effect.withSpan wraps any Effect in a tracing span with automatic parent-child nesting, error capture, and timing. Metrics are declared once and used like Effects. Both integrate with OpenTelemetry for zero-config export to Grafana, Jaeger, Datadog, etc.",
				concepts: [
					{
						name: "Effect.withSpan('name')",
						desc: "Wraps an Effect in a tracing span. Captures timing, errors, and automatically nests child spans. The most common tracing API you'll use.",
					},
					{
						name: "Effect.annotateCurrentSpan",
						desc: "Adds key-value attributes to the current span. Like log annotations but for traces — helps filter/search in your tracing backend.",
					},
					{
						name: "Metric.counter('name')",
						desc: "A monotonically increasing counter (e.g., requests served, errors occurred). Increment with Metric.increment or pipe through your Effect.",
					},
					{
						name: "Metric.histogram('name', { boundaries })",
						desc: "Tracks value distributions (e.g., response times, payload sizes). Records observations automatically when piped through Effects.",
					},
					{
						name: "Metric.gauge('name')",
						desc: "A point-in-time value (e.g., active connections, queue depth). Can go up or down unlike counters.",
					},
					{
						name: "Supervisor.track",
						desc: "Monitors fiber lifecycle (creation and termination). Use with Effect.supervised to observe concurrent work — how many fibers are active, when they finish.",
					},
				],
				docsLink: "https://effect.website/docs/observability/telemetry/tracing/",
				trap: "Effect.withSpan adds overhead — don't wrap every single function. Use it at meaningful operation boundaries (HTTP handlers, DB queries, external calls). Over-spanning creates noise in your tracing backend.",
				tsCode: `// TypeScript: manual OpenTelemetry instrumentation
import { trace } from "@opentelemetry/api"

const tracer = trace.getTracer("my-service")

async function processOrder(order: Order) {
  // manual span creation — verbose and error-prone
  const span = tracer.startSpan("processOrder")
  span.setAttribute("orderId", order.id)
  try {
    const result = await chargeCard(order)
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (err) {
    span.setStatus({ code: SpanStatusCode.ERROR })
    span.recordException(err)
    throw err
  } finally {
    span.end() // easy to forget!
  }
}

// Metrics: yet another library, separate API
import { metrics } from "@opentelemetry/api"
const counter = metrics.getMeter("my-service")
  .createCounter("orders_processed")
counter.add(1, { status: "success" })`,
				code: `import { Effect, Metric } from "effect"

// ── Tracing: just wrap with withSpan ──
// Attributes live OUTSIDE the business logic via withSpan options
const processOrder = (order: Order) =>
  Effect.gen(function* () {
    const result = yield* chargeCard(order)
    return result
  }).pipe(
    Effect.withSpan("processOrder", {
      attributes: { orderId: order.id, amount: order.amount }
    })
  )

// Use annotateCurrentSpan only when the value is computed INSIDE the generator
const processOrderDynamic = Effect.gen(function* () {
  const result = yield* chargeCard(order)
  // value only known after chargeCard — must annotate here
  yield* Effect.annotateCurrentSpan("transactionId", result.txId)
  return result
}).pipe(Effect.withSpan("processOrder"))

// Nested spans create parent-child traces automatically
const handleRequest = (req: Request) =>
  Effect.gen(function* () {
    const order = yield* parseOrder(req)  // no span
    const result = yield* processOrder(order) // child span
    yield* sendConfirmation(order)        // no span
    return result
  }).pipe(Effect.withSpan("handleRequest")) // parent span

// ── Metrics: declare once, use in pipelines ──
const orderCounter = Metric.counter("orders_processed")
const latencyHistogram = Metric.histogram("order_latency_ms", {
  boundaries: [10, 50, 100, 500, 1000]
})

// Increment counter on each order
const countedOrder = processOrder(order).pipe(
  Metric.increment(orderCounter)
)

// Track timing with histogram
const timedOrder = processOrder(order).pipe(
  Metric.trackDuration(latencyHistogram)
)`,
				diagram: `  TypeScript + OpenTelemetry           Effect
  ────────────────────────────        ─────────────────────────
  const span = tracer.startSpan()     Effect.withSpan("name")
  try { ... }                         │ automatic timing
  catch { span.recordException() }    │ automatic error capture
  finally { span.end() }              │ automatic nesting
  ── 8 lines per span ──              └─ 1 line per span

  Metrics (separate library):          Metric module:
  meter.createCounter("x")            Metric.counter("x")
  counter.add(1)                      Metric.increment(counter)
  ── imperative, manual ──            └─ composable in pipes

  Span hierarchy (same in both):
  ┌─ handleRequest (400ms) ─────────────────────┐
  │  ┌─ processOrder (350ms) ──────────────┐    │
  │  │  ┌─ chargeCard (200ms) ──────┐      │    │
  │  │  └───────────────────────────┘      │    │
  │  └─────────────────────────────────────┘    │
  └─────────────────────────────────────────────┘`,
				practice: [
					{
						title: "Add tracing spans to a pipeline",
						prompt:
							"Add tracing spans to this multi-step pipeline. The outer function should have a parent span, and each database call should have its own child span. Pass userId as a span attribute (outside the business logic).",
						startCode: `import { Effect } from "effect"

const fetchUser = (id: string) =>
  Effect.succeed({ id, name: "Alice" })

const fetchOrders = (userId: string) =>
  Effect.succeed([{ id: "order_1", amount: 42 }])

// TODO: Add spans — parent "getUser WithOrders",
// children "fetchUser" and "fetchOrders"
// Annotate parent span with userId
const getUserWithOrders = (userId: string) =>
  Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    const orders = yield* fetchOrders(userId)
    return { user, orders }
  })`,
						solution: `import { Effect } from "effect"

const fetchUser = (id: string) =>
  Effect.succeed({ id, name: "Alice" }).pipe(
    Effect.withSpan("fetchUser")
  )

const fetchOrders = (userId: string) =>
  Effect.succeed([{ id: "order_1", amount: 42 }]).pipe(
    Effect.withSpan("fetchOrders")
  )

const getUserWithOrders = (userId: string) =>
  Effect.gen(function* () {
    const user = yield* fetchUser(userId)
    const orders = yield* fetchOrders(userId)
    return { user, orders }
  }).pipe(
    // attributes outside the business logic
    Effect.withSpan("getUserWithOrders", {
      attributes: { userId }
    })
  )`,
					},
					{
						title: "Create and use a metric",
						prompt:
							"Create a counter metric that tracks how many users are fetched. Wire it so the counter increments every time fetchUser succeeds.",
						startCode: `import { Effect, Metric } from "effect"

const fetchUser = (id: string) =>
  Effect.succeed({ id, name: "Alice" })

// TODO: Create a counter metric "users_fetched"
// TODO: Wire it to fetchUser so it increments on success

const program = Effect.gen(function* () {
  yield* fetchUser("user_1")
  yield* fetchUser("user_2")
  yield* fetchUser("user_3")
  // counter should be 3 after this
})`,
						solution: `import { Effect, Metric } from "effect"

const usersFetched = Metric.counter("users_fetched")

const fetchUser = (id: string) =>
  Effect.succeed({ id, name: "Alice" }).pipe(
    Metric.increment(usersFetched)
  )

const program = Effect.gen(function* () {
  yield* fetchUser("user_1")
  yield* fetchUser("user_2")
  yield* fetchUser("user_3")
  // counter is now 3
})`,
					},
				],
			},
		],
	},
	{
		phase: "Concurrency",
		slug: "concurrency",
		phaseColor: "#D5C5D8",
		steps: [
			{
				id: 19,
				title: "Fibers & Basic Concurrency",
				subtitle: "Lightweight threads for TypeScript",
				tweet: true,
				duration: "60 min",
				content:
					"Fibers are Effect's concurrency primitive — lightweight virtual threads that can be forked, joined, and interrupted.",
				keyIdea:
					"Effect.fork runs an Effect on a new Fiber. Fiber.join waits for it. Fiber.interrupt cancels it. Effect.all with concurrency options is the easy path for most cases.",
				concepts: [
					{
						name: "Effect.fork(effect)",
						desc: "Starts a Fiber. Returns immediately with a Fiber handle. Child fiber is auto-supervised — killed when parent ends.",
					},
					{
						name: "Fiber.join(fiber)",
						desc: "Waits for a Fiber to complete. Returns the result as an Effect. Re-raises the fiber's error if it failed.",
					},
					{
						name: "Fiber.interrupt(fiber)",
						desc: "Cancels a running Fiber. Resources are cleaned up automatically via finalizers.",
					},
					{
						name: "Effect.all(effects, { concurrency: 'unbounded' })",
						desc: "Runs effects concurrently. The simple way to do parallelism. Also supports concurrency: number for limits.",
					},
					{
						name: "Effect.forEach(items, fn, { concurrency: N })",
						desc: "Map over items concurrently with a limit. Like Promise.all(items.map(fn)) but with backpressure.",
					},
					{
						name: "Effect.race(effects)",
						desc: "Returns the first effect to complete. Others are interrupted automatically.",
					},
					{
						name: "Effect.forkDaemon(effect)",
						desc: "Fork a fiber that outlives its parent. Runs until the global scope closes or it completes.",
					},
					{
						name: "Effect.forkScoped(effect)",
						desc: "Fork a fiber tied to the current Scope. Useful for resource-managed background work.",
					},
				],
				docsLink: "https://effect.website/docs/concurrency/fibers/",
				trap: "Fibers are low-level. For most concurrent work, use Effect.all with concurrency options, or Effect.forEach with concurrency. Only reach for raw Fibers when you need fine-grained control. Also: Effect.fork auto-supervises — the child dies when the parent does. If you need a background task that outlives the parent, use Effect.forkDaemon.",
				tsCode: `// TypeScript: manual concurrency with Promise.all
async function fetchAllUsers(ids: string[]) {
  // No concurrency limit — fires everything at once
  const users = await Promise.all(ids.map(id => fetchUser(id)))
  return users
}

// Want a concurrency limit? DIY with chunking or p-limit
import pLimit from "p-limit"
const limit = pLimit(5)
const users = await Promise.all(
  ids.map(id => limit(() => fetchUser(id)))
)

// Cancellation? AbortController per request, wire it yourself
const controller = new AbortController()
const result = await fetch(url, { signal: controller.signal })
// To cancel: controller.abort() — but who cleans up?`,
				code: `import { Effect, Fiber } from "effect"

const program = Effect.gen(function* () {
  // Fork a background task — returns immediately
  const fiber = yield* Effect.fork(longRunningJob)

  // Do other work concurrently...
  yield* processItems()

  // Wait for the background task
  const result = yield* Fiber.join(fiber)

  // ── High-level concurrency (preferred) ──

  // Run 10 tasks with concurrency limit (like p-limit but built-in)
  yield* Effect.forEach(urls, fetchUrl, { concurrency: 10 })

  // Run all effects concurrently, collect results
  const [a, b, c] = yield* Effect.all(
    [taskA, taskB, taskC],
    { concurrency: "unbounded" }
  )

  // Race — first to finish wins, others are interrupted
  const fastest = yield* Effect.race(fetchFromCDN, fetchFromOrigin)
})`,
				diagram: `  TypeScript / Promises                 Effect Fibers
  ─────────────────────────────         ──────────────────────────────────
  Promise.all([...])                    Effect.all([...], { concurrency })
  ├─ no concurrency limit               ├─ "unbounded" | number | "inherit"
  ├─ one rejects → all lost             ├─ structured error handling
  └─ no cancellation                    └─ losers auto-interrupted

  p-limit / manual chunking             Effect.forEach(items, fn, { concurrency: N })
  ├─ extra dependency                    ├─ built-in, zero deps
  └─ no cancellation                    └─ cancellation + backpressure

  AbortController                       Fiber interruption
  ├─ manual wiring per request           ├─ automatic (parent kills children)
  ├─ easy to forget cleanup              ├─ finalizers run automatically
  └─ no nested cancellation             └─ entire fiber tree interrupted

  new Worker() / worker_threads         Effect.fork / forkDaemon
  ├─ OS-level threads (heavy)            ├─ virtual threads (lightweight)
  ├─ serialization overhead              ├─ shared memory, zero-copy
  └─ manual lifecycle                   └─ auto-supervised (or daemon)`,
				practice: [
					{
						title: "Parallel fetch with concurrency limit",
						prompt:
							"Fetch a list of URLs concurrently, but limit to 3 at a time. Collect all results.",
						startCode: `import { Effect } from "effect"

const fetchUrl = (url: string) =>
  Effect.tryPromise(() => fetch(url).then(r => r.json()))

const urls = ["/api/1", "/api/2", "/api/3", "/api/4", "/api/5"]

// TODO: fetch all URLs with concurrency limited to 3
const program = Effect.???`,
						solution: `import { Effect } from "effect"

const fetchUrl = (url: string) =>
  Effect.tryPromise(() => fetch(url).then(r => r.json()))

const urls = ["/api/1", "/api/2", "/api/3", "/api/4", "/api/5"]

// Effect.forEach maps over items with a concurrency limit
// This is the Effect equivalent of p-limit + Promise.all
const program = Effect.forEach(urls, fetchUrl, { concurrency: 3 })
// Type: Effect<unknown[], UnknownException, never>`,
					},
					{
						title: "Fork, do work, then join",
						prompt:
							"Fork a slow background task, do some immediate work, then wait for the background result.",
						startCode: `import { Effect, Fiber } from "effect"

const slowTask = Effect.gen(function* () {
  yield* Effect.sleep("2 seconds")
  return 42
})

const quickTask = Effect.log("doing quick work")

// TODO: fork slowTask, run quickTask, then join the fiber
const program = Effect.gen(function* () {
  // 1. Fork slowTask into a fiber

  // 2. Run quickTask while slowTask runs in background

  // 3. Wait for the fiber and get the result

})`,
						solution: `import { Effect, Fiber } from "effect"

const slowTask = Effect.gen(function* () {
  yield* Effect.sleep("2 seconds")
  return 42
})

const quickTask = Effect.log("doing quick work")

const program = Effect.gen(function* () {
  // 1. Fork slowTask — returns immediately with a Fiber handle
  const fiber = yield* Effect.fork(slowTask)

  // 2. Run quickTask concurrently (slowTask is running in background)
  yield* quickTask

  // 3. Join the fiber — waits for slowTask to finish
  const result = yield* Fiber.join(fiber)
  // result = 42
  yield* Effect.log(\`Background task returned: \${result}\`)
})`,
					},
					{
						title: "Race two effects",
						prompt:
							"Race two API calls — return whichever responds first, automatically cancel the other.",
						startCode: `import { Effect } from "effect"

const fetchFromCDN = Effect.gen(function* () {
  yield* Effect.sleep("100 millis")
  return { source: "cdn", data: "fast" }
})

const fetchFromOrigin = Effect.gen(function* () {
  yield* Effect.sleep("500 millis")
  return { source: "origin", data: "slow" }
})

// TODO: race both — first to finish wins
const program = Effect.???`,
						solution: `import { Effect } from "effect"

const fetchFromCDN = Effect.gen(function* () {
  yield* Effect.sleep("100 millis")
  return { source: "cdn", data: "fast" }
})

const fetchFromOrigin = Effect.gen(function* () {
  yield* Effect.sleep("500 millis")
  return { source: "origin", data: "slow" }
})

// Effect.race returns the first to complete
// The loser is automatically interrupted — no cleanup needed
const program = Effect.race(fetchFromCDN, fetchFromOrigin)
// result: { source: "cdn", data: "fast" }`,
					},
				],
			},
			{
				id: 20,
				title: "Queue, Deferred, Semaphore",
				subtitle: "Coordination primitives",
				tweet: false,
				duration: "45 min",
				content:
					"When Fibers need to communicate or coordinate, Effect provides Queue (buffered channel), Deferred (one-shot promise), and Semaphore (concurrency limiter). Think of them as the building blocks Go developers get with channels, WaitGroups, and mutexes — but type-safe and composable.",
				keyIdea:
					"Queue = async channel between fibers. Deferred = a promise-like value set once. Semaphore = limit concurrent access to N. These compose with the rest of Effect seamlessly.",
				concepts: [
					{
						name: "Queue.bounded<A>(capacity)",
						desc: "Creates a bounded queue. Producers block (suspend the fiber) when full, consumers block when empty. Like a Go buffered channel.",
					},
					{
						name: "Queue.unbounded / Queue.sliding / Queue.dropping",
						desc: "Other queue strategies. Unbounded = no limit. Sliding = drop oldest when full. Dropping = drop newest when full.",
					},
					{
						name: "Queue.offer / Queue.take",
						desc: "Add to / take from the queue. Both return Effects. take suspends until an item is available.",
					},
					{
						name: "Queue.takeUpTo(queue, n) / Queue.takeAll",
						desc: "Batch consume: take up to N items, or drain everything currently available.",
					},
					{
						name: "Queue.shutdown(queue)",
						desc: "Terminates the queue. All waiting offers/takes are interrupted. Prevents further use.",
					},
					{
						name: "Deferred.make<A, E>()",
						desc: "Creates a deferred. Like a Promise you can complete from outside, but as an Effect.",
					},
					{
						name: "Deferred.succeed / Deferred.fail / Deferred.await",
						desc: "Complete a Deferred (once) with success or failure. await suspends until it's completed.",
					},
					{
						name: "Effect.makeSemaphore(n)",
						desc: "Limits concurrent access. semaphore.withPermits(1)(effect) limits to 1 at a time.",
					},
					{
						name: "PubSub.bounded<A>(capacity)",
						desc: "Publish/subscribe hub. Multiple subscribers each get every message. Like an EventEmitter but backpressured.",
					},
				],
				docsLink: "https://effect.website/docs/concurrency/queue/",
				trap: "Queue.take blocks the Fiber (not the thread). This is fine — Fibers are cheap. But don't create a queue and forget to consume it, or you'll leak memory. Also: Deferred can only be completed once — calling succeed/fail again is a no-op (returns false).",
				tsCode: `// TypeScript: manual coordination patterns

// Channel-like behavior? No built-in. Use arrays + polling
const queue: string[] = []
const enqueue = (item: string) => queue.push(item)
const dequeue = () => queue.shift() // undefined if empty — no waiting

// One-shot signal? Wrap a Promise with external resolve
let resolve: (value: string) => void
const deferred = new Promise<string>(r => { resolve = r })
resolve!("done") // easy to misuse, no type safety on completion

// Concurrency limit? p-limit or hand-rolled semaphore
import pLimit from "p-limit"
const limit = pLimit(3)
await Promise.all(tasks.map(t => limit(() => t())))

// Pub/sub? EventEmitter — no backpressure, no type safety
import { EventEmitter } from "events"
const emitter = new EventEmitter()
emitter.on("data", (msg) => { /* hope msg is the right type */ })
emitter.emit("data", { anything: "goes" })`,
				code: `import { Effect, Queue, Deferred, Fiber, PubSub } from "effect"

// ── Queue: producer/consumer channel ──
const producerConsumer = Effect.gen(function* () {
  const queue = yield* Queue.bounded<string>(10)

  // Producer fiber — pushes items
  const producer = yield* Effect.fork(
    Effect.forEach(
      ["a", "b", "c"],
      (item) => Queue.offer(queue, item),
      { concurrency: 1 }
    )
  )

  // Consumer — takes items one by one
  const first = yield* Queue.take(queue)  // suspends until available
  const batch = yield* Queue.takeUpTo(queue, 10)  // grab remaining

  yield* Fiber.join(producer)
  yield* Queue.shutdown(queue)
})

// ── Deferred: one-shot signal between fibers ──
const signaling = Effect.gen(function* () {
  const deferred = yield* Deferred.make<string, never>()

  // Worker waits for the signal
  const worker = yield* Effect.fork(
    Effect.gen(function* () {
      const value = yield* Deferred.await(deferred)
      yield* Effect.log(\`Got: \${value}\`)
    })
  )

  // Main fiber completes the deferred after some work
  yield* Effect.sleep("1 second")
  yield* Deferred.succeed(deferred, "go!")
  yield* Fiber.join(worker)
})

// ── Semaphore: limit concurrent access ──
const rateLimited = Effect.gen(function* () {
  const semaphore = yield* Effect.makeSemaphore(3)

  // Only 3 API calls run at a time
  yield* Effect.forEach(
    urls,
    (url) => semaphore.withPermits(1)(fetchUrl(url)),
    { concurrency: "unbounded" }
  )
})`,
				diagram: `  TypeScript                          Effect
  ─────────────────────────────       ─────────────────────────────────
  Array + polling                     Queue.bounded / unbounded
  ├─ no backpressure                   ├─ producer suspends when full
  ├─ no blocking consume               ├─ consumer suspends when empty
  └─ manual synchronization           └─ fiber-safe, composable

  Promise + external resolve          Deferred.make
  ├─ can be resolved multiple times    ├─ complete once (succeed/fail)
  ├─ no error channel                  ├─ typed success AND error
  └─ no cancellation                  └─ await is interruptible

  p-limit / hand-rolled               Effect.makeSemaphore(n)
  ├─ extra dependency                  ├─ built-in
  ├─ Promise-based only                ├─ works with all Effects
  └─ no cancellation                  └─ withPermits composes

  EventEmitter                        PubSub.bounded
  ├─ no backpressure                   ├─ backpressure built-in
  ├─ any type (unsafe)                 ├─ fully typed messages
  ├─ sync callbacks                    ├─ async fiber-based
  └─ memory leak footgun              └─ shutdown cleans up`,
				practice: [
					{
						title: "Producer-consumer with Queue",
						prompt:
							"Create a bounded queue. Fork a producer that offers numbers 1-5. In the main fiber, take all 5 items and return them.",
						startCode: `import { Effect, Queue, Fiber } from "effect"

const program = Effect.gen(function* () {
  // 1. Create a bounded queue with capacity 10

  // 2. Fork a producer that offers numbers 1 through 5

  // 3. Take 5 items from the queue (hint: use Queue.take in a loop or Effect.forEach)

  // 4. Join the producer fiber

  // 5. Return the collected items
})`,
						solution: `import { Effect, Queue, Fiber } from "effect"

const program = Effect.gen(function* () {
  // 1. Create a bounded queue
  const queue = yield* Queue.bounded<number>(10)

  // 2. Fork producer — offers 1 through 5
  const producer = yield* Effect.fork(
    Effect.forEach(
      [1, 2, 3, 4, 5],
      (n) => Queue.offer(queue, n)
    )
  )

  // 3. Take 5 items — each Queue.take suspends until an item is available
  const items = yield* Effect.forEach(
    [1, 2, 3, 4, 5],
    () => Queue.take(queue)
  )

  // 4. Join the producer
  yield* Fiber.join(producer)

  // 5. Return collected items
  return items // [1, 2, 3, 4, 5]
})`,
					},
					{
						title: "Signal between fibers with Deferred",
						prompt:
							"Use a Deferred to coordinate two fibers. Fiber A waits for a signal, then logs the received value. Fiber B sends the signal after a delay.",
						startCode: `import { Effect, Deferred, Fiber } from "effect"

const program = Effect.gen(function* () {
  // 1. Create a Deferred<string, never>

  // 2. Fork Fiber A: await the deferred, then log the value

  // 3. Fork Fiber B: sleep 500ms, then succeed the deferred with "hello"

  // 4. Join both fibers
})`,
						solution: `import { Effect, Deferred, Fiber } from "effect"

const program = Effect.gen(function* () {
  const signal = yield* Deferred.make<string, never>()

  // Fiber A: waits for the signal
  const fiberA = yield* Effect.fork(
    Effect.gen(function* () {
      const value = yield* Deferred.await(signal)
      yield* Effect.log(\`Received: \${value}\`)
      return value
    })
  )

  // Fiber B: sends the signal after a delay
  const fiberB = yield* Effect.fork(
    Effect.gen(function* () {
      yield* Effect.sleep("500 millis")
      yield* Deferred.succeed(signal, "hello")
    })
  )

  // Wait for both
  const result = yield* Fiber.join(fiberA)
  yield* Fiber.join(fiberB)
  return result // "hello"
})`,
					},
					{
						title: "Rate-limit with Semaphore",
						prompt:
							"Use a Semaphore to limit concurrent API calls to 2 at a time, even though all 5 are forked with unbounded concurrency.",
						startCode: `import { Effect } from "effect"

const callApi = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.log(\`Start \${id}\`)
    yield* Effect.sleep("1 second")
    yield* Effect.log(\`Done \${id}\`)
    return id
  })

const ids = [1, 2, 3, 4, 5]

// TODO: use a semaphore to limit to 2 concurrent calls
const program = Effect.gen(function* () {
  // 1. Create a semaphore with 2 permits

  // 2. Run all calls with unbounded concurrency, but wrap each in withPermits(1)

})`,
						solution: `import { Effect } from "effect"

const callApi = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.log(\`Start \${id}\`)
    yield* Effect.sleep("1 second")
    yield* Effect.log(\`Done \${id}\`)
    return id
  })

const ids = [1, 2, 3, 4, 5]

const program = Effect.gen(function* () {
  const semaphore = yield* Effect.makeSemaphore(2)

  // All 5 are "launched" at once, but the semaphore
  // ensures only 2 run at any given time
  const results = yield* Effect.forEach(
    ids,
    (id) => semaphore.withPermits(1)(callApi(id)),
    { concurrency: "unbounded" }
  )
  return results // [1, 2, 3, 4, 5] — order preserved
})`,
					},
				],
			},
		],
	},
	{
		phase: "Streams",
		slug: "streams",
		phaseColor: "#C8D8C5",
		steps: [
			{
				id: 21,
				title: "Creating & Transforming Streams",
				subtitle: "Effect's answer to async iterables",
				tweet: false,
				duration: "45 min",
				content:
					"Stream is Effect's answer to async iterables and observables. It models a potentially infinite sequence of values produced over time — with typed errors and dependency injection baked in, just like Effect.",
				keyIdea:
					"Stream<A, E, R> emits multiple A values (vs Effect which produces one). It uses the same E and R channels you already know. Streams are lazy — nothing runs until consumed.",
				concepts: [
					{
						name: "Stream<A, E, R>",
						desc: "Like Effect<A, E, R> but produces zero or more A values instead of exactly one.",
					},
					{
						name: "Stream.make / fromIterable",
						desc: "Create streams from literal values or arrays. Simplest constructors.",
					},
					{
						name: "Stream.fromEffect / fromIterableEffect",
						desc: "Create a stream from an Effect. fromIterableEffect unwraps an Effect that returns an iterable.",
					},
					{
						name: "Stream.unfold(seed, f)",
						desc: "Generate values from a seed — like Array.from but lazy and potentially infinite.",
					},
					{
						name: "Stream.range(start, end)",
						desc: "Creates a stream of integers in a range. Inclusive on both ends.",
					},
					{
						name: "Stream.map / filter / take / drop",
						desc: "Transform streams. Same names as Array methods — but lazy, nothing runs until consumed.",
					},
					{
						name: "Stream.flatMap",
						desc: "Like Effect.flatMap but each element produces a sub-stream that gets flattened. Think Array.flatMap but async and lazy.",
					},
					{
						name: "Stream.tap(f)",
						desc: "Run a side-effect for each element without changing the stream. Great for logging.",
					},
					{
						name: "Stream.scan(seed, f)",
						desc: "Like Array.reduce but emits every intermediate accumulator value.",
					},
					{
						name: "Stream.concat / merge / zip",
						desc: "Combine streams: sequentially (concat), interleaved async (merge), or paired (zip).",
					},
				],
				docsLink: "https://effect.website/docs/stream/creating/",
				trap: "Streams are lazy and pull-based. Don't confuse them with EventEmitters (push-based). A Stream doesn't produce values until a consumer (Sink/runner) requests them.",
				tsCode: `// TypeScript: async generator
async function* doubles(arr: number[]) {
  for (const n of arr) {
    yield n * 2
  }
}
// Consuming:
for await (const n of doubles([1, 2, 3])) {
  if (n > 4) console.log(n)
}
// Problems:
// - No typed errors (throw anything, catch... string?)
// - No dependency injection
// - Composing generators is awkward (yield* in generators is clunky)
// - No built-in concurrency, buffering, or grouping
// - Can't easily merge two generators or zip them`,
				code: `import { Stream, Effect } from "effect"

// ── Creating streams ──
const fromValues = Stream.make(1, 2, 3)
const fromArray  = Stream.fromIterable([1, 2, 3])
const fromEffect = Stream.fromEffect(Effect.succeed(42))
const naturals   = Stream.unfold(1, (n) => Option.some([n, n + 1]))
//                                         [emit, nextSeed]

// ── Transforming ──
const pipeline = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.map((n) => n * 2),           // [2, 4, 6, 8, 10]
  Stream.filter((n) => n > 4),        // [6, 8, 10]
  Stream.tap((n) => Effect.log(\`Processing: \${n}\`))
)

// ── flatMap: each element → sub-stream ──
const expanded = Stream.make(1, 2, 3).pipe(
  Stream.flatMap((n) => Stream.make(n, n * 10))
)
// [1, 10, 2, 20, 3, 30]

// ── scan: running totals ──
const runningSum = Stream.fromIterable([1, 2, 3, 4]).pipe(
  Stream.scan(0, (acc, n) => acc + n)
)
// [0, 1, 3, 6, 10]

// ── Combining streams ──
const a = Stream.make(1, 2)
const b = Stream.make(3, 4)
const sequential  = Stream.concat(a, b)       // [1, 2, 3, 4]
const interleaved = Stream.merge(a, b)         // async interleaving
const paired      = Stream.zip(a, b)           // [[1,3], [2,4]]`,
				diagram: `  async function*              Stream<A, E, R>
  ──────────────              ───────────────

  yield value                 Stream.make(1, 2, 3)

  yield* otherGen()           Stream.flatMap(n =>
                                Stream.make(n, n * 10))

  for await (const x          Stream.runCollect
    of gen()) { ... }           → Chunk<A>

  no error types              E channel tracks errors

  no dependencies             R channel tracks services

  manual composition          Stream.concat / merge / zip


  Mental model:
  ─────────────
  Effect<A, E, R>   →  produces ONE value
  Stream<A, E, R>   →  produces MANY values

  All the same E/R patterns you learned still apply:
  - Stream.mapError, Stream.catchAll for errors
  - Stream.provideService for dependencies`,
				practice: [
					{
						title: "Build a stream pipeline",
						prompt:
							"Create a stream of numbers 1–10, double each, keep only values > 10, and collect into a Chunk.",
						startCode: `import { Stream, Effect, Chunk } from "effect"

// TODO:
// 1. Create a stream of 1..10 using Stream.range
// 2. Double each value with Stream.map
// 3. Keep only values > 10 with Stream.filter
// 4. Collect into a Chunk with Stream.runCollect
// Expected result: Chunk(12, 14, 16, 18, 20)`,
						solution: `import { Stream, Effect, Chunk } from "effect"

const program = Stream.range(1, 10).pipe(
  Stream.map((n) => n * 2),
  Stream.filter((n) => n > 10),
  Stream.runCollect
)
// Effect<Chunk<number>, never, never>
// Result: Chunk(12, 14, 16, 18, 20)`,
					},
					{
						title: "Convert an async generator to a Stream",
						prompt:
							"You have an async generator that fetches pages of data. Convert it to a Stream using Stream.unfold.",
						startCode: `import { Stream, Effect, Option } from "effect"

// Simulated paginated API
const fetchPage = (page: number) =>
  Effect.succeed({
    items: [page * 10 + 1, page * 10 + 2],
    hasMore: page < 3
  })

// TODO: Use Stream.unfold to create a stream that:
// 1. Starts at page 1
// 2. Fetches each page
// 3. Emits the items array
// 4. Stops when hasMore is false
// Hint: unfoldEffect lets you use Effects in the unfold function`,
						solution: `import { Stream, Effect, Option } from "effect"

const fetchPage = (page: number) =>
  Effect.succeed({
    items: [page * 10 + 1, page * 10 + 2],
    hasMore: page < 3
  })

const pages = Stream.unfoldEffect(1, (page) =>
  fetchPage(page).pipe(
    Effect.map(({ items, hasMore }) =>
      hasMore
        ? Option.some([items, page + 1] as const)
        : Option.some([items, page + 1] as const) // emit last page
    )
  )
).pipe(
  Stream.mapConcat((items) => items) // flatten arrays into individual elements
)
// Emits: 11, 12, 21, 22, 31, 32`,
					},
				],
			},
			{
				id: 22,
				title: "Sinks & Consuming Streams",
				subtitle: "Collecting, folding, and aggregating",
				tweet: false,
				duration: "45 min",
				content:
					"A Stream produces values but does nothing until consumed. Sinks are the consumers — they collect, fold, aggregate, or process stream elements. Think of a Sink as the 'reduce' at the end of your pipeline.",
				keyIdea:
					"Sink<A, In, L, E, R> consumes In values and produces an A. The L type represents 'leftovers' — elements the Sink didn't consume. Stream.run(stream, sink) connects them.",
				concepts: [
					{
						name: "Stream.runCollect",
						desc: "Collects all elements into a Chunk. Simplest consumer — but loads everything into memory.",
					},
					{
						name: "Stream.runForEach(f)",
						desc: "Runs an Effect for each element. Like forEach but effectful — good for writing to DB or logging.",
					},
					{
						name: "Stream.runFold(seed, f)",
						desc: "Accumulates all elements into a single value. Like Array.reduce.",
					},
					{
						name: "Stream.run(stream, sink)",
						desc: "Runs a stream with a custom Sink. Most flexible consumption method.",
					},
					{
						name: "Sink.collectAll()",
						desc: "Sink equivalent of runCollect. Collects into a Chunk.",
					},
					{
						name: "Sink.fold(seed, cont, f)",
						desc: "Accumulates values until cont returns false. Returns accumulated result — leftovers go to L.",
					},
					{
						name: "Sink.head()",
						desc: "Takes just the first element, wrapped in Option. Remainder becomes leftovers.",
					},
					{
						name: "Sink.forEach(f)",
						desc: "Runs an Effect for each element. Sink version of runForEach.",
					},
					{
						name: "Stream.grouped(n) / groupedWithin(n, duration)",
						desc: "Batch elements: fixed-size chunks or by size/time (whichever comes first). Essential for batch processing.",
					},
					{
						name: "Stream.groupByKey(f)",
						desc: "Groups elements by a key function. Returns a GroupBy you evaluate with a function per group.",
					},
				],
				docsLink: "https://effect.website/docs/stream/consuming-streams/",
				trap: "runCollect loads ALL elements into memory. For large or infinite streams, use runForEach, runFold, or a Sink that processes elements incrementally. Treat runCollect like Array.from() on a generator — fine for small data, dangerous for large.",
				tsCode: `// TypeScript: consuming an async iterable
async function collectAll<T>(gen: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = []
  for await (const item of gen) {
    result.push(item) // all in memory
  }
  return result
}

async function reduce<T, U>(
  gen: AsyncIterable<T>,
  seed: U,
  f: (acc: U, item: T) => U
): Promise<U> {
  let acc = seed
  for await (const item of gen) {
    acc = f(acc, item)
  }
  return acc
}
// Problems:
// - Must write these helpers yourself
// - No built-in batching/grouping
// - No typed errors in the pipeline
// - No "take first N" without manual break logic`,
				code: `import { Stream, Sink, Effect } from "effect"

const numbers = Stream.range(1, 100)

// ── Simple runners ──
const all   = Stream.runCollect(numbers)        // Chunk of 1..100
const sum   = Stream.runFold(numbers, 0, (a, b) => a + b)  // 5050
const log   = Stream.runForEach(numbers, (n) => Effect.log(\`Got: \${n}\`))

// ── Custom Sinks ──
const first = Stream.run(numbers, Sink.head())
// Effect<Option<number>, never, never>

// Collect first 5 elements:
const firstFive = Stream.run(numbers, Sink.take(5))
// Effect<Chunk<number>, never, never>

// Fold until sum exceeds 50:
const partial = Stream.run(
  numbers,
  Sink.fold(0, (sum) => sum <= 50, (sum, n) => sum + n)
)
// Stops consuming when sum > 50, leftovers stay unconsumed

// ── Batching with grouped ──
const batched = Stream.range(1, 20).pipe(
  Stream.grouped(5),                 // Chunk of 5 elements each
  Stream.runForEach((batch) =>
    Effect.log(\`Processing batch of \${batch.length}\`)
  )
)

// ── groupedWithin: size OR time ──
const adaptive = someEventStream.pipe(
  Stream.groupedWithin(100, "5 seconds"),
  // batch up to 100 items, OR flush every 5 seconds
  Stream.runForEach((batch) => writeToDB(batch))
)`,
				diagram: `  Stream              Sink               Result
  ──────              ────               ──────
  1, 2, 3, ...   →   collectAll()    →  Chunk(1, 2, 3, ...)
  1, 2, 3, ...   →   head()          →  Option.some(1)
  1, 2, 3, ...   →   take(3)         →  Chunk(1, 2, 3)
  1, 2, 3, ...   →   fold(0, +)      →  6  (1+2+3)
  1, 2, 3, ...   →   forEach(log)    →  void (side effects)


  TS mental model:
  ────────────────
  Array          →  .reduce()       →  single value
  Stream         →  Sink.fold()     →  single value (but lazy + effectful)

  Array          →  .slice(0, 5)    →  smaller array
  Stream         →  Sink.take(5)    →  Chunk (and stops pulling!)

  Array          →  .forEach()      →  side effects
  Stream         →  Sink.forEach()  →  side effects (but effectful)


  Batching:
  ─────────
  Stream.grouped(3):     [1,2,3] → [4,5,6] → [7,8,9] → ...
  Stream.groupedWithin(100, "5s"):
    → flush at 100 items OR 5 seconds, whichever first
    → essential for "batch writes to DB every N items or every M seconds"`,
				practice: [
					{
						title: "Sum a stream without collecting it",
						prompt:
							"Given a stream of numbers 1–1000, compute the sum without loading all elements into memory. Use runFold.",
						startCode: `import { Stream, Effect } from "effect"

const numbers = Stream.range(1, 1000)

// TODO: Compute the sum using Stream.runFold
// Don't use runCollect — that loads everything into memory
// Expected result: 500500`,
						solution: `import { Stream, Effect } from "effect"

const numbers = Stream.range(1, 1000)

const sum = Stream.runFold(numbers, 0, (acc, n) => acc + n)
// Effect<number, never, never>
// Result: 500500`,
					},
					{
						title: "Take until a condition is met",
						prompt:
							"Use Sink.fold to consume numbers from a stream until the running total exceeds 100. Return the total.",
						startCode: `import { Stream, Sink, Effect } from "effect"

const numbers = Stream.range(1, 50)

// TODO: Use Stream.run with Sink.fold to:
// 1. Start with seed 0
// 2. Keep folding while total <= 100
// 3. Return the accumulated total
// Hint: Sink.fold(seed, continuePredicate, accumulator)`,
						solution: `import { Stream, Sink, Effect } from "effect"

const numbers = Stream.range(1, 50)

const result = Stream.run(
  numbers,
  Sink.fold(
    0,                        // seed
    (total) => total <= 100,  // continue while true
    (total, n) => total + n   // accumulator
  )
)
// Stops pulling from stream once total > 100
// Result: 105 (1+2+...+14 = 105)`,
					},
					{
						title: "Batch process a stream",
						prompt:
							"Given a stream of user events, batch them into groups of 10 and log each batch. Use Stream.grouped and Stream.runForEach.",
						startCode: `import { Stream, Effect, Chunk } from "effect"

const events = Stream.fromIterable(
  Array.from({ length: 35 }, (_, i) => ({ id: i, type: "click" }))
)

// TODO:
// 1. Group events into batches of 10 using Stream.grouped
// 2. Use Stream.runForEach to log each batch size
// Expected: 4 batches (10, 10, 10, 5)`,
						solution: `import { Stream, Effect, Chunk } from "effect"

const events = Stream.fromIterable(
  Array.from({ length: 35 }, (_, i) => ({ id: i, type: "click" }))
)

const program = events.pipe(
  Stream.grouped(10),
  Stream.runForEach((batch) =>
    Effect.log(\`Batch of \${Chunk.size(batch)} events\`)
  )
)
// Logs: Batch of 10 events (x3), Batch of 5 events (x1)`,
					},
				],
			},
			{
				id: 23,
				title: "Stream Concurrency & Error Handling",
				subtitle: "Merging, racing, and recovering",
				tweet: false,
				duration: "45 min",
				content:
					"Streams support concurrency (parallel flatMap, merging), error recovery (catchAll, retry), and resource management (finalizers, scoped streams). This is where Streams pull ahead of plain async iterables.",
				keyIdea:
					"Stream.flatMap with { concurrency: N } processes N sub-streams in parallel. Stream.catchAll recovers from errors. Stream.finalizer guarantees cleanup. All the Effect patterns you know work here too.",
				concepts: [
					{
						name: "Stream.flatMap with { concurrency }",
						desc: "Process N sub-streams in parallel. Without concurrency, sub-streams run sequentially.",
					},
					{
						name: "Stream.flatMap with { switch: true }",
						desc: "Cancel previous sub-stream when a new element arrives. Like RxJS switchMap.",
					},
					{
						name: "Stream.merge(a, b)",
						desc: "Interleave two streams asynchronously. Elements arrive in whatever order they're produced.",
					},
					{
						name: "Stream.catchAll(f)",
						desc: "Recover from stream errors by switching to a fallback stream.",
					},
					{
						name: "Stream.catchSome(f)",
						desc: "Selectively recover from specific errors. Return Option.some(fallbackStream) or Option.none() to re-raise.",
					},
					{
						name: "Stream.retry(schedule)",
						desc: "Retry a failing stream according to a Schedule. The stream restarts from the beginning.",
					},
					{
						name: "Stream.finalizer(effect)",
						desc: "Guarantees an Effect runs when the stream ends — success, failure, or interruption.",
					},
					{
						name: "Stream.scoped(effect)",
						desc: "Creates a stream from a scoped Effect. Resources are managed within the stream's lifetime.",
					},
					{
						name: "Stream.schedule(schedule)",
						desc: "Controls emission rate. Stream.schedule(Schedule.spaced('1 second')) adds 1s delay between elements.",
					},
				],
				docsLink: "https://effect.website/docs/stream/error-handling/",
				trap: "Stream.retry restarts the ENTIRE stream, not just the failed element. If you need per-element retry, use Stream.mapEffect with an Effect that has its own retry logic.",
				tsCode: `// TypeScript: concurrent processing with async iterables
async function* processAll(urls: string[]) {
  // Sequential — no built-in concurrency for async generators
  for (const url of urls) {
    try {
      const res = await fetch(url)
      yield await res.json()
    } catch (e) {
      // Error kills the whole generator? Swallow it? Re-throw?
      console.error(e) // usually swallow and continue... fragile
    }
  }
}
// Problems:
// - No parallel processing without Promise.all (loses streaming)
// - Error handling is ad-hoc — no typed recovery
// - No cancellation/switchMap pattern
// - No guaranteed cleanup (finalizers)
// - No built-in retry with backoff`,
				code: `import { Stream, Effect, Schedule } from "effect"

// ── Concurrent flatMap ──
const fetchUser = (id: number) =>
  Stream.fromEffect(Effect.tryPromise(() =>
    fetch(\`/api/users/\${id}\`).then((r) => r.json())
  ))

const users = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.flatMap(fetchUser, { concurrency: 3 })
  // 3 fetches in parallel at a time
)

// ── switchMap: cancel previous on new ──
const searchResults = searchTermStream.pipe(
  Stream.flatMap(
    (term) => Stream.fromEffect(searchAPI(term)),
    { switch: true }
    // new search term cancels the in-flight request
  )
)

// ── Error recovery ──
const resilient = Stream.fromEffect(
  Effect.tryPromise(() => fetch("/api/data"))
).pipe(
  Stream.catchAll((error) =>
    Stream.make({ fallback: true, error: String(error) })
  )
)

// ── Retry with backoff ──
const withRetry = Stream.fromEffect(
  Effect.tryPromise(() => fetch("/api/flaky"))
).pipe(
  Stream.retry(Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(3))
  ))
)

// ── Resource management ──
const fileLines = Stream.scoped(
  Effect.acquireRelease(
    Effect.sync(() => openFile("data.csv")),
    (handle) => Effect.sync(() => handle.close())
  )
).pipe(
  Stream.flatMap((handle) => Stream.fromIterable(handle.readLines()))
)

// ── Finalizer: guaranteed cleanup ──
const withCleanup = Stream.make(1, 2, 3).pipe(
  Stream.concat(Stream.finalizer(
    Effect.log("Stream finished — cleaning up")
  ))
)`,
				diagram: `  Concurrency modes:
  ──────────────────

  flatMap (default):  ─── sub-stream 1 ──→ sub-stream 2 ──→ sub-stream 3 ──→
                      sequential: one at a time

  flatMap(f, {        ─── sub-stream 1 ──→
   concurrency: 3     ─── sub-stream 2 ──→  (up to 3 in parallel)
  })                   ─── sub-stream 3 ──→

  flatMap(f, {        ─── sub-stream 1 ──✗ (cancelled!)
   switch: true        ─── sub-stream 2 ──✗ (cancelled!)
  })                   ─── sub-stream 3 ──→ (only latest survives)
                       like RxJS switchMap


  Error recovery:
  ───────────────

  Stream ──→ error! ──→ catchAll ──→ fallback stream ──→ continues
                                                         (original stream is done)

  Stream ──→ error! ──→ retry(3x) ──→ restart stream ──→ ...
                                      (whole stream restarts, not just the element)


  TS ↔ RxJS mental model:
  ───────────────────────
  Stream.flatMap            = RxJS concatMap (default)
  flatMap + concurrency     = RxJS mergeMap
  flatMap + switch          = RxJS switchMap
  Stream.merge              = RxJS merge
  Stream.zip                = RxJS zip`,
				practice: [
					{
						title: "Parallel fetch with concurrency limit",
						prompt:
							"Given a stream of 10 user IDs, fetch each user in parallel with a concurrency limit of 3. Collect all results.",
						startCode: `import { Stream, Effect, Chunk } from "effect"

const userIds = Stream.fromIterable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

const fetchUser = (id: number) =>
  Effect.succeed({ id, name: \`User \${id}\` }).pipe(
    Effect.delay("100 millis") // simulate network delay
  )

// TODO:
// 1. Use Stream.flatMap with { concurrency: 3 } to fetch users
// 2. Collect all results with Stream.runCollect
// Hint: wrap fetchUser in Stream.fromEffect`,
						solution: `import { Stream, Effect, Chunk } from "effect"

const userIds = Stream.fromIterable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

const fetchUser = (id: number) =>
  Effect.succeed({ id, name: \`User \${id}\` }).pipe(
    Effect.delay("100 millis")
  )

const program = userIds.pipe(
  Stream.flatMap(
    (id) => Stream.fromEffect(fetchUser(id)),
    { concurrency: 3 }
  ),
  Stream.runCollect
)
// Fetches 3 users at a time, collects all 10 results`,
					},
					{
						title: "Recover from stream errors",
						prompt:
							"Create a stream that fails on even numbers. Use catchAll to recover with a stream that emits -1 as a sentinel value.",
						startCode: `import { Stream, Effect } from "effect"

const numbers = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.mapEffect((n) =>
    n % 2 === 0
      ? Effect.fail(\`\${n} is even!\` as const)
      : Effect.succeed(n)
  )
)

// TODO: Use Stream.catchAll to recover from the error
// When the stream fails, switch to Stream.make(-1)
// Expected: collects [1] then fails on 2, switches to [-1]
// Final result: Chunk(1, -1)`,
						solution: `import { Stream, Effect } from "effect"

const numbers = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.mapEffect((n) =>
    n % 2 === 0
      ? Effect.fail(\`\${n} is even!\` as const)
      : Effect.succeed(n)
  )
)

const recovered = numbers.pipe(
  Stream.catchAll((_error) => Stream.make(-1))
)

const result = Stream.runCollect(recovered)
// Chunk(1, -1)
// Stream emitted 1, then hit 2 (error), switched to fallback`,
					},
				],
			},
		],
	},
	{
		phase: "Testing & Style",
		slug: "testing-style",
		phaseColor: "#D8C8C5",
		steps: [
			{
				id: 24,
				title: "Testing with Effect",
				subtitle: "TestClock, service mocking, and more",
				tweet: false,
				duration: "45 min",
				content:
					"Effect's dependency injection makes testing easy: swap real services for test implementations. TestClock lets you control time.",
				keyIdea:
					"Because services are in the R type, you can provide mock implementations in tests. TestClock.adjust lets you fast-forward time without waiting.",
				concepts: [
					{
						name: "Test layers",
						desc: "Create Layer with mock implementations for testing. Your Effect code doesn't change.",
					},
					{
						name: "TestClock.adjust('5 minutes')",
						desc: "Advances the virtual clock. Scheduled effects fire instantly.",
					},
					{
						name: "Effect.provide(testLayer)",
						desc: "Swap production dependencies with test doubles.",
					},
				],
				docsLink: "https://effect.website/docs/testing/testclock/",
				trap: "Remember: services are interfaces. If you design services as interfaces from the start, testing is trivial. If you hardcode implementations, you lose this power.",
			},
			{
				id: 25,
				title: "Code Style & Patterns",
				subtitle: "Dual APIs, branded types, pattern matching",
				tweet: true,
				duration: "30 min",
				content:
					"Wrap up by learning Effect's idioms: dual APIs (data-first vs data-last), branded types for domain modeling, and Match for exhaustive pattern matching.",
				keyIdea:
					"Effect APIs support both pipe style (data-last) and direct style (data-first). Use branded types to make your domain model precise. Match.value for exhaustive switches.",
				concepts: [
					{
						name: "Dual APIs",
						desc: "Effect.map(effect, f) or effect.pipe(Effect.map(f)) — both work. Choose what reads better.",
					},
					{
						name: "Brand.nominal<'UserId'>()",
						desc: "Creates a nominal type. Prevents accidental string-for-string substitution.",
					},
					{
						name: "Match.value(x).pipe(...)",
						desc: "Exhaustive pattern matching with type narrowing.",
					},
					{
						name: "Data.TaggedEnum",
						desc: "Create discriminated unions with built-in pattern matching support.",
					},
				],
				docsLink: "https://effect.website/docs/code-style/guidelines/",
				trap: "Don't overthink style early on. Start with Effect.gen everywhere, then adopt pipe-based patterns as you get comfortable. The community generally recommends gen for logic and pipe for adding behaviors.",
			},
		],
	},
	{
		phase: "Ecosystem",
		slug: "ecosystem",
		phaseColor: "#C5C8D8",
		steps: [
			{
				id: 26,
				title: "Configuration",
				subtitle: "Config, ConfigProvider, secrets",
				tweet: false,
				duration: "30 min",
				content:
					"Effect has built-in typed configuration that reads from env vars by default. Config values are Effects — they compose, fail with clear messages, and can be swapped for testing.",
				keyIdea:
					"Config<A> describes what config you need. ConfigProvider is the backend that loads it. Default reads from env vars, but you can swap to JSON, Map, or custom sources.",
				concepts: [
					{
						name: "Config.string / number / boolean",
						desc: "Primitive config readers. yield* Config.number('PORT') reads PORT from env.",
					},
					{
						name: "Config.nested(config, 'PREFIX')",
						desc: "Namespaces config keys. Config.nested(Config.number('PORT'), 'SERVER') reads SERVER_PORT.",
					},
					{
						name: "Config.redacted('API_KEY')",
						desc: "Reads a secret. The value is wrapped in Redacted<string> to prevent accidental logging.",
					},
					{
						name: "ConfigProvider.fromJson / fromMap",
						desc: "Custom config sources. Use Effect.withConfigProvider to swap the backend.",
					},
					{
						name: "Config.withDefault(config, value)",
						desc: "Provides a fallback if the config key is missing.",
					},
				],
				docsLink: "https://effect.website/docs/configuration/",
				trap: "Config values are Effects — they can fail! If a required env var is missing, you get a clear ConfigError, not undefined. Handle it or let it crash early.",
				code: `const appConfig = Effect.gen(function* () {
  const host = yield* Config.string("HOST").pipe(
    Config.withDefault("localhost")
  )
  const port = yield* Config.number("PORT")
  const apiKey = yield* Config.redacted("API_KEY")
  return { host, port, apiKey }
})
// Swap provider for testing:
const test = appConfig.pipe(
  Effect.withConfigProvider(
    ConfigProvider.fromJson({ HOST: "test", PORT: 3000, API_KEY: "xxx" })
  )
)`,
			},
			{
				id: 27,
				title: "HTTP Client & Server",
				subtitle: "@effect/platform for HTTP",
				tweet: true,
				duration: "60 min",
				content:
					"@effect/platform provides a typed HTTP client and server that integrate with Effect's error handling, services, and schemas. No more raw fetch().",
				keyIdea:
					"HttpClient is a service you can inject, mock, and compose. Pair it with Schema for automatic request/response validation. HttpRouter builds type-safe API servers.",
				concepts: [
					{
						name: "HttpClient",
						desc: "A service for making HTTP requests. Inject via the R type, swap for testing.",
					},
					{
						name: "HttpClientRequest.get / post",
						desc: "Build typed requests. Chain with .pipe() to add headers, body, etc.",
					},
					{
						name: "HttpClientResponse.schemaBodyJson",
						desc: "Decode response body using a Schema. Validation errors go to the E channel.",
					},
					{
						name: "HttpRouter.make",
						desc: "Build type-safe API routes. Each route is an Effect with typed errors and deps.",
					},
					{
						name: "NodeHttpClient.layer",
						desc: "Node.js implementation of HttpClient. Provide it at the edge of your app.",
					},
				],
				docsLink: "https://effect.website/docs/platform/http-client/",
				trap: "HttpClient is a service — you must provide its layer (NodeHttpClient.layer or FetchHttpClient.layer). Without it, R won't be satisfied.",
				code: `import { HttpClient, HttpClientRequest } from "@effect/platform"

const fetchTodo = (id: number) => Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const response = yield* client.get(
    \`https://jsonplaceholder.typicode.com/todos/\${id}\`
  )
  return yield* response.json
})
// Type: Effect<unknown, HttpClientError, HttpClient>

// Provide the client layer:
const main = fetchTodo(1).pipe(
  Effect.provide(NodeHttpClient.layerUndici)
)`,
			},
			{
				id: 28,
				title: "FileSystem & Command",
				subtitle: "@effect/platform for OS interactions",
				tweet: false,
				duration: "45 min",
				content:
					"@effect/platform provides cross-platform FileSystem and Command services for file I/O and running subprocesses — all as Effects with proper resource management.",
				keyIdea:
					"FileSystem and Command are services, not global APIs. This means they're injectable, testable, and their errors are typed. Scoped resources ensure files are always closed.",
				concepts: [
					{
						name: "FileSystem.readFileString / writeFileString",
						desc: "Read/write files as Effects. Errors are typed as PlatformError.",
					},
					{
						name: "FileSystem.stream(path)",
						desc: "Stream a file's contents. Composes with Stream operators for processing.",
					},
					{
						name: "Command.make('git', 'status')",
						desc: "Build a subprocess command. Run it as an Effect with typed exit codes.",
					},
					{
						name: "NodeFileSystem.layer / NodeCommandExecutor.layer",
						desc: "Node.js implementations. Provide at the edge, mock in tests.",
					},
				],
				docsLink: "https://effect.website/docs/platform/file-system/",
				trap: "FileSystem operations return PlatformError — don't try/catch them. Use catchTag or mapError to handle specific failure modes (NotFound, Permission, etc.).",
				code: `import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"

const processConfig = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const raw = yield* fs.readFileString("config.json")
  const parsed = yield* Schema.decodeUnknown(AppConfig)(JSON.parse(raw))
  return parsed
}).pipe(Effect.provide(NodeFileSystem.layer))`,
			},
			{
				id: 29,
				title: "SQL & Databases",
				subtitle: "@effect/sql for type-safe queries",
				tweet: false,
				duration: "45 min",
				content:
					"@effect/sql provides type-safe database access with connection pooling, transactions, and migrations — all integrated with Effect's service and resource management.",
				keyIdea:
					"SqlClient is a service with tagged template queries. Transactions are scoped resources. Combine with Schema for fully typed row decoding.",
				concepts: [
					{
						name: "SqlClient.SqlClient",
						desc: "The main database service. Provides query, execute, and transaction methods.",
					},
					{
						name: "sql`SELECT * FROM users`",
						desc: "Tagged template for safe parameterized queries. Prevents SQL injection.",
					},
					{
						name: "SqlResolver.findById / grouped",
						desc: "Build batched, cached database resolvers. Automatic N+1 prevention.",
					},
					{
						name: "@effect/sql-pg / sql-mysql2 / sql-sqlite",
						desc: "Database-specific implementations. Provide as a Layer.",
					},
				],
				docsLink: "https://effect.website/docs/platform/sql/",
				trap: "SqlClient uses tagged templates, not string concatenation. sql`SELECT * FROM users WHERE id = ${id}` is safe. sql('SELECT ... ' + id) is NOT — it bypasses parameterization.",
				code: `import { SqlClient } from "@effect/sql"

const getUser = (id: number) => Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  const rows = yield* sql\`SELECT * FROM users WHERE id = \${id}\`
  return rows[0]
})

// Transactions are scoped:
const transfer = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient
  yield* sql.withTransaction(Effect.gen(function* () {
    yield* sql\`UPDATE accounts SET balance = balance - 100 WHERE id = 1\`
    yield* sql\`UPDATE accounts SET balance = balance + 100 WHERE id = 2\`
  }))
})`,
			},
			{
				id: 30,
				title: "Real-World Patterns",
				subtitle: "Putting it all together",
				tweet: true,
				duration: "60 min",
				content:
					"You've learned the pieces — now see how they compose in production. This step covers common patterns for structuring real Effect applications.",
				keyIdea:
					"A typical Effect app: services define capabilities, layers wire them up, Config loads settings, Schema validates boundaries, and one ManagedRuntime runs everything.",
				concepts: [
					{
						name: "App entry point pattern",
						desc: "ManagedRuntime.make(AppLayer) at the top. All services, config, and resources composed into one layer.",
					},
					{
						name: "Repository pattern",
						desc: "Effect.Service for data access. Schema for row types. SqlClient inside the service effect.",
					},
					{
						name: "Error boundary pattern",
						desc: "Domain errors at service boundaries, catchTag at the handler level, defects for bugs.",
					},
					{
						name: "Graceful shutdown",
						desc: "Effect.addFinalizer in layers for cleanup. ManagedRuntime.dispose for orderly shutdown.",
					},
					{
						name: "Testing pyramid",
						desc: "Unit: mock services with Layer. Integration: real DB with test containers. E2E: full ManagedRuntime.",
					},
				],
				docsLink: "https://effect.website/docs/guides/essentials/",
				trap: "Don't over-abstract early. Start with one service, one layer. Extract shared patterns only after you see repetition across 3+ services.",
				code: `// Typical app structure
const AppLayer = Layer.mergeAll(
  Database.Default,
  Cache.Default,
  HttpApi.Default
).pipe(
  Layer.provide(ConfigLive),
  Layer.provide(NodeHttpClient.layerUndici)
)

const runtime = ManagedRuntime.make(AppLayer)

// In your HTTP handler / main:
const result = await runtime.runPromise(handleRequest(req))

// Graceful shutdown:
process.on("SIGTERM", () => runtime.dispose())`,
			},
		],
	},
];

export const TOTAL_STEPS = PHASES.reduce(
	(acc, phase) => acc + phase.steps.length,
	0,
);

export const TWEET_TEMPLATES: Record<number, string> = {
	6: `@EffectTS_ control flow in 2 lines:\n\nImperative: if (x) yield* doThing()\nDeclarative: Effect.forEach(users, sendEmail, { concurrency: 5 })\n\nOne reads like TS. The other composes.\n\n#EffectTS`,
	4: `Effect.gen = async/await but with typed errors\n\nconst name = Effect.succeed("Alice")\nconst getUser = (id) => Effect.tryPromise(...)\n\nyield* name        — no (), it's already an Effect\nyield* getUser(id) — (), it returns an Effect\n\n#EffectTS #TypeScript`,
	7: `The biggest "aha" moment learning @EffectTS_:\n\nThere are TWO kinds of errors:\n\n- Expected (in the type signature) — you MUST handle them\n- Defects (hidden) — bugs that bubble up\n\ntry/catch treats all errors the same. Effect doesn't.\n\n#TypeScript`,
	10: `Yieldable errors in @EffectTS_ are genius:\n\nclass NotFound extends Data.TaggedError("NotFound")<{ id: string }> {}\n\nyield* new NotFound({ id })\n\nType-safe "throwing" inside generators. No more stringly-typed errors.\n\n#EffectTS`,
	11: `Dependency injection in @EffectTS_ is tracked by the TYPE SYSTEM.\n\nEffect<User, DbError, Database | Logger>\n\nThe compiler literally won't let you run this until you provide Database AND Logger.\n\nNo runtime DI container. No decorators. Just types.\n\n#TypeScript`,
	14: `@effect/schema is what happens when Zod meets bidirectional transforms:\n\n-> decode (validate external data)\n-> encode (serialize for output)\n-> type inference\n\nOne schema definition. Multiple directions.\n\n#EffectTS #TypeScript`,
	19: `Fibers in @EffectTS_ = lightweight virtual threads for TypeScript\n\nEffect.fork -> start a fiber\nFiber.join -> wait for result\nFiber.interrupt -> cancel (resources auto-cleanup)\n\nOr just: Effect.all(tasks, { concurrency: 10 })\n\n#EffectTS`,
	25: `Finished the core @EffectTS_ curriculum!\n\nBiggest takeaways:\n- Effect<A, E, R> — one type to rule them all\n- Generators for logic, pipes for behavior\n- Services + Layers = testable by default\n- Schema for validation + serialization\n\nNow onto the ecosystem.\n\n#EffectTS #TypeScript`,
	27: `@effect/platform's HttpClient changed how I think about HTTP in TypeScript:\n\n- It's a SERVICE you inject (mockable!)\n- Schema validates responses automatically\n- Errors are typed, not thrown\n- Same code works Node/Bun/browser\n\nNo more raw fetch().\n\n#EffectTS`,
	30: `Finished my @EffectTS_ journey — here's the production pattern:\n\n1. Services define capabilities\n2. Layers wire dependencies\n3. Config loads settings\n4. Schema validates boundaries\n5. ManagedRuntime runs everything\n\nOne type. Full stack. Type-safe.\n\n#EffectTS #TypeScript`,
};

export function getPhaseBySlug(slug: string): Phase | undefined {
	return PHASES.find((p) => p.slug === slug);
}

export function getStepById(
	id: number,
): { step: Step; phase: Phase } | undefined {
	for (const phase of PHASES) {
		const step = phase.steps.find((s) => s.id === id);
		if (step) return { step, phase };
	}
	return undefined;
}
