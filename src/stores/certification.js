// src/stores/certification.js
import { defineStore } from 'pinia'

export const useCertificationStore = defineStore('certification', {
  state: () => ({
    selectedCert: {
      id: '',
      name: '선택하세요',
    },
    certifications: [
      { id: '', name: '선택하세요' },
      { id: 'realtor', name: '공인중개사' },
      { id: 'it-industrial', name: '정보처리산업기사' },
      { id: 'it-engineer', name: '정보처리기사' },
    ]
   
  }),
  actions: {
    setCertification(cert) {
      this.selectedCert = cert
    }
  }
})
