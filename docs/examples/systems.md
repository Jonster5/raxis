# Using Systems

Systems in Raxis are where all of your application's functionality will be. To keep your code organized, __do not__ make something like a single system where all of your game's logic is, divide your logic into discrete systems that each do a specific task.

## Creating Systems

A system is just a function that takes a single argument which is the `ECS`

```ts
function mySystem(ecs: ECS) {
    // Do something
}
```