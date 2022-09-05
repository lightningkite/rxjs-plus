# RxJs Plus

A set of tools for working with RxJs and the DOM more conveniently.  Built to be extremely lightweight but still be a full equivalent to Android's [RxKotlin Plus](https://github.com/lightningkite/rxkotlin-plus).

## Contents

### Plus

Contains a bunch of direct extensions on Rx, including:

- `AnonymousSubject`, which allows you to construct a subject from a separate `Observer` and `Observable`
- `observerMap` and `observerMapMaybeWrite`, for mapping on the side of the `Observer`
- `mapReversible`, `mapSubject`, `mapSubjectMaybeWrite`, `mapSubjectWithExisting` for mapping whole subjects (useful for UI)
- Various other tools for manipulating `Subject`s.

### Binding

- `subscribeAutoDispose` operator, allowing for easy display the value of an `Observable` in a DOM element.  Automatically disposes when the DOM element is detached.
- `bind` operator, which creates a two-way binding between a `Subject` and various input elements.
- `showInX` operators, which render the contents of a changing list into a DOM element.

### Jsx Runtime

An optional package that allows you to use JSX to define views connected to Rx elements.

### Resources

Contains some tools for manipulating various resources across the board.

### Http

Some tools for making HTTP calls mirroring what RxKotlin Plus uses.  Also contains tools for parsing/serializing more complex elements rather than just JSON ones.

### View Generators

Tools for moving between various screens in a very simple way, based on the interface

```typescript
interface ViewGenerator {
    generate(dependency: Window): HTMLElement
}
```
