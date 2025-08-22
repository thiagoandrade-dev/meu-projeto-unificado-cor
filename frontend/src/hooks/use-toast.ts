import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    console.log('🔄 Toast já na fila de remoção:', toastId)
    return
  }

  console.log('⏰ Criando timeout para toast:', toastId, 'delay:', TOAST_REMOVE_DELAY)
  const timeout = setTimeout(() => {
    console.log('🗑️ Removendo toast por timeout:', toastId)
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
  console.log('📊 Total de timeouts ativos:', toastTimeouts.size)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        // Limpar timeout existente antes de adicionar à fila de remoção
         const existingTimeout = toastTimeouts.get(toastId)
         if (existingTimeout) {
           console.log('🧹 Limpando timeout existente para toast:', toastId)
           clearTimeout(existingTimeout)
           toastTimeouts.delete(toastId)
           console.log('📊 Total de timeouts após limpeza:', toastTimeouts.size)
         }
        addToRemoveQueue(toastId)
      } else {
        // Limpar todos os timeouts existentes antes de adicionar à fila de remoção
          state.toasts.forEach((toast) => {
           const existingTimeout = toastTimeouts.get(toast.id)
           if (existingTimeout) {
             console.log('🧹 Limpando timeout existente para toast:', toast.id)
             clearTimeout(existingTimeout)
             toastTimeouts.delete(toast.id)
           }
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST": {
      if (action.toastId === undefined) {
        // Limpar todos os timeouts quando removendo todos os toasts
         console.log('🧹 Limpando todos os timeouts. Total:', toastTimeouts.size)
         toastTimeouts.forEach((timeout) => {
           clearTimeout(timeout)
         })
         toastTimeouts.clear()
         console.log('✅ Todos os timeouts limpos')
        return {
          ...state,
          toasts: [],
        }
      }
      // Limpar o timeout específico do toast sendo removido
       const timeout = toastTimeouts.get(action.toastId)
       if (timeout) {
         console.log('🧹 Limpando timeout para toast removido:', action.toastId)
         clearTimeout(timeout)
         toastTimeouts.delete(action.toastId)
         console.log('📊 Total de timeouts após remoção:', toastTimeouts.size)
       }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
