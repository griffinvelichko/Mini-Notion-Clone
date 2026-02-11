import { useReducer, useCallback } from 'react'
import { Block } from './types'

export interface PageSnapshot {
  title: string
  blocks: Block[]
}

interface UndoRedoState {
  past: PageSnapshot[]
  present: PageSnapshot
  future: PageSnapshot[]
  revision: number
}

type Action =
  | { type: 'INIT'; snapshot: PageSnapshot }
  | { type: 'SET_PRESENT'; snapshot: PageSnapshot }
  | { type: 'UNDO' }
  | { type: 'REDO' }

const MAX_HISTORY = 100

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function reducer(state: UndoRedoState, action: Action): UndoRedoState {
  switch (action.type) {
    case 'INIT':
      return {
        past: [],
        present: clone(action.snapshot),
        future: [],
        revision: state.revision + 1,
      }

    case 'SET_PRESENT': {
      const past = [...state.past, clone(state.present)]
      if (past.length > MAX_HISTORY) past.shift()
      return {
        past,
        present: clone(action.snapshot),
        future: [],
        revision: state.revision,
      }
    }

    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [clone(state.present), ...state.future],
        revision: state.revision + 1,
      }
    }

    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        past: [...state.past, clone(state.present)],
        present: next,
        future: state.future.slice(1),
        revision: state.revision + 1,
      }
    }

    default:
      return state
  }
}

const initialState: UndoRedoState = {
  past: [],
  present: { title: '', blocks: [] },
  future: [],
  revision: 0,
}

export function useUndoRedo() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const init = useCallback((snapshot: PageSnapshot) => {
    dispatch({ type: 'INIT', snapshot })
  }, [])

  const pushState = useCallback((snapshot: PageSnapshot) => {
    dispatch({ type: 'SET_PRESENT', snapshot })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])

  return {
    present: state.present,
    revision: state.revision,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    init,
    pushState,
    undo,
    redo,
  }
}
