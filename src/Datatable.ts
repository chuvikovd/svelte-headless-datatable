import { derived, get, writable } from 'svelte/store'
import multiColumnSort from 'multi-column-sort'
import { D, Datatable, Options } from './types'

const getDefaultOptions = <T extends D>(): Options<T> => ({
  openMultiple: false,
  selectMultiple: false,
  itemsPerPage: 10,
  getItems: (page, { data, itemsPerPage }) =>
    data.slice(page * itemsPerPage, (page + 1) * itemsPerPage)
})

export default <T extends D = D>(
  initialData: T[] = [],
  options: Options<T> = {}
): Datatable<T> => {
  const {
    openMultiple,
    selectMultiple,
    itemsPerPage,
    getItems,
    getColumnValue
  } = {
    ...(<T>getDefaultOptions()),
    ...options
  }

  const sort = writable<[keyof T, 'ASC' | 'DESC'][]>([])
  const data = derived(
    sort,
    ($sort, set) => {
      if (!$sort.length) return set(initialData)

      set(multiColumnSort(initialData, $sort, getColumnValue))
    },
    initialData
  )
  const checked = writable<string[]>([])
  const allChecked = derived(
    [checked, data],
    ([$checked, $data]) => $checked.length === $data.length
  )
  const opened = writable<string[]>([])
  const selected = writable<string[]>([])
  const loading = writable(options.getItems ? true : false)
  const page = writable(0)
  const pages = derived(data, $data => Math.ceil($data.length / itemsPerPage))
  const items = derived(
    [page, data],
    (async ([$page, $data], set) => {
      loading.set(true)

      const result = await getItems($page, { data: $data, itemsPerPage })
      loading.set(false)
      set(result as T[])
    }) as any,
    initialData
  )

  const checkAll = () =>
    checked.update(store => {
      const $data: T[] = get(data)

      if (store.length === $data.length) {
        return (store = [])
      } else {
        return (store = $data.map(({ id }) => id))
      }
    })

  const check = (id: T['id']) =>
    checked.update(store => {
      const index = store.indexOf(id)

      if (index > -1) {
        return (store = [...store.slice(0, index), ...store.slice(index + 1)])
      } else {
        return (store = [...store, id])
      }
    })

  const openOrSelect = (type: 'open' | 'select') => (id: T['id']) => {
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

  const setSort = (column: keyof T) => ({
    shiftKey
  }: { shiftKey?: MouseEvent['shiftKey'] } = {}) =>
    sort.update(store => {
      const index = store.findIndex(item => item[0] === column)
      const reverse =
        index > -1 ? (store[index][1] === 'ASC' ? 'DESC' : 'ASC') : null

      if (shiftKey) {
        if (index > -1) {
          return (store = [
            ...store.slice(0, index),
            [column, reverse],
            ...store.slice(index + 1)
          ])
        } else return (store = [...store, [column, 'ASC']])
      } else {
        if (store.length === 1 && !index) {
          return (store = [[column, reverse]])
        } else return (store = [[column, 'ASC']])
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
