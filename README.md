# React Install Render

The simplest way to test a react component library.

Running `react-install-render package-name` or `react-install-render path/to/package` will perform the following steps:

- Install the package in a temporary directory
- Render the component

## CLI Usage

```bash
# react-install-render <package-name-or-path-to-package> <props-as-json>
react-install-render package-name --props '{ "someProp": "hello world!" }'
```

## Library Usage

```javascript
const rir = require("react-install-render")

rir("path/to/package") // or "package-name"
  .then(() => {
    console.log("Success")
  })
  .catch(e => {
    console.log(`Failed to install and render: ${e.toString()}`)
  })
```

## Motivation

While maintaining the [Universal Data Tool](https://github.com/UniversalDataTool/universal-data-tool) we found that developers would sometimes introduce dependencies that would break the installation process of the react application. This module helps prevent that, by introducing a simple way to test the installation and rendering of a component.

React Install Render tests the actual installation of the package, which is not
done in most (all?) other react testing modules.
