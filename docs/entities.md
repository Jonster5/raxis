# Using Entities

An entity in Raxis is actually nothing more than an id number that components can be associated with. However the engine provides many utilities for managing your entities and the components they hold. Entities can hold as many components as desired, but only one of each component type. All component types must be registered before they can be used on an Entity

## Creating and Destroying Entities

Entities are created using the `spawn()` method on `ECS`

```ts
function someSystem(ecs: ECS) {
    const myEntity = ecs.spawn(new MyComp(arg1, arg2), new MyOtherComp(), ... ); // Returns an instance of Entity
}
```

[Entity](./docs.md#entity) is a utility class which provides an api for accessing and managing your entity.

---

There are multiple ways to destroy an entity.

```ts
ecs.destroy(myEntity.id());
```
Or just

```ts
myEntity.destroy();
```

When you destroy an entity, all of it's component's will be destroyed, and any child entities will be destroyed as well.

See the docs for [Entity](./docs.md#entity) for a full list of methods. 