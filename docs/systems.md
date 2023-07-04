# Using Systems

Systems in Raxis are where all of your application's functionality will be. To keep your code organized, __do not__ make something like a single system where all of your game's logic is, divide your logic into discrete systems that each do a specific task.

## Creating Systems

A system is just a function that takes a single argument which is the `ECS`

```ts
function mySystem(ecs: ECS) {
    // Do something
}
```

## Registering Systems

There are three types of systems, **Startup systems**, which only run once when the ECS first starts up, **Main systems**, which begin loopiong at the browser's refresh rate after the startup cycle completes, and until `ecs.stop()` is invoked, and **Shutdown systems**, which run only when `ecs.shutdown()` is explicitly called.

These are examples of [registering systems](./docs.md#addmainsystem)

```ts
ecs.addStartupSystem(setupPlayer)
```

```ts
ecs.addMainSystem(playerMovement)
```

```ts
ecs.addShutdownSystem(cancelPlayerHandlers);
```