import { Writable, Readable } from 'svelte/store'
import { SortArray, GetColumnValue } from 'multi-column-sort'

/**
 * Interface data object should extend
 */
export interface TDefaultData {
  id: string
}

export interface Datatable<TData extends TDefaultData = TDefaultData> {
  /**
   * Store with checked item ids
   */
  checked: Writable<TData['id'][]>
  /**
   * Store with flag indicating all items are checked
   */
  allChecked: Readable<boolean>
  /**
   * Method for checking/unchecking item
   * @param id id of item
   */
  check: (id: TData['id']) => void
  /**
   * Method for checking/unchecking all items
   */
  checkAll: () => void
  /**
   * Store with opened item ids
   */
  opened: Writable<TData['id'][]>
  /**
   * Method for opening/closing item
   * @param id id of item
   */
  open: (id: TData['id']) => void
  /**
   * Store with selected item ids
   */
  selected: Writable<TData['id'][]>
  /**
   * Method for selecting/deselecting item
   * @param id id of item
   */
  select: (id: TData['id']) => void
  /**
   * Store with loading state
   */
  loading: Writable<boolean>
  /**
   * Store with current page
   */
  page: Writable<number>
  /**
   * Store with pages total count
   */
  pages: Readable<number>
  /**
   * Store with items currently shown
   */
  items: Readable<TData[]>
  /**
   * Store with current sorting order.
   * See https://github.com/chuvikovd/multi-column-sort
   */
  sort: Writable<SortArray<TData>>
  /**
   * Method for changing sort
   * @param column column
   * @returns Method to be executed with optional `MouseEvent` param
   *
   * Example:
   * ```html
   * <td on:click={setSort('city')}>City</td>
   * ```
   */
  setSort: (
    column: keyof TData
  ) => ({ shiftKey }?: { shiftKey: MouseEvent['shiftKey'] }) => void
}

export interface GetItemsArgs<TData> {
  page: number
  itemsPerPage: number
  sort: SortArray<TData>
  data?: TData[]
}

export interface GetItemsReturnType<TData> {
  totalPages: number
  items: TData[]
}

/**
 * Method to get items for current page
 * @param page current page number
 * @param getItemArgs object: `GetItemArgs`
 */
export type GetItems<TData> = (
  args: GetItemsArgs<TData>
) => GetItemsReturnType<TData> | Promise<GetItemsReturnType<TData>>

/**
 * Configuration options object
 */
export interface Options<TData extends TDefaultData> {
  /**
   * Allow open multiple items
   */
  openMultiple?: boolean
  /**
   * Allow select multple items
   */
  selectMultiple?: boolean
  /**
   * Item per page count
   */
  itemsPerPage?: number
  /**
   * Method to get current page items. Can be async.
   */
  getItems?: GetItems<TData>
  /**
   * Reset checked, opened, selected on page change.
   */
  resetOnPageChange?: ('checked' | 'opened' | 'selected')[]
  /**
   * Method for retrieving column value for comparison.
   * See https://github.com/chuvikovd/multi-column-sort
   */
  getColumnValue?: GetColumnValue<TData>
}
