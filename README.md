# svelte-headless-datatable

Headless (UI-less) datatable component for [Svelte](https://svelte.dev/).

## Motivation

Main goal for this library is to create fully featured datatable component, but without UI implementation. Component only consists of data and methods common to datatable. I hope, this could speed up develpment of datatable for someone, regardless of its design.

## Installation

With [npm](https://www.npmjs.com):

```sh
$ npm i svelte-headless-datatable
```

or with [yarn](https://yarnpkg.com):

```sh
$ yarn add svelte-headless-datatable
```

## Usage

```html
<script>
  import createDatatable from 'svelte-headless-datatable'
  
  const data = [
    {
      'id': '5e837815fcd5249efa8e4d85',
      'firstName': 'Castro',
      'lastName': 'Hewitt',
      'age': 30
    },
    ...
  ]

  const columns = ['ID', 'Name', 'Surname', 'Age']

  const datatable = createDatatable(data)
  const { items, page, pages } = datatable
</script>

<table>
  <thead>
    <tr>
      {#each columns as column}
        <td>{column}</td>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each $items as { id, firstName, lastName, age }}
      <tr>
        <td>{id}</td>
        <td>{firstName}</td>
        <td>{lastName}</td>
        <td>{age}</td>
      </tr>
    {/each}
  </tbody>
</table>

<div>
  <button
    disabled={!$page}
    on:click={() => page.set($page - 1)}
  >
    Prev
  </button>
  <button
    disabled={$page === $pages - 1}
    on:click={() => page.set($page + 1)}
  >
    Next
  </button>
  Page {$page + 1} of {$pages}
</div>
```

## Examples

- [Simple](https://codesandbox.io/s/simple-j22k2) - Simple example with pagination
- [Sorting](https://codesandbox.io/s/sorting-nfff0) - Example with sorting
- [Checking](https://codesandbox.io/s/checking-xzbcb) - Example with row checking
- [Opening/Selecting](https://codesandbox.io/s/openingselecting-lmdhf) - Example with row opening and selecting