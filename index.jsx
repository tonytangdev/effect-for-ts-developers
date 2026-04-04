import { useState } from "react";

const TWITTER_ICON = (
	<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
		<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
	</svg>
);

const STEPS = [
	{
		phase: "Foundation",
		phaseColor: "#E8D5B7",
		steps: [
			{
				id: 1,
				title: "The Mental Model",
				subtitle: "Why Effect exists & what it replaces",
				tweet: false,
				duration: "30 min",
				content: `Before writing any code, understand what Effect actually is. It's NOT just another utility library — it's a complete paradigm for describing programs.`,
				keyIdea: `Effect<Success, Error, Requirements> — this single type replaces Promise, try/catch, dependency injection, and more. Think of it as a "blueprint" for a computation, not the computation itself.`,
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
				trap: `Coming from async/await, you'll instinctively think an Effect "runs" when created. It doesn't. const x = Effect.log("hi") prints nothing. You must run it.`,
			},
			{
				id: 2,
				title: "Creating Effects",
				subtitle: "succeed, fail, sync, promise, try",
				tweet: false,
				duration: "45 min",
				content: `Learn the constructors — how to wrap existing values, sync code, and async code into the Effect world.`,
				keyIdea: `Match the constructor to what you're wrapping. Already have a value? succeed/fail. Sync code that might throw? try. Async code? promise or tryPromise.`,
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
				trap: `Don't use Effect.sync for code that throws — use Effect.try instead. sync assumes no exceptions. Also, never use Effect.promise for fetch() — it can reject, so use tryPromise.`,
			},
			{
				id: 3,
				title: "Running Effects",
				subtitle: "runSync, runPromise, runFork",
				tweet: false,
				duration: "30 min",
				content: `Effects are blueprints. Runners execute them. Choose the right runner for your context.`,
				keyIdea: `There should be exactly ONE runner at the edge of your program. Everything else composes Effects together without running them.`,
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
						desc: "Runs on a Fiber. Non-blocking. Used internally and for advanced concurrency.",
					},
				],
				docsLink:
					"https://effect.website/docs/getting-started/running-effects/",
				trap: `Don't sprinkle runners throughout your code. One runner at the entry point. Compose everything else with pipe, gen, map, flatMap.`,
			},
			{
				id: 4,
				title: "Generators (Effect.gen)",
				subtitle: "The async/await of Effect",
				tweet: true,
				duration: "45 min",
				content: `Effect.gen is how you write sequential Effect code that reads like async/await. This is the syntax you'll use 90% of the time.`,
				keyIdea: `yield* is to Effect.gen what await is to async functions. But unlike await, yield* works with ANY Effect — sync or async, with typed errors and dependencies.`,
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
				trap: `You MUST use yield* (with the asterisk), not plain yield. Also, the generator must be function*, not an arrow function.`,
				code: `const program = Effect.gen(function* () {
  const user = yield* fetchUser(id)    // like: await fetchUser(id)
  const posts = yield* fetchPosts(user.id)
  return { user, posts }
})
// program is Effect<{user, posts}, HttpError, ApiService>
// Nothing has executed yet!`,
			},
		],
	},
	{
		phase: "Composition",
		phaseColor: "#C5D5C0",
		steps: [
			{
				id: 5,
				title: "pipe & Pipelines",
				subtitle: "The functional composition backbone",
				tweet: false,
				duration: "30 min",
				content: `pipe is the other main way to compose Effects (besides generators). Use it for transformations, adding behaviors, and chaining.`,
				keyIdea: `pipe reads top-to-bottom: start with a value, then apply transformations. It's great for adding cross-cutting concerns like timeouts, retries, and logging.`,
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
				trap: `When to use pipe vs gen? Use gen for complex sequential logic. Use pipe for adding behaviors to an existing Effect (retry, timeout, logging). They compose together.`,
			},
			{
				id: 6,
				title: "Control Flow",
				subtitle: "if/else, loops, matching in Effect",
				tweet: false,
				duration: "30 min",
				content: `Standard JS control flow (if/else, for loops) works inside Effect.gen. But Effect also provides functional alternatives for pipelines.`,
				keyIdea: `Inside a generator, use normal if/else and loops — it's the simplest approach. The functional operators (Effect.if, Effect.forEach, etc.) shine in pipe-based code.`,
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
				trap: `Effect.all is sequential by default! For parallel execution, pass { concurrency: \"unbounded\" } or a number. This is the opposite of Promise.all which is always concurrent.`,
			},
		],
	},
	{
		phase: "Error Handling",
		phaseColor: "#D4C5C7",
		steps: [
			{
				id: 7,
				title: "The Two Error Types",
				subtitle: "Expected vs Unexpected — the core insight",
				tweet: true,
				duration: "45 min",
				content: `This is the concept that makes Effect's error handling superior to try/catch. Effect distinguishes between errors you EXPECT (and handle) vs bugs you DON'T.`,
				keyIdea: `Expected errors appear in the E type parameter — the compiler forces you to handle them. Unexpected errors (defects) are tracked separately and bubble up like uncaught exceptions.`,
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
				trap: `Don't make everything an expected error. Use expected errors for things callers should handle (network failures, validation). Use defects for programming bugs.`,
			},
			{
				id: 8,
				title: "Handling Expected Errors",
				subtitle: "catchTag, catchAll, mapError",
				tweet: false,
				duration: "45 min",
				content: `Learn the operators to recover from, transform, or propagate typed errors.`,
				keyIdea: `Use tagged errors (classes with a _tag field) + catchTag for surgical error recovery. This is the Effect equivalent of catching specific exception types.`,
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
				trap: `catchTag only works with tagged unions. If your errors don't have _tag, use catchAll or match instead.`,
			},
			{
				id: 9,
				title: "Retrying & Timeouts",
				subtitle: "Schedule-based resilience",
				tweet: false,
				duration: "30 min",
				content: `Effect has built-in retry and timeout that compose cleanly with your error types.`,
				keyIdea: `Retries use Schedule — a composable description of "when to retry". Timeouts add a new error type to your Effect's E channel automatically.`,
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
				trap: `timeout adds TimeoutException to your error channel. If you want to handle it specifically, use catchTag('TimeoutException', ...).`,
			},
			{
				id: 10,
				title: "Yieldable Errors",
				subtitle: "Errors as first-class values",
				tweet: true,
				duration: "20 min",
				content: `A powerful Effect pattern: make your errors yieldable so you can use yield* to "throw" them in generators.`,
				keyIdea: `Extend Data.TaggedError to create error classes that are both proper data types AND yieldable inside Effect.gen.`,
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
				trap: `You need to extend Data.TaggedError, not just add a _tag manually, for the yield* trick to work.`,
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
		phaseColor: "#C5CDD8",
		steps: [
			{
				id: 11,
				title: "Services & Context",
				subtitle: "The R in Effect<A, E, R>",
				tweet: true,
				duration: "60 min",
				content: `The R type parameter tracks what an Effect NEEDS to run. This is Effect's built-in dependency injection — no framework needed.`,
				keyIdea: `Define a Service interface with Context.Tag, then use Effect.Service to create services. The R type ensures you provide all dependencies before running.`,
				concepts: [
					{
						name: "Context.Tag / Effect.Service",
						desc: "Declares a service interface. Think of it as a typed key in a dependency container.",
					},
					{
						name: "R type parameter",
						desc: "Accumulates required services. Effect<User, Error, Database | Logger> needs both Database and Logger.",
					},
					{
						name: "Effect.provideService(tag, impl)",
						desc: "Provides one service implementation. Removes it from R.",
					},
				],
				docsLink:
					"https://effect.website/docs/requirements-management/services/",
				trap: `The R type is like a checklist. The compiler won't let you run an Effect until R = never (all dependencies provided). This is the key insight.`,
				code: `class Database extends Effect.Service<Database>()("Database", {
  effect: Effect.gen(function* () ({
    query: (sql: string) => Effect.tryPromise(() => db.query(sql))
  }))
}) {}

// Using it:
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
				content: `Layers are the way to construct and compose service implementations. They handle initialization, lifecycle, and dependencies between services.`,
				keyIdea: `A Layer<Out, Err, In> creates services of type Out, might fail with Err, and requires services In. Layers compose like LEGO — build complex dependency trees from simple pieces.`,
				concepts: [
					{
						name: "Layer.succeed(tag, impl)",
						desc: "Creates a Layer that provides a service. Simplest form.",
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
						name: "Layer.merge(layer1, layer2)",
						desc: "Combines layers. Both run and provide their services.",
					},
					{
						name: "Effect.provide(layer)",
						desc: "Provides a Layer to an Effect, satisfying its R requirements.",
					},
				],
				docsLink: "https://effect.website/docs/requirements-management/layers/",
				trap: `Layers are memoized by default within a single provide call. If ServiceB and ServiceC both depend on ServiceA, ServiceA is created once. This is usually what you want.`,
			},
		],
	},
	{
		phase: "Resource Management",
		phaseColor: "#D8D4C5",
		steps: [
			{
				id: 13,
				title: "Scope & acquireRelease",
				subtitle: "Never leak a resource again",
				tweet: false,
				duration: "45 min",
				content: `Scope ensures resources (DB connections, file handles, sockets) are always cleaned up — even on errors or interruption.`,
				keyIdea: `Effect.acquireRelease pairs an acquire Effect with a release Effect. The release is GUARANTEED to run. Scope manages the lifecycle automatically.`,
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
				trap: `Don't forget Effect.scoped! Without it, Scope stays in R and you can't run the Effect. Think of it as the "using" block in C#.`,
			},
		],
	},
	{
		phase: "Schema & Data",
		phaseColor: "#E5D5C5",
		steps: [
			{
				id: 14,
				title: "Schema Basics",
				subtitle: "Validation, parsing, encoding — one tool",
				tweet: true,
				duration: "60 min",
				content: `@effect/schema is Effect's answer to Zod. But it goes further: it does validation, parsing, encoding, AND generates types — all from one schema definition.`,
				keyIdea: `A Schema is bidirectional: it can decode (validate/parse external data) AND encode (serialize for output). One definition, multiple uses.`,
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
				trap: `Schema decode returns an Effect, not a plain value. You need to run it or yield* it. This is because decoding can fail with a ParseError.`,
			},
			{
				id: 15,
				title: "Schema Classes & Transformations",
				subtitle: "Branded types, classes, transforms",
				tweet: false,
				duration: "45 min",
				content: `Level up from basic schemas to class-based schemas, branded types, and transformations.`,
				keyIdea: `Schema classes combine schema + class definition. Branded types prevent mixing up primitives (UserId vs PostId). Transformations let you decode into different shapes.`,
				concepts: [
					{
						name: "Schema.Class<Tag>()",
						desc: "Creates a class with built-in schema, structural equality, and a _tag.",
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
				trap: `Schema classes are NOT regular TS classes. They have structural equality (two instances with same data are equal) and a _tag. Don't add mutable state to them.`,
			},
			{
				id: 16,
				title: "Option & Either",
				subtitle: "Explicit absence, explicit branching",
				tweet: false,
				duration: "30 min",
				content: `Effect provides Option (for nullable values) and Either (for branching results) as data types with full API support.`,
				keyIdea: `Option replaces null/undefined with explicit Some(value) or None. Either<Right, Left> gives you a type-safe union of two outcomes. Both compose with pipe and match.`,
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
				trap: `Option and Effect are different! Option is a simple data container. Effect is a lazy computation. Don't confuse Effect.succeed(Option.some(x)) with just Option.some(x).`,
			},
		],
	},
	{
		phase: "Observability",
		phaseColor: "#C5D8D4",
		steps: [
			{
				id: 17,
				title: "Logging, Metrics, Tracing",
				subtitle: "Built-in observability",
				tweet: false,
				duration: "45 min",
				content: `Effect has first-class logging, metrics, and tracing — no additional libraries needed.`,
				keyIdea: `Effect.log is an Effect (it composes). Spans create traces. Metrics are type-safe counters/histograms. All integrate with the service system so you can swap implementations.`,
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
				trap: `Effect.log returns an Effect — you must yield* it or include it in a pipe. console.log works in Effect.gen but loses all the structured logging benefits.`,
			},
		],
	},
	{
		phase: "Concurrency",
		phaseColor: "#D5C5D8",
		steps: [
			{
				id: 18,
				title: "Fibers & Basic Concurrency",
				subtitle: "Lightweight threads for TypeScript",
				tweet: true,
				duration: "60 min",
				content: `Fibers are Effect's concurrency primitive — lightweight virtual threads that can be forked, joined, and interrupted.`,
				keyIdea: `Effect.fork runs an Effect on a new Fiber. Fiber.join waits for it. Fiber.interrupt cancels it. Effect.all with concurrency options is the easy path for most cases.`,
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
				trap: `Fibers are low-level. For most concurrent work, use Effect.all with concurrency options, or Effect.forEach with concurrency. Only reach for raw Fibers when you need fine-grained control.`,
			},
			{
				id: 19,
				title: "Queue, Deferred, Semaphore",
				subtitle: "Coordination primitives",
				tweet: false,
				duration: "45 min",
				content: `When Fibers need to communicate or coordinate, Effect provides Queue (buffered channel), Deferred (one-shot promise), and Semaphore (concurrency limiter).`,
				keyIdea: `Queue = async channel between fibers. Deferred = a promise-like value set once. Semaphore = limit concurrent access to N. These compose with the rest of Effect seamlessly.`,
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
				trap: `Queue.take blocks the Fiber (not the thread). This is fine — Fibers are cheap. But don't create a queue and forget to consume it, or you'll leak memory.`,
			},
		],
	},
	{
		phase: "Streams",
		phaseColor: "#C8D8C5",
		steps: [
			{
				id: 20,
				title: "Streams & Sinks",
				subtitle: "Processing data flows",
				tweet: false,
				duration: "60 min",
				content: `Stream is Effect's answer to async iterables/observables. It models a potentially infinite sequence of values produced over time.`,
				keyIdea: `Stream<A, E, R> emits multiple A values (vs Effect which produces one). Sink<A, In, L, E, R> consumes a Stream. Together they handle any data pipeline.`,
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
				trap: `Streams are lazy and pull-based. Don't confuse them with EventEmitters (push-based). A Stream doesn't produce values until a consumer (Sink/runner) requests them.`,
			},
		],
	},
	{
		phase: "Testing & Style",
		phaseColor: "#D8C8C5",
		steps: [
			{
				id: 21,
				title: "Testing with Effect",
				subtitle: "TestClock, service mocking, and more",
				tweet: false,
				duration: "45 min",
				content: `Effect's dependency injection makes testing easy: swap real services for test implementations. TestClock lets you control time.`,
				keyIdea: `Because services are in the R type, you can provide mock implementations in tests. TestClock.adjust lets you fast-forward time without waiting.`,
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
				trap: `Remember: services are interfaces. If you design services as interfaces from the start, testing is trivial. If you hardcode implementations, you lose this power.`,
			},
			{
				id: 22,
				title: "Code Style & Patterns",
				subtitle: "Dual APIs, branded types, pattern matching",
				tweet: true,
				duration: "30 min",
				content: `Wrap up by learning Effect's idioms: dual APIs (data-first vs data-last), branded types for domain modeling, and Match for exhaustive pattern matching.`,
				keyIdea: `Effect APIs support both pipe style (data-last) and direct style (data-first). Use branded types to make your domain model precise. Match.value for exhaustive switches.`,
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
				trap: `Don't overthink style early on. Start with Effect.gen everywhere, then adopt pipe-based patterns as you get comfortable. The community generally recommends gen for logic and pipe for adding behaviors.`,
			},
		],
	},
];

const TOTAL_STEPS = STEPS.reduce((acc, phase) => acc + phase.steps.length, 0);

export default function EffectTSCourse() {
	const [completedSteps, setCompletedSteps] = useState(new Set());
	const [expandedStep, setExpandedStep] = useState(1);
	const [showSidebar, setShowSidebar] = useState(false);

	const toggleComplete = (id) => {
		setCompletedSteps((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const progress = Math.round((completedSteps.size / TOTAL_STEPS) * 100);

	const generateTweet = (step) => {
		const tweetTemplates = {
			4: `🧵 Just learned Effect.gen — it's like async/await but with typed errors and dependency tracking built in.\n\nyield* is the new await.\n\nThe key insight: Effects are LAZY. Nothing runs until you tell it to.\n\n#EffectTS #TypeScript`,
			7: `💡 The biggest "aha" moment learning @EffectTS_:\n\nThere are TWO kinds of errors:\n\n• Expected (in the type signature) — you MUST handle them\n• Defects (hidden) — bugs that bubble up\n\ntry/catch treats all errors the same. Effect doesn't.\n\n#TypeScript`,
			10: `🔥 Yieldable errors in @EffectTS_ are genius:\n\nclass NotFound extends Data.TaggedError("NotFound")<{ id: string }> {}\n\nyield* new NotFound({ id })\n\nType-safe "throwing" inside generators. No more stringly-typed errors.\n\n#EffectTS`,
			11: `🧩 Dependency injection in @EffectTS_ is tracked by the TYPE SYSTEM.\n\nEffect<User, DbError, Database | Logger>\n\nThe compiler literally won't let you run this until you provide Database AND Logger.\n\nNo runtime DI container. No decorators. Just types.\n\n#TypeScript`,
			14: `📦 @effect/schema is what happens when Zod meets bidirectional transforms:\n\n→ decode (validate external data)\n→ encode (serialize for output)\n→ type inference\n\nOne schema definition. Multiple directions.\n\n#EffectTS #TypeScript`,
			18: `⚡ Fibers in @EffectTS_ = lightweight virtual threads for TypeScript\n\nEffect.fork → start a fiber\nFiber.join → wait for result\nFiber.interrupt → cancel (resources auto-cleanup)\n\nOr just: Effect.all(tasks, { concurrency: 10 })\n\n#EffectTS`,
			22: `🎓 Finished my @EffectTS_ learning journey!\n\nBiggest takeaways:\n• Effect<A, E, R> — one type to rule them all\n• Generators for logic, pipes for behavior\n• Services + Layers = testable by default\n• Schema for validation + serialization\n\n#EffectTS #TypeScript`,
		};
		return tweetTemplates[step.id] || "";
	};

	return (
		<div
			style={{
				fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
				background: "#1a1a18",
				color: "#e8e4dc",
				minHeight: "100vh",
				position: "relative",
			}}
		>
			<link
				href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap"
				rel="stylesheet"
			/>

			{/* Header */}
			<div
				style={{
					borderBottom: "1px solid #3a3a35",
					padding: "20px 24px",
					position: "sticky",
					top: 0,
					background: "#1a1a18",
					zIndex: 100,
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div>
						<h1
							style={{
								fontFamily: "'Playfair Display', serif",
								fontSize: 22,
								fontWeight: 700,
								margin: 0,
								letterSpacing: "-0.5px",
								color: "#f5f0e8",
							}}
						>
							Effect TS
						</h1>
						<p
							style={{
								fontSize: 11,
								color: "#888880",
								margin: "2px 0 0",
								letterSpacing: "2px",
								textTransform: "uppercase",
							}}
						>
							A course for TypeScript developers
						</p>
					</div>
					<button
						onClick={() => setShowSidebar(!showSidebar)}
						style={{
							background: "#2a2a25",
							border: "1px solid #3a3a35",
							color: "#e8e4dc",
							padding: "6px 12px",
							fontSize: 11,
							cursor: "pointer",
							fontFamily: "inherit",
						}}
					>
						{progress}% done
					</button>
				</div>

				{/* Progress bar */}
				<div
					style={{
						marginTop: 12,
						height: 2,
						background: "#2a2a25",
						position: "relative",
					}}
				>
					<div
						style={{
							height: "100%",
							width: `${progress}%`,
							background: "linear-gradient(90deg, #8B7355, #C4A67D)",
							transition: "width 0.5s ease",
						}}
					/>
				</div>
			</div>

			{/* Sidebar overlay */}
			{showSidebar && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 200,
						display: "flex",
					}}
				>
					<div
						onClick={() => setShowSidebar(false)}
						style={{
							position: "absolute",
							inset: 0,
							background: "rgba(0,0,0,0.6)",
						}}
					/>
					<div
						style={{
							position: "relative",
							width: "85%",
							maxWidth: 360,
							background: "#1a1a18",
							borderRight: "1px solid #3a3a35",
							overflowY: "auto",
							padding: "20px",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: 20,
							}}
						>
							<h2
								style={{
									fontFamily: "'Playfair Display', serif",
									fontSize: 18,
									margin: 0,
								}}
							>
								Progress
							</h2>
							<button
								onClick={() => setShowSidebar(false)}
								style={{
									background: "none",
									border: "none",
									color: "#888880",
									fontSize: 18,
									cursor: "pointer",
								}}
							>
								✕
							</button>
						</div>
						<div
							style={{
								fontSize: 32,
								fontFamily: "'Playfair Display', serif",
								color: "#C4A67D",
								marginBottom: 4,
							}}
						>
							{completedSteps.size}/{TOTAL_STEPS}
						</div>
						<p style={{ fontSize: 11, color: "#888880", marginBottom: 24 }}>
							steps completed
						</p>

						{STEPS.map((phase) => (
							<div key={phase.phase} style={{ marginBottom: 16 }}>
								<div
									style={{
										fontSize: 10,
										textTransform: "uppercase",
										letterSpacing: "2px",
										color: phase.phaseColor,
										marginBottom: 8,
										fontWeight: 600,
									}}
								>
									{phase.phase}
								</div>
								{phase.steps.map((step) => (
									<div
										key={step.id}
										onClick={() => {
											setExpandedStep(step.id);
											setShowSidebar(false);
										}}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 8,
											padding: "6px 0",
											cursor: "pointer",
											opacity: completedSteps.has(step.id) ? 0.5 : 1,
										}}
									>
										<span
											style={{
												width: 14,
												height: 14,
												borderRadius: "50%",
												border: completedSteps.has(step.id)
													? "none"
													: "1px solid #555",
												background: completedSteps.has(step.id)
													? "#8B7355"
													: "transparent",
												flexShrink: 0,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 9,
												color: "#fff",
											}}
										>
											{completedSteps.has(step.id) && "✓"}
										</span>
										<span
											style={{
												fontSize: 12,
												textDecoration: completedSteps.has(step.id)
													? "line-through"
													: "none",
											}}
										>
											{step.title}
										</span>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Main content */}
			<div style={{ padding: "0 0 80px" }}>
				{STEPS.map((phase) => (
					<div key={phase.phase}>
						{/* Phase header */}
						<div
							style={{
								padding: "24px 24px 8px",
								position: "sticky",
								top: 70,
								background: "#1a1a18",
								zIndex: 10,
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 10,
								}}
							>
								<div
									style={{
										width: 8,
										height: 8,
										background: phase.phaseColor,
										borderRadius: "50%",
									}}
								/>
								<h2
									style={{
										fontSize: 10,
										textTransform: "uppercase",
										letterSpacing: "3px",
										color: phase.phaseColor,
										margin: 0,
										fontWeight: 600,
									}}
								>
									{phase.phase}
								</h2>
							</div>
						</div>

						{phase.steps.map((step) => {
							const isExpanded = expandedStep === step.id;
							const isCompleted = completedSteps.has(step.id);

							return (
								<div
									key={step.id}
									style={{
										margin: "4px 16px",
										border: isExpanded
											? "1px solid #3a3a35"
											: "1px solid transparent",
										background: isExpanded ? "#222220" : "transparent",
										transition: "all 0.2s ease",
									}}
								>
									{/* Step header */}
									<div
										onClick={() => setExpandedStep(isExpanded ? null : step.id)}
										style={{
											padding: "14px 16px",
											cursor: "pointer",
											display: "flex",
											alignItems: "flex-start",
											gap: 12,
										}}
									>
										<span
											style={{
												fontFamily: "'Playfair Display', serif",
												fontSize: 18,
												color: isCompleted ? "#8B7355" : "#555550",
												minWidth: 28,
												lineHeight: 1,
												paddingTop: 2,
											}}
										>
											{String(step.id).padStart(2, "0")}
										</span>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													fontSize: 14,
													fontWeight: 500,
													color: isCompleted ? "#888880" : "#f5f0e8",
													textDecoration: isCompleted ? "line-through" : "none",
												}}
											>
												{step.title}
											</div>
											<div
												style={{
													fontSize: 11,
													color: "#888880",
													marginTop: 2,
												}}
											>
												{step.subtitle}
											</div>
										</div>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 8,
												flexShrink: 0,
											}}
										>
											{step.tweet && (
												<span
													style={{
														color: "#5B8DEF",
														opacity: 0.6,
														display: "flex",
													}}
												>
													{TWITTER_ICON}
												</span>
											)}
											<span
												style={{
													fontSize: 10,
													color: "#666",
												}}
											>
												{step.duration}
											</span>
										</div>
									</div>

									{/* Expanded content */}
									{isExpanded && (
										<div style={{ padding: "0 16px 20px 56px" }}>
											<p
												style={{
													fontSize: 13,
													lineHeight: 1.7,
													color: "#b8b4ac",
													margin: "0 0 16px",
												}}
											>
												{step.content}
											</p>

											{/* Key idea */}
											<div
												style={{
													background: "#2a2a25",
													borderLeft: `3px solid ${phase.phaseColor}`,
													padding: "12px 16px",
													marginBottom: 16,
													fontSize: 12,
													lineHeight: 1.7,
													color: "#d8d4cc",
												}}
											>
												<span
													style={{
														fontSize: 9,
														textTransform: "uppercase",
														letterSpacing: "2px",
														color: phase.phaseColor,
														display: "block",
														marginBottom: 6,
														fontWeight: 600,
													}}
												>
													Key Insight
												</span>
												{step.keyIdea}
											</div>

											{/* Concepts */}
											<div style={{ marginBottom: 16 }}>
												<span
													style={{
														fontSize: 9,
														textTransform: "uppercase",
														letterSpacing: "2px",
														color: "#888880",
														display: "block",
														marginBottom: 10,
														fontWeight: 600,
													}}
												>
													What to learn
												</span>
												{step.concepts.map((c, i) => (
													<div
														key={i}
														style={{
															marginBottom: 10,
															paddingBottom: 10,
															borderBottom:
																i < step.concepts.length - 1
																	? "1px solid #2a2a25"
																	: "none",
														}}
													>
														<code
															style={{
																fontSize: 12,
																color: "#C4A67D",
																background: "#2a2a25",
																padding: "2px 6px",
																display: "inline-block",
																marginBottom: 4,
															}}
														>
															{c.name}
														</code>
														<div
															style={{
																fontSize: 11,
																color: "#999990",
																lineHeight: 1.6,
															}}
														>
															{c.desc}
														</div>
													</div>
												))}
											</div>

											{/* Code example */}
											{step.code && (
												<div style={{ marginBottom: 16 }}>
													<span
														style={{
															fontSize: 9,
															textTransform: "uppercase",
															letterSpacing: "2px",
															color: "#888880",
															display: "block",
															marginBottom: 8,
															fontWeight: 600,
														}}
													>
														Example
													</span>
													<pre
														style={{
															background: "#1a1a18",
															border: "1px solid #3a3a35",
															padding: 14,
															fontSize: 11,
															lineHeight: 1.6,
															overflowX: "auto",
															color: "#b8b4ac",
															margin: 0,
														}}
													>
														{step.code}
													</pre>
												</div>
											)}

											{/* Common trap */}
											<div
												style={{
													background: "rgba(200, 100, 80, 0.08)",
													border: "1px solid rgba(200, 100, 80, 0.2)",
													padding: "12px 16px",
													marginBottom: 16,
													fontSize: 11,
													lineHeight: 1.7,
													color: "#c89080",
												}}
											>
												<span
													style={{
														fontSize: 9,
														textTransform: "uppercase",
														letterSpacing: "2px",
														display: "block",
														marginBottom: 6,
														fontWeight: 600,
													}}
												>
													⚠ Common Trap
												</span>
												{step.trap}
											</div>

											{/* Tweet section */}
											{step.tweet && (
												<div
													style={{
														background: "rgba(91, 141, 239, 0.06)",
														border: "1px solid rgba(91, 141, 239, 0.15)",
														padding: "14px 16px",
														marginBottom: 16,
													}}
												>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: 6,
															marginBottom: 10,
														}}
													>
														<span style={{ color: "#5B8DEF" }}>
															{TWITTER_ICON}
														</span>
														<span
															style={{
																fontSize: 9,
																textTransform: "uppercase",
																letterSpacing: "2px",
																color: "#5B8DEF",
																fontWeight: 600,
															}}
														>
															Post what you learned
														</span>
													</div>
													<pre
														style={{
															fontSize: 11,
															lineHeight: 1.6,
															color: "#8BA8D8",
															whiteSpace: "pre-wrap",
															wordBreak: "break-word",
															margin: 0,
															fontFamily: "inherit",
														}}
													>
														{generateTweet(step)}
													</pre>
													<a
														href={`https://x.com/intent/tweet?text=${encodeURIComponent(generateTweet(step))}`}
														target="_blank"
														rel="noopener noreferrer"
														style={{
															display: "inline-flex",
															alignItems: "center",
															gap: 6,
															marginTop: 10,
															padding: "6px 14px",
															background: "#5B8DEF",
															color: "#fff",
															fontSize: 11,
															textDecoration: "none",
															fontFamily: "inherit",
														}}
													>
														{TWITTER_ICON}
														Post on X
													</a>
												</div>
											)}

											{/* Actions */}
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: 10,
													flexWrap: "wrap",
												}}
											>
												<button
													onClick={() => toggleComplete(step.id)}
													style={{
														background: isCompleted ? "#8B7355" : "#2a2a25",
														border: isCompleted
															? "1px solid #8B7355"
															: "1px solid #3a3a35",
														color: isCompleted ? "#fff" : "#b8b4ac",
														padding: "8px 16px",
														fontSize: 11,
														cursor: "pointer",
														fontFamily: "inherit",
														transition: "all 0.2s ease",
													}}
												>
													{isCompleted ? "✓ Completed" : "Mark complete"}
												</button>
												<a
													href={step.docsLink}
													target="_blank"
													rel="noopener noreferrer"
													style={{
														color: "#888880",
														fontSize: 11,
														textDecoration: "none",
														borderBottom: "1px solid #3a3a35",
														paddingBottom: 1,
														fontFamily: "inherit",
													}}
												>
													Read docs →
												</a>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}
