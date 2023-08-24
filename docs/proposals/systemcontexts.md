# System Contexts

The big idea here is to provide better access to common system methods in a more ergonomic api

### Old
```ts
function mySystem(ecs: ECS) {
    // Full access to the ECS
}
```

### New
```ts
function mySystem(this: SysContext) {
    //  Access to scoped methods through `this`
}
```

#

## SysContext API

```ts
interface SysContext {
    query<T extends [...CompType[]], F extends [...CompFilter[]]>(...args: [...T, ...F]): QueryResults<T, M>;

    resource<T extends Resource>(type: ResType<T> | T): T;

    local<T extends Resource>(type: ResType<T> | T): T;

    sendEvent()

    
}
```
