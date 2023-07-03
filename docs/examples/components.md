# Using Components

Components, along with [Resources](./resources.md), hold all of your application's state. They should not contain any functionality except for a few [predefined methods](../docs.md#component) that can be implemented.

## Making Components

In order to define a component, you'll need to import `Component` from `raxis`

```ts
import { Component } from 'raxis';
```

### Tag Components 

Components used as identifiers to categorize entities. Tag components hold no state.

```ts
export class Player extends Component {}
```

### Regular Components

Components that hold state.

```ts
export class Health extends Component {
    constructor(
        public value: number,
        public max: number
    ) {
        super();
    }
}

// Equivalent to:

export class Health extends Component {
    value: number;
    max: number;

    constructor(value: number, max: number) {
        super();

        this.value = value;
        this.max = max;
    }
}
```

**Example usage**

```ts
const health = new Health(100, 100);
```


### Components with optional default values

```ts
export class Health extends Component {
    constructor(
        public value: number,
        public max: number = 100
    ) {
        super();
    }
}
```

**Example usage**

```ts
const health = new Health(75);
```

## Registering Components

All components need to be registered before they can be used in your program. If you try to use an unregistered component, a runtime error will be emitted.

```ts
import { ECS } from 'raxis';

new ECS().addComponentType(Health);
```

There is also a plural method for registering multiple components at once

```ts
import { ECS } from 'raxis';

new ECS().addComponentTypes(Health, Player, ...);
```

Components can also be registered in plugins

```ts
import { ECS } from 'raxis';

export function HealthPlugin(ecs: ECS) {
    ecs.addComponentType(Health);
}
```
