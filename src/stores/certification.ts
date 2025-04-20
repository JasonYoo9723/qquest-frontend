// src/stores/certification.ts
import { defineStore } from 'pinia'
import api from '@/lib/api'

export const useCertificationStore = defineStore('cert', {
  state: () => ({
    certifications: [],
    selectedCert: {},
  }),

  actions: {
    async fetchCertifications() {
      try {
        const res = await api.get('/exams')
        console.log('✅ 자격증 목록 가져옴:', res.data.exams)
        this.certifications = res.data.exams
        if (!this.selectedCert.exam_code && res.data.exams.length > 0) {
          this.selectedCert = res.data.exams[0] // 기본값 설정
        }
      } catch (err) {
        console.error('❌ 자격증 목록 불러오기 실패:', err)
      }
    },
    setCertification(cert) {
      this.selectedCert = cert
    },
    setExamMeta(meta) {
      this.examMeta = meta
    },
  },
})
