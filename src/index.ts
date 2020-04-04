import { derived, get, writable } from 'svelte/store'
import multiColumnSort, { SortArray } from 'multi-column-sort'
import { TDefaultData, Datatable, Options } from './types'

/**
 * @hidden
 */
const getDefaultOptions = <TData extends TDefaultData>(): Options<TData> => ({
  openMultiple: false,
  selectMultiple: false,
  itemsPerPage: 10,
  resetOnPageChange: [],
  getItems: ({ data, page, itemsPerPage }) => ({
    items: data.slice(page * itemsPerPage, (page + 1) * itemsPerPage),
    totalPages: Math.ceil(data.length / itemsPerPage)
  })
})

/**
 * Initialize datatable
 * @param data pass [] if async
 * @param options configuration object
 */
export default function createDatatable<
  TData extends TDefaultData = TDefaultData
> (data: TData[], options: Options<TData> = {}): Datatable<TData> {
  const {
    openMultiple,
    selectMultiple,
    itemsPerPage,
    resetOnPageChange,
    getItems,
    getColumnValue
  } = {
    ...(<TData>getDefaultOptions()),
    ...options
  }

  const sort = writable<[keyof TData, 'ASC' | 'DESC'][]>([])
  const checked = writable<string[]>([])
  const allChecked = derived(
    checked,
    $checked => $checked.length === data.length
  )
  const opened = writable<string[]>([])
  const selected = writable<string[]>([])
  const loading = writable(false)
  const page = writable(0)
  const pages = writable(Math.ceil(data.length / itemsPerPage))
  const items = derived(
    [page, sort],
    ([$page, $sort], set) => {
      const sorted = sortData(data, $sort)
      const maybePromise = getItems({
        page: $page,
        itemsPerPage,
        sort: $sort,
        data: sorted
      })

      if (maybePromise instanceof Promise) {
        loading.set(true)
        maybePromise.then(({ totalPages, items }) => {
          loading.set(false)
          set(items)
          pages.set(totalPages)
        })
      } else {
        const { totalPages, items } = maybePromise
        set(items)
        pages.set(totalPages)
      }
    },
    []
  )

  const checkAll = () =>
    checked.update(store => {
      if (store.length === data.length) {
        return (store = [])
      } else {
        return (store = data.map(({ id }) => id))
      }
    })

  const check = (id: TData['id']) =>
    checked.update(store => {
      const index = store.indexOf(id)

      if (index > -1) {
        return (store = [...store.slice(0, index), ...store.slice(index + 1)])
      } else {
        return (store = [...store, id])
      }
    })

  const openOrSelect = (type: 'open' | 'select') => (id: TData['id']) => {
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

  const setSort = (column: keyof TData) => ({
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

  const setPage = (newPage: number) => {
    if (resetOnPageChange.includes('checked')) checked.set([])
    if (resetOnPageChange.includes('opened')) opened.set([])
    if (resetOnPageChange.includes('selected')) selected.set([])

    if (newPage < 0 || newPage > get(pages) - 1) return

    page.set(newPage)
  }

  const sortData = (data: TData[], sort: SortArray<TData>) => {
    if (!sort.length) return data

    return multiColumnSort(data, sort, getColumnValue)
  }

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
    page: {
      ...page,
      set: setPage
    },
    pages,
    items,
    sort,
    setSort
  }
}
