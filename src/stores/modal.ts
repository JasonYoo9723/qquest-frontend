// src/stores/modal.ts
import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    isOpen: false,
    title: '',
    message: ''
  }),
  actions: {
    show(title: string, message: string) {
      this.title = title
      this.message = message
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    }
  }
})
