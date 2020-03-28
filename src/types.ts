import { Writable, Readable } from 'svelte/store'

/**
 * Interface data object should extend
 */
export interface D {
  id: string
}

/**
 * Store with checked item ids
 */
export type Checked<T extends D> = Writable<T['id'][]>

/**
 * Store with flag indicating all items are checked
 */
export type AllChecked = Readable<boolean>

/**
 * Method for checking/unchecking item
 * @param id id of item
 */
export type Check<T extends D> = (id: T['id']) => void

/**
 * Method for checking/unchecking all items
 */
export type CheckAll = () => void

/**
 * Store with opened item ids
 */
export type Opened<T extends D> = Writable<T['id'][]>

/**
 * Method for opening/closing item
 * @param id id of item
 */
export type Open<T extends D> = (id: T['id']) => void

/**
 * Store with selected item ids
 */
export type Selected<T extends D> = Writable<T['id'][]>

/**
 * Method for selecting/deselecting item
 * @param id id of item
 */
export type Select<T extends D> = (id: T['id']) => void

/**
 * Store with loading state
 */
export type Loading = Writable<boolean>

/**
 * Store with current page
 */
export type Page = Writable<number>

/**
 * Store with pages total count
 */
export type Pages = Readable<number>

/**
 * Store with items currently shown
 */
export type Items<T extends D> = Readable<T[]>

/**
 * Store with current sorting order
 */
export type Sort<T extends D> = Writable<[keyof T, 'ASC' | 'DESC'][]>

/**
 * Method for changing sort
 * @param column column
 * @returns Method to be executed with optional `MouseEvent` param
 *
 * Example:
 * ```svelte
 * <td on:click={setSort('city')}>City</td>
 * ```
 */
export type SetSort<T extends D> = (
  column: keyof T
) => ({ shiftKey }?: { shiftKey: MouseEvent['shiftKey'] }) => void

export interface Datatable<T extends D = D> {
  checked: Checked<T>
  allChecked: AllChecked
  check: Check<T>
  checkAll: CheckAll
  opened: Opened<T>
  open: Open<T>
  selected: Selected<T>
  select: Select<T>
  loading: Loading
  page: Page
  pages: Pages
  items: Items<T>
  sort: Sort<T>
  setSort: SetSort<T>
}

export interface GetItemsArgs<T> {
  data?: T[]
  itemsPerPage: number
}

/**
 * Method to get items for current page
 * @param page current page number
 * @param getItemArgs object: `GetItemArgs`
 */
export type GetItems<T> = (
  page: number,
  { data, itemsPerPage }: GetItemsArgs<T>
) => T[] | Promise<T[]>

/**
 * Method to get column value for comparison
 */
export type GetColumnValue<T> = (column: keyof T, value: T[keyof T]) => any

/**
 * Configuration options object
 */
export interface Options<T extends D> {
  openMultiple?: boolean
  selectMultiple?: boolean
  itemsPerPage?: number
  getItems?: GetItems<T>
  getColumnValue?: GetColumnValue<T>
}
