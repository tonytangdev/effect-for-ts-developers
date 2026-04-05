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
	code?: string;
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
				duration: "30 min",
				content:
					"pipe is the other main way to compose Effects (besides generators). Use it for transformations, adding behaviors, and chaining.",
				keyIdea:
					"pipe reads top-to-bottom: start with a value, then apply transformations. It's great for adding cross-cutting concerns like timeouts, retries, and logging.",
				concepts: [
					{
						name: "pipe(value, fn1, fn2, ...)",
						desc: "Passes value through fn1, then fn2, etc. Each function receives the previous result.",
					},
					{
						name: "Effect.map(f)",
						desc: "Transforms the success value. Like Promise.then but only for the value.",
					},
					{
						name: "Effect.flatMap(f)",
						desc: "Chains Effects. f returns a new Effect. Like .then() returning another Promise.",
					},
					{
						name: "Effect.tap(f)",
						desc: "Runs a side effect without changing the value. Great for logging.",
					},
					{
						name: "Effect.andThen(f)",
						desc: "Works as map OR flatMap depending on what f returns. Convenient shorthand.",
					},
				],
				docsLink:
					"https://effect.website/docs/getting-started/building-pipelines/",
				trap: "When to use pipe vs gen? Use gen for complex sequential logic. Use pipe for adding behaviors to an existing Effect (retry, timeout, logging). They compose together.",
				code: `const program = pipe(
  fetchUser(id),
  Effect.map((user) => user.name),         // transform value
  Effect.tap((name) => Effect.log(name)),   // side effect
  Effect.flatMap((name) => saveGreeting(name)), // chain
  Effect.timeout("5 seconds"),
  Effect.retry({ times: 3 })
)`,
			},
			{
				id: 6,
				title: "Control Flow",
				subtitle: "if/else, loops, matching in Effect",
				tweet: false,
				duration: "30 min",
				content:
					"Standard JS control flow (if/else, for loops) works inside Effect.gen. But Effect also provides functional alternatives for pipelines.",
				keyIdea:
					"Inside a generator, use normal if/else and loops — it's the simplest approach. The functional operators (Effect.if, Effect.forEach, etc.) shine in pipe-based code.",
				concepts: [
					{
						name: "Effect.if(condition, { onTrue, onFalse })",
						desc: "Conditional Effect execution in a pipeline.",
					},
					{
						name: "Effect.forEach(items, fn)",
						desc: "Maps over items, running an Effect for each. Sequential by default.",
					},
					{
						name: "Effect.all([...effects])",
						desc: "Runs multiple Effects. Sequential by default, can be made concurrent.",
					},
					{
						name: "Effect.match / matchEffect",
						desc: "Pattern-match on success or failure of an Effect.",
					},
				],
				docsLink: "https://effect.website/docs/getting-started/control-flow/",
				trap: 'Effect.all is sequential by default! For parallel execution, pass { concurrency: "unbounded" } or a number. This is the opposite of Promise.all which is always concurrent.',
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
				duration: "45 min",
				content:
					"This is the concept that makes Effect's error handling superior to try/catch. Effect distinguishes between errors you EXPECT (and handle) vs bugs you DON'T.",
				keyIdea:
					"Expected errors appear in the E type parameter — the compiler forces you to handle them. Unexpected errors (defects) are tracked separately and bubble up like uncaught exceptions.",
				concepts: [
					{
						name: "Expected errors (E channel)",
						desc: "Business logic errors: UserNotFound, InvalidInput, etc. They're in the type signature. You must handle them before running.",
					},
					{
						name: "Unexpected errors (defects)",
						desc: "Bugs, crashes, things you can't predict. Effect tracks them in Cause but doesn't put them in the type. Use Effect.die for these.",
					},
					{
						name: "Effect.fail(new MyError())",
						desc: "Creates an expected error. It shows up in the type: Effect<never, MyError, never>",
					},
					{
						name: "Effect.die(message)",
						desc: "Creates a defect. NOT in the type: Effect<never, never, never> — it's hidden.",
					},
				],
				docsLink:
					"https://effect.website/docs/error-management/two-error-types/",
				trap: "Don't make everything an expected error. Use expected errors for things callers should handle (network failures, validation). Use defects for programming bugs.",
				code: `// Expected error — caller must handle it
const findUser = (id: string) =>
  id === "0"
    ? Effect.fail(new UserNotFound({ id }))  // in the E type
    : Effect.succeed({ id, name: "Alice" })
// Type: Effect<User, UserNotFound, never>

// Defect — a bug, not in the type
const divide = (a: number, b: number) =>
  b === 0
    ? Effect.die("Division by zero!")  // NOT in the E type
    : Effect.succeed(a / b)
// Type: Effect<number, never, never>`,
			},
			{
				id: 8,
				title: "Handling Expected Errors",
				subtitle: "catchTag, catchAll, mapError",
				tweet: false,
				duration: "45 min",
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
						desc: "Catches only errors with that _tag. Other errors pass through. The E type updates automatically.",
					},
					{
						name: "Effect.catchAll(handler)",
						desc: "Catches all expected errors. You must return a new Effect.",
					},
					{
						name: "Effect.mapError(f)",
						desc: "Transforms the error without handling it. Useful for wrapping low-level errors.",
					},
					{
						name: "Effect.orElse(fallback)",
						desc: "If the Effect fails, run the fallback Effect instead.",
					},
				],
				docsLink:
					"https://effect.website/docs/error-management/expected-errors/",
				trap: "catchTag only works with tagged unions. If your errors don't have _tag, use catchAll or match instead.",
				code: `class NotFound extends Data.TaggedError("NotFound")<{ id: string }> {}
class Forbidden extends Data.TaggedError("Forbidden")<{}> {}

const program = pipe(
  getResource(id),
  // Handle only NotFound, Forbidden passes through
  Effect.catchTag("NotFound", ({ id }) =>
    Effect.succeed(fallbackResource(id))
  ),
  // Transform remaining errors
  Effect.mapError((e) => new AppError({ cause: e }))
)`,
			},
			{
				id: 9,
				title: "Retrying & Timeouts",
				subtitle: "Schedule-based resilience",
				tweet: false,
				duration: "30 min",
				content:
					"Effect has built-in retry and timeout that compose cleanly with your error types.",
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
				code: `const resilient = pipe(
  fetchData,
  Effect.timeout("5 seconds"),
  Effect.retry(
    Schedule.exponential("1 second").pipe(
      Schedule.compose(Schedule.recurs(3))
    )
  ),
  Effect.catchTag("TimeoutException", () =>
    Effect.succeed(cachedData)
  )
)`,
			},
			{
				id: 10,
				title: "Yieldable Errors",
				subtitle: "Errors as first-class values",
				tweet: true,
				duration: "20 min",
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
				duration: "60 min",
				content:
					"The R type parameter tracks what an Effect NEEDS to run. This is Effect's built-in dependency injection — no framework needed.",
				keyIdea:
					"Use Effect.Service to define services as classes with auto-generated layers. The R type ensures you provide all dependencies before running.",
				concepts: [
					{
						name: "Effect.Service",
						desc: "Defines a service as a class with tag, implementation, and auto-generated layers (Default, DefaultWithoutDependencies).",
					},
					{
						name: "R type parameter",
						desc: "Accumulates required services. Effect<User, Error, Database | Logger> needs both Database and Logger.",
					},
					{
						name: "dependencies option",
						desc: "Pass dependencies: [OtherService.Default] in Effect.Service to wire up the dependency graph declaratively.",
					},
					{
						name: "Effect.provideService(tag, impl)",
						desc: "Provides one service implementation. Removes it from R.",
					},
				],
				docsLink:
					"https://effect.website/docs/requirements-management/services/",
				trap: "The R type is like a checklist. The compiler won't let you run an Effect until R = never (all dependencies provided). This is the key insight.",
				code: `class Database extends Effect.Service<Database>()("Database", {
  effect: Effect.gen(function* () ({
    query: (sql: string) => Effect.tryPromise(() => db.query(sql))
  })),
  dependencies: [ConnectionPool.Default] // auto-wired
}) {}

// Auto-generated layers:
// Database.Default — includes all dependencies
// Database.DefaultWithoutDependencies — requires them externally

const getUsers = Effect.gen(function* () {
  const db = yield* Database  // pulls from context
  return yield* db.query("SELECT * FROM users")
})
// Type: Effect<User[], SqlError, Database>`,
			},
			{
				id: 12,
				title: "Layers",
				subtitle: "Composable dependency graphs",
				tweet: false,
				duration: "60 min",
				content:
					"Layers are the way to construct and compose service implementations. Effect.Service auto-generates layers, but you can also build them manually for advanced cases.",
				keyIdea:
					"A Layer<Out, Err, In> creates services of type Out, might fail with Err, and requires services In. For most services, use Effect.Service with dependencies — manual Layer composition is for advanced wiring.",
				concepts: [
					{
						name: "MyService.Default",
						desc: "Auto-generated by Effect.Service. Includes all declared dependencies. Use this 90% of the time.",
					},
					{
						name: "Layer.succeed(tag, impl)",
						desc: "Creates a Layer that provides a service. Simplest manual form.",
					},
					{
						name: "Layer.effect(tag, effect)",
						desc: "Creates a Layer from an Effect. The Effect can use other services.",
					},
					{
						name: "Layer.scoped(tag, effect)",
						desc: "Like Layer.effect but with resource management (acquire/release).",
					},
					{
						name: "Layer.merge / Layer.provide",
						desc: "Combine layers (merge = both provide, provide = one feeds into another).",
					},
					{
						name: "Effect.provide(layer)",
						desc: "Provides a Layer to an Effect, satisfying its R requirements.",
					},
				],
				docsLink: "https://effect.website/docs/requirements-management/layers/",
				trap: "Layers are memoized by default within a single provide call. If ServiceB and ServiceC both depend on ServiceA, ServiceA is created once. This is usually what you want.",
				code: `// Using Effect.Service (recommended)
class Cache extends Effect.Service<Cache>()("Cache", {
  effect: Effect.gen(function* () {
    const db = yield* Database
    return { get: (key: string) => db.query(key) }
  }),
  dependencies: [Database.Default]
}) {}

// Provide to your program
const main = program.pipe(Effect.provide(Cache.Default))
Effect.runPromise(main)`,
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
					"Scope ensures resources (DB connections, file handles, sockets) are always cleaned up — even on errors or interruption.",
				keyIdea:
					"Effect.acquireRelease pairs an acquire Effect with a release Effect. The release is GUARANTEED to run. Scope manages the lifecycle automatically.",
				concepts: [
					{
						name: "Effect.acquireRelease({ acquire, release })",
						desc: "Creates a scoped resource. Release runs on success, failure, or interruption.",
					},
					{
						name: "Effect.scoped",
						desc: "Runs a scoped Effect, closing all resources when done.",
					},
					{
						name: "Scope (R parameter)",
						desc: "When R includes Scope, the Effect manages resources. Use Effect.scoped to remove it.",
					},
					{
						name: "Effect.addFinalizer(f)",
						desc: "Registers cleanup logic that runs when the scope closes.",
					},
				],
				docsLink: "https://effect.website/docs/resource-management/scope/",
				trap: "Don't forget Effect.scoped! Without it, Scope stays in R and you can't run the Effect. Think of it as the \"using\" block in C#.",
				code: `const dbConnection = Effect.acquireRelease(
  Effect.tryPromise(() => pool.connect()),  // acquire
  (conn) => Effect.sync(() => conn.release()) // always runs
)

const program = Effect.gen(function* () {
  const conn = yield* dbConnection
  return yield* conn.query("SELECT * FROM users")
}).pipe(Effect.scoped) // closes scope, releases connection`,
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
					"Schema (imported from the main effect package) is Effect's answer to Zod. But it goes further: it does validation, parsing, encoding, AND generates types — all from one schema definition.",
				keyIdea:
					"A Schema is bidirectional: it can decode (validate/parse external data) AND encode (serialize for output). One definition, multiple uses.",
				concepts: [
					{
						name: "Schema.Struct({ ... })",
						desc: "Defines an object schema. Like z.object() in Zod.",
					},
					{
						name: "Schema.decodeUnknown(schema)",
						desc: "Creates an Effect that validates/parses unknown data against the schema.",
					},
					{
						name: "Schema.encode(schema)",
						desc: "Creates an Effect that serializes data according to the schema.",
					},
					{
						name: "Schema.String, Number, Boolean",
						desc: "Primitive schemas. Compose them into complex structures.",
					},
					{
						name: "Type inference",
						desc: "Schema.Type<typeof mySchema> extracts the TypeScript type. No manual type duplication.",
					},
				],
				docsLink: "https://effect.website/docs/schema/introduction/",
				trap: "Schema decode returns an Effect, not a plain value. You need to run it or yield* it. This is because decoding can fail with a ParseError.",
				code: `import { Schema } from "effect"

const User = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  email: Schema.String.pipe(Schema.pattern(/@/))
})

// Type is inferred — no manual interface needed
type User = Schema.Schema.Type<typeof User>

// Decode returns an Effect (can fail with ParseError)
const parse = Schema.decodeUnknown(User)
const result = yield* parse(apiResponse)`,
			},
			{
				id: 15,
				title: "Schema Classes & Transformations",
				subtitle: "Branded types, classes, transforms",
				tweet: false,
				duration: "45 min",
				content:
					"Level up from basic schemas to class-based schemas, branded types, and transformations.",
				keyIdea:
					"Schema classes combine schema + class definition. Branded types prevent mixing up primitives (UserId vs PostId). Transformations let you decode into different shapes.",
				concepts: [
					{
						name: 'Schema.Class<Self>("Tag")({fields})',
						desc: "Creates a class with built-in schema, structural equality, and a _tag. Also see Schema.TaggedClass for auto _tag field.",
					},
					{
						name: "Schema.brand('UserId')",
						desc: "Creates a branded type. UserId is a string at runtime but a unique type at compile time.",
					},
					{
						name: "Schema.transform(from, to, { ... })",
						desc: "Transforms between two schemas. Bidirectional: decode and encode.",
					},
					{
						name: "Schema.filter(predicate)",
						desc: "Adds validation to a schema. Like z.refine().",
					},
				],
				docsLink: "https://effect.website/docs/schema/classes/",
				trap: "Schema classes are NOT regular TS classes. They have structural equality (two instances with same data are equal) and a _tag. Don't add mutable state to them.",
			},
			{
				id: 16,
				title: "Option & Either",
				subtitle: "Explicit absence, explicit branching",
				tweet: false,
				duration: "30 min",
				content:
					"Effect provides Option (for nullable values) and Either (for branching results) as data types with full API support.",
				keyIdea:
					"Option replaces null/undefined with explicit Some(value) or None. Either<Right, Left> gives you a type-safe union of two outcomes. Both compose with pipe and match.",
				concepts: [
					{
						name: "Option.some(value) / Option.none()",
						desc: "Creates an Option. Use instead of null/undefined for explicit absence.",
					},
					{
						name: "Option.fromNullable(value)",
						desc: "Converts null | undefined to Option. Bridges to existing code.",
					},
					{
						name: "Either.right(value) / Either.left(error)",
						desc: "Creates an Either. Right = success, Left = failure (by convention).",
					},
					{
						name: "Option.match / Either.match",
						desc: "Pattern match to handle both cases explicitly.",
					},
				],
				docsLink: "https://effect.website/docs/data-types/option/",
				trap: "Option and Effect are different! Option is a simple data container. Effect is a lazy computation. Don't confuse Effect.succeed(Option.some(x)) with just Option.some(x).",
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
				title: "Logging, Metrics, Tracing",
				subtitle: "Built-in observability",
				tweet: false,
				duration: "45 min",
				content:
					"Effect has first-class logging, metrics, and tracing — no additional libraries needed.",
				keyIdea:
					"Effect.log is an Effect (it composes). Spans create traces. Metrics are type-safe counters/histograms. All integrate with the service system so you can swap implementations.",
				concepts: [
					{
						name: "Effect.log / logDebug / logWarning / logError",
						desc: "Structured logging. It's an Effect, so it composes with pipe and gen.",
					},
					{
						name: "Effect.withSpan('name')",
						desc: "Wraps an Effect in a tracing span. Automatic parent-child relationships.",
					},
					{
						name: "Effect.annotateCurrentSpan",
						desc: "Adds metadata to the current span.",
					},
					{
						name: "Metric.counter / histogram / gauge",
						desc: "Type-safe metrics that integrate with your Effect pipeline.",
					},
				],
				docsLink: "https://effect.website/docs/observability/logging/",
				trap: "Effect.log returns an Effect — you must yield* it or include it in a pipe. console.log works in Effect.gen but loses all the structured logging benefits.",
			},
		],
	},
	{
		phase: "Concurrency",
		slug: "concurrency",
		phaseColor: "#D5C5D8",
		steps: [
			{
				id: 18,
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
						desc: "Starts a Fiber. Returns immediately with a Fiber handle.",
					},
					{
						name: "Fiber.join(fiber)",
						desc: "Waits for a Fiber to complete. Returns the result as an Effect.",
					},
					{
						name: "Fiber.interrupt(fiber)",
						desc: "Cancels a running Fiber. Resources are cleaned up automatically.",
					},
					{
						name: "Effect.all(effects, { concurrency: 'unbounded' })",
						desc: "Runs effects concurrently. The simple way to do parallelism.",
					},
					{
						name: "Effect.race(effects)",
						desc: "Returns the first effect to complete. Others are interrupted.",
					},
				],
				docsLink: "https://effect.website/docs/concurrency/fibers/",
				trap: "Fibers are low-level. For most concurrent work, use Effect.all with concurrency options, or Effect.forEach with concurrency. Only reach for raw Fibers when you need fine-grained control.",
				code: `const program = Effect.gen(function* () {
  // Fork a background task
  const fiber = yield* Effect.fork(longRunningJob)

  // Do other work concurrently...
  yield* processItems()

  // Wait for the background task
  const result = yield* Fiber.join(fiber)

  // Or: run 10 tasks with concurrency limit
  yield* Effect.forEach(urls, fetchUrl, { concurrency: 10 })
})`,
			},
			{
				id: 19,
				title: "Queue, Deferred, Semaphore",
				subtitle: "Coordination primitives",
				tweet: false,
				duration: "45 min",
				content:
					"When Fibers need to communicate or coordinate, Effect provides Queue (buffered channel), Deferred (one-shot promise), and Semaphore (concurrency limiter).",
				keyIdea:
					"Queue = async channel between fibers. Deferred = a promise-like value set once. Semaphore = limit concurrent access to N. These compose with the rest of Effect seamlessly.",
				concepts: [
					{
						name: "Queue.bounded<A>(capacity)",
						desc: "Creates a bounded queue. Producers block when full, consumers block when empty.",
					},
					{
						name: "Queue.offer / Queue.take",
						desc: "Add to / take from the queue. Both return Effects.",
					},
					{
						name: "Deferred.make<A, E>()",
						desc: "Creates a deferred. Like a Promise you can complete from outside.",
					},
					{
						name: "Effect.makeSemaphore(n)",
						desc: "Limits concurrent access. semaphore.withPermits(1)(effect) limits to 1 at a time.",
					},
				],
				docsLink: "https://effect.website/docs/concurrency/queue/",
				trap: "Queue.take blocks the Fiber (not the thread). This is fine — Fibers are cheap. But don't create a queue and forget to consume it, or you'll leak memory.",
			},
		],
	},
	{
		phase: "Streams",
		slug: "streams",
		phaseColor: "#C8D8C5",
		steps: [
			{
				id: 20,
				title: "Streams & Sinks",
				subtitle: "Processing data flows",
				tweet: false,
				duration: "60 min",
				content:
					"Stream is Effect's answer to async iterables/observables. It models a potentially infinite sequence of values produced over time.",
				keyIdea:
					"Stream<A, E, R> emits multiple A values (vs Effect which produces one). Sink<A, In, L, E, R> consumes a Stream. Together they handle any data pipeline.",
				concepts: [
					{
						name: "Stream.fromIterable / fromEffect / unfold",
						desc: "Create streams from arrays, effects, or generator functions.",
					},
					{
						name: "Stream.map / filter / take / drop",
						desc: "Transform streams. Lazy — nothing runs until consumed.",
					},
					{
						name: "Stream.run(stream, sink)",
						desc: "Consume a stream with a sink. Sinks collect, fold, or aggregate values.",
					},
					{
						name: "Stream.runCollect(stream)",
						desc: "Collects all values into a Chunk. Simple but loads everything into memory.",
					},
					{
						name: "Stream.pipeTo(sink)",
						desc: "Connects a stream to a sink in a pipeline.",
					},
				],
				docsLink: "https://effect.website/docs/stream/introduction/",
				trap: "Streams are lazy and pull-based. Don't confuse them with EventEmitters (push-based). A Stream doesn't produce values until a consumer (Sink/runner) requests them.",
				code: `const pipeline = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.map((n) => n * 2),
  Stream.filter((n) => n > 4),
  Stream.tap((n) => Effect.log(\`Processing: \${n}\`)),
  Stream.runCollect // collects into a Chunk
)
// Result: Chunk(6, 8, 10)`,
			},
		],
	},
	{
		phase: "Testing & Style",
		slug: "testing-style",
		phaseColor: "#D8C8C5",
		steps: [
			{
				id: 21,
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
				id: 22,
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
				id: 23,
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
				id: 24,
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
				id: 25,
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
				id: 26,
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
				id: 27,
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
	4: `Effect.gen = async/await but with typed errors\n\nconst name = Effect.succeed("Alice")\nconst getUser = (id) => Effect.tryPromise(...)\n\nyield* name        — no (), it's already an Effect\nyield* getUser(id) — (), it returns an Effect\n\n#EffectTS #TypeScript`,
	7: `The biggest "aha" moment learning @EffectTS_:\n\nThere are TWO kinds of errors:\n\n- Expected (in the type signature) — you MUST handle them\n- Defects (hidden) — bugs that bubble up\n\ntry/catch treats all errors the same. Effect doesn't.\n\n#TypeScript`,
	10: `Yieldable errors in @EffectTS_ are genius:\n\nclass NotFound extends Data.TaggedError("NotFound")<{ id: string }> {}\n\nyield* new NotFound({ id })\n\nType-safe "throwing" inside generators. No more stringly-typed errors.\n\n#EffectTS`,
	11: `Dependency injection in @EffectTS_ is tracked by the TYPE SYSTEM.\n\nEffect<User, DbError, Database | Logger>\n\nThe compiler literally won't let you run this until you provide Database AND Logger.\n\nNo runtime DI container. No decorators. Just types.\n\n#TypeScript`,
	14: `@effect/schema is what happens when Zod meets bidirectional transforms:\n\n-> decode (validate external data)\n-> encode (serialize for output)\n-> type inference\n\nOne schema definition. Multiple directions.\n\n#EffectTS #TypeScript`,
	18: `Fibers in @EffectTS_ = lightweight virtual threads for TypeScript\n\nEffect.fork -> start a fiber\nFiber.join -> wait for result\nFiber.interrupt -> cancel (resources auto-cleanup)\n\nOr just: Effect.all(tasks, { concurrency: 10 })\n\n#EffectTS`,
	22: `Finished the core @EffectTS_ curriculum!\n\nBiggest takeaways:\n- Effect<A, E, R> — one type to rule them all\n- Generators for logic, pipes for behavior\n- Services + Layers = testable by default\n- Schema for validation + serialization\n\nNow onto the ecosystem.\n\n#EffectTS #TypeScript`,
	24: `@effect/platform's HttpClient changed how I think about HTTP in TypeScript:\n\n- It's a SERVICE you inject (mockable!)\n- Schema validates responses automatically\n- Errors are typed, not thrown\n- Same code works Node/Bun/browser\n\nNo more raw fetch().\n\n#EffectTS`,
	27: `Finished my @EffectTS_ journey — here's the production pattern:\n\n1. Services define capabilities\n2. Layers wire dependencies\n3. Config loads settings\n4. Schema validates boundaries\n5. ManagedRuntime runs everything\n\nOne type. Full stack. Type-safe.\n\n#EffectTS #TypeScript`,
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
