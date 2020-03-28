import { get } from 'svelte/store'
import waitForExpect from 'wait-for-expect'
import initDatatable from '.'
import { Datatable } from './types'
import data from './data.json'

describe('datatable', () => {
  interface Data {
    id: string
    name: string
  }

  let datatable: Datatable<Data>

  beforeEach(() => {
    datatable = initDatatable(data)
  })

  describe('checking', () => {
    it('checks/unchecks item', () => {
      const { checked, check } = datatable

      expect(get(checked)).toEqual([])

      check(data[0].id)
      check(data[1].id)
      expect(get(checked)).toEqual([data[0].id, data[1].id])

      check(data[0].id)
      expect(get(checked)).toEqual([data[1].id])
    })

    test('checkAll and allChecked', () => {
      const { checked, allChecked, checkAll } = datatable

      expect(get(allChecked)).toBe(false)

      checkAll()
      expect(get(allChecked)).toBe(true)
      expect(get(checked)).toEqual(data.map(({ id }) => id))

      checkAll()
      expect(get(allChecked)).toBe(false)
      expect(get(checked)).toEqual([])
    })
  })

  describe('opening', () => {
    it('opens/closes item', () => {
      const { opened, open } = datatable

      expect(get(opened)).toEqual([])

      open(data[0].id)
      expect(get(opened)).toEqual([data[0].id])

      open(data[0].id)
      expect(get(opened)).toEqual([])
    })

    it('opens only one item at once', () => {
      const { opened, open } = datatable

      expect(get(opened)).toEqual([])

      open(data[0].id)
      expect(get(opened)).toEqual([data[0].id])

      open(data[1].id)
      expect(get(opened)).toEqual([data[1].id])
    })

    describe('with openMultiple: true', () => {
      beforeEach(() => {
        datatable = initDatatable(data, { openMultiple: true })
      })

      it('can open multiple items at once', () => {
        const { opened, open } = datatable

        expect(get(opened)).toEqual([])

        open(data[0].id)
        expect(get(opened)).toEqual([data[0].id])

        open(data[1].id)
        expect(get(opened)).toEqual([data[0].id, data[1].id])
      })
    })
  })

  describe('selecting', () => {
    it('selects/deselects item', () => {
      const { selected, select } = datatable

      expect(get(selected)).toEqual([])

      select(data[0].id)
      expect(get(selected)).toEqual([data[0].id])

      select(data[0].id)
      expect(get(selected)).toEqual([])
    })

    it('selects only one item at once', () => {
      const { selected, select } = datatable

      expect(get(selected)).toEqual([])

      select(data[0].id)
      expect(get(selected)).toEqual([data[0].id])

      select(data[1].id)
      expect(get(selected)).toEqual([data[1].id])
    })

    describe('with selectMultiple: true', () => {
      beforeEach(() => {
        datatable = initDatatable(data, { selectMultiple: true })
      })

      it('can select multiple items at once', () => {
        const { selected, select } = datatable

        expect(get(selected)).toEqual([])

        select(data[0].id)
        expect(get(selected)).toEqual([data[0].id])

        select(data[1].id)
        expect(get(selected)).toEqual([data[0].id, data[1].id])
      })
    })
  })

  describe('pagination', () => {
    test('items store', async () => {
      const { page, items } = datatable

      expect(get(page)).toBe(0)
      await waitForExpect(() => {
        expect(get(items)).toEqual(data.slice(0, 10))
      })

      page.set(1)

      expect(get(page)).toBe(1)
      await waitForExpect(() => {
        expect(get(items)).toEqual(data.slice(10, 20))
      })
    })

    test('pages store', () => {
      const { pages } = datatable

      expect(get(pages)).toBe(2)
    })

    describe('with itemsPerPage set', () => {
      beforeEach(() => {
        datatable = initDatatable(data, { itemsPerPage: 7 })
      })

      test('items store', async () => {
        const { page, items } = datatable

        expect(get(page)).toBe(0)
        await waitForExpect(() => {
          expect(get(items)).toEqual(data.slice(0, 7))
        })

        page.set(1)

        expect(get(page)).toBe(1)
        await waitForExpect(() => {
          expect(get(items)).toEqual(data.slice(7, 14))
        })
      })

      test('pages store', () => {
        const { pages } = datatable

        expect(get(pages)).toBe(3)
      })
    })
  })

  describe('sorting', () => {
    interface Data {
      id: string
      firstName: string
      lastName: string
      balance: string
    }

    let datatable: Datatable<Data>
    const data: Data[] = [
      {
        id: '5e734a7a414a593f9089fea6',
        firstName: 'Bailey',
        lastName: 'Fuentes',
        balance: '$1,135.94'
      },
      {
        id: '5e734a7acbfc36f5f2435c26',
        firstName: 'Lorena',
        lastName: 'Carney',
        balance: '$2,472.92'
      },
      {
        id: '5e734a7af7b892bbd70f11ea',
        firstName: 'Bailey',
        lastName: 'Glover',
        balance: '$1,060.66'
      },
      {
        id: '5e734a7a697fca77b3dacd49',
        firstName: 'Karen',
        lastName: 'Wise',
        balance: '$3,749.56'
      }
    ]

    const getColumnValue = (column, value) => {
      switch (column) {
        case 'balance':
          return parseFloat(value.replace(/\,|\$/g, ''))
        default:
          return value
      }
    }

    beforeEach(() => {
      datatable = initDatatable(data, { getColumnValue })
    })

    it('sets sort to "column-asc" if no present', async () => {
      const { sort, setSort, items } = datatable

      expect(get(sort)).toEqual([])

      setSort('firstName')()
      expect(get(sort)).toEqual([['firstName', 'ASC']])
      await waitForExpect(() => {
        expect(get(items)).toEqual([data[0], data[2], data[3], data[1]])
      }, 1)
    })

    it('sets sort to reverse', async () => {
      const { sort, setSort, items } = datatable

      setSort('firstName')()
      setSort('firstName')()
      expect(get(sort)).toEqual([['firstName', 'DESC']])
      await waitForExpect(() => {
        expect(get(items)).toEqual([data[1], data[3], data[0], data[2]])
      }, 1)
    })

    describe('with shift', () => {
      it('sets multiple columns', async () => {
        const { sort, setSort, items } = datatable

        setSort('firstName')({ shiftKey: true })
        setSort('balance')({ shiftKey: true })
        expect(get(sort)).toEqual([
          ['firstName', 'ASC'],
          ['balance', 'ASC']
        ])
        await waitForExpect(() => {
          expect(get(items)).toEqual([data[2], data[0], data[3], data[1]])
        }, 1)
      })

      it('sets sort to reverse', async () => {
        const { sort, setSort, items } = datatable

        setSort('firstName')({ shiftKey: true })
        setSort('balance')({ shiftKey: true })
        setSort('balance')({ shiftKey: true })
        expect(get(sort)).toEqual([
          ['firstName', 'ASC'],
          ['balance', 'DESC']
        ])
        await waitForExpect(() => {
          expect(get(items)).toEqual([data[0], data[2], data[3], data[1]])
        }, 1)
      })

      it('sets to only one column if clicked without shift', async () => {
        const { sort, setSort, items } = datatable

        setSort('id')({ shiftKey: true })
        setSort('firstName')({ shiftKey: true })
        expect(get(sort)).toEqual([
          ['id', 'ASC'],
          ['firstName', 'ASC']
        ])

        setSort('firstName')()
        expect(get(sort)).toEqual([['firstName', 'ASC']])
        await waitForExpect(() => {
          expect(get(items)).toEqual([data[0], data[2], data[3], data[1]])
        }, 1)
      })
    })
  })

  describe('async', () => {
    const getData = ({ offset, limit }): Promise<Data[]> =>
      new Promise(resolve =>
        setTimeout(() => resolve(data.slice(offset, offset + limit)), 500)
      )

    beforeEach(() => {
      datatable = initDatatable(data, {
        itemsPerPage: 7,
        getItems: (page, { itemsPerPage }) =>
          getData({ offset: page * itemsPerPage, limit: itemsPerPage })
      })
    })

    it('loads items on page change', () => {
      const { page, items, loading } = datatable

      expect(get(page)).toBe(0)
      expect(get(loading)).toBe(true)

      setTimeout(() => {
        expect(get(loading)).toBe(false)
        expect(get(items)).toEqual(data.slice(0, 7))
      }, 501)

      page.set(1)

      expect(get(page)).toBe(1)
      setTimeout(() => {
        expect(get(loading)).toBe(true)
      }, 1)
      setTimeout(() => {
        expect(get(items)).toEqual(data.slice(7, 14))
      }, 501)
    })
  })
})
