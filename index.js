import { derived, get, writable } from 'svelte/store'
import multiColumnSort from 'multi-column-sort'

const defaultOptions = {
  openMultiple: false,
  selectMultiple: false,
  itemsPerPage: 10,
  getItems: (page, { data, itemsPerPage }) =>
    data.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
}

export default (initialData = [], options = {}) => {
  const {
    openMultiple,
    selectMultiple,
    itemsPerPage,
    getItems,
    getColumnValue
  } = {
    ...defaultOptions,
    ...options
  }

  const sort = writable([])
  const data = derived(
    sort,
    $sort => {
      if (!$sort.length) return initialData

      return multiColumnSort(initialData, $sort, getColumnValue)
    },
    initialData
  )
  const checked = writable([])
  const allChecked = derived(
    [checked, data],
    ([$checked, $data]) => $checked.length === $data.length
  )
  const opened = writable([])
  const selected = writable([])
  const loading = writable(options.getItems ? true : false)
  const page = writable(0)
  const pages = derived(data, $data => Math.ceil($data.length / itemsPerPage))
  const items = derived(
    [page, data],
    async ([$page, $data], set) => {
      loading.set(true)

      const result = await getItems($page, { data: $data, itemsPerPage })
      loading.set(false)
      set(result)
    },
    initialData
  )

  const checkAll = () =>
    checked.update(store => {
      const $data = get(data)

      if (store.length === $data.length) {
        return (store = [])
      } else {
        return (store = $data.map(({ id }) => id))
      }
    })

  const check = id =>
    checked.update(store => {
      const index = store.indexOf(id)

      if (index > -1) {
        return (store = [...store.slice(0, index), ...store.slice(index + 1)])
      } else {
        return (store = [...store, id])
      }
    })

  const openOrSelect = type => id => {
    const store = type === 'open' ? opened : selected

    store.update(store => {
      const index = store.indexOf(id)

      if (index > -1) {
        return (store = [...store.slice(0, index), ...store.slice(index + 1)])
      } else {
        if (type === 'open') {
          return (store = openMultiple ? [...store, id] : [id])
        } else return (store = selectMultiple ? [...store, id] : [id])
      }
    })
  }

  const setSort = column => ({ shiftKey } = {}) =>
    sort.update(store => {
      const index = store.findIndex(item => item.includes(column))
      const reverse =
        index > -1
          ? store[index].split('-')[1] === 'asc'
            ? 'desc'
            : 'asc'
          : null

      if (shiftKey) {
        if (index > -1) {
          return (store = [
            ...store.slice(0, index),
            `${column}-${reverse}`,
            ...store.slice(index + 1)
          ])
        } else return (store = [...store, `${column}-asc`])
      } else {
        if (store.length === 1 && !index) {
          return (store = [`${column}-${reverse}`])
        } else return (store = [`${column}-asc`])
      }
    })

  return {
    checked,
    allChecked,
    opened,
    check,
    checkAll,
    open: openOrSelect('open'),
    selected,
    select: openOrSelect('select'),
    loading,
    page,
    pages,
    items,
    sort,
    setSort
  }
}
