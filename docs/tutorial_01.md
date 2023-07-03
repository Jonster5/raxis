# Tutorial 01: Making Components

In an Entity Component System framework, 'components' are how the application's state is stored.
Components ideally should contain no functionality on their own, however the Raxis engine makes a few exceptions to that rule which will be explored later.

## Component Types vs Components

A component type is really just the class constructor of any given component, while a component is an instance of a component class

## Making components

All ECS components must extends the [Component](./docs.md#component) class. The most simple form of a component is one that holds no state.
These are called `tags` because they merely serve as an identifier for the entity they are associated with.

```ts
class MyTag extends Component {}
```

To make a component that holds data, the most concise way to go about that is as follows

```ts
class MyComp extends Component {
    foo: number = 25
    bar: string = 'jerry'
}
```

Then when you instantiate that component, it will have those properties already defaulted to the preset values. 

```ts
const nav = new MyComp();
// nav.foo === 25
// nav.bar === 'jerry'
```

However if you intend for your component's values to be determined when you instantiate it, the least painful way to do that is like this

```ts
class MyComp extends Component {
    // the 'public' keyword will set the argument in the constructor as a property on the class
    constructor(public foo: number, public bar: string) {
        super(); // This cumbersome 'super' call has to be there unfortunately
    }
}

const nav = new MyComp(50, 'Arnav');
// nav.foo === 50
// nav.bar === 'Arnav'
```

You can, of course, still give default values using this method

```ts
class MyComp extends Component {
    // the 'public' keyword will set the argument in the constructor as a property on the class
    constructor(public foo: number = 40, public bar: string = 'Chuckles') {
        super(); // Unfortunately there is no way around this cumbersome 'super' call
    }
}

const nav = new MyComp(10);
// nav.foo === 10
// nav.bar === 'Chuckles'
```

## Predefined Component Methods

The only functionality components will have are specific methods defined by the `Component` class.

[Component.prototype.getName()](./docs.md#getname) returns a string containing the name of a component. This is primarily used internally and should not be overridden.

```ts
class Arnav extends Component { ... }

const nav = new Arnav( ... );

nav.getName() // Returns "Arnav"

```

[Component.prototype.getType()](./docs.md#gettype) returns the class constructor used to create the component instance. This is also used primarily internally and should not be overridden.

```ts
class Arnav extends Component { ... }

const nav = new Arnav( ... );

nav.getType() // Returns CompType<Arnav>

```

[Component.prototype.clone()](./docs.md#clone) returns a deep copy of the component instance. This method uses [structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) to copy the component. This function can overridden if that behavior isn't desirable for your component's needs

```ts
class Arnav extends Component { ... }

const originav = new Arnav( ... );

const rnav = originav.clone();

// originav !== rnav
// but 
// originav['someproperty'] === rnav['someproperty']
```

## Optional Component Methods

These are methods that can provide additional functionality to a component