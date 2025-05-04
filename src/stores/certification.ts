// src/stores/certification.ts
import { defineStore } from 'pinia'
import api from '@/lib/api'

export const useCertificationStore = defineStore('cert', {
  state: () => ({
    certifications: [],
    selectedCert: {},
    examMeta: null,
  }),

  actions: {
    async fetchCertifications() {
      try {
        // 하드코딩된 자격증 목록
        const hardcodedExams = [
          { exam_code: 'realtor_1', exam_name: '공인중개사 1차' },
          { exam_code: 'realtor_2', exam_name: '공인중개사 2차' },
          // { exam_code: 'engineer_info', exam_name: '정보처리산업기사' },
          // { exam_code: 'csat', exam_name: '수능 기출문제' },
        ]
        console.log('✅ 자격증 목록 (하드코딩):', hardcodedExams)

        this.certifications = hardcodedExams
        if (!this.selectedCert.exam_code && hardcodedExams.length > 0) {
          this.selectedCert = hardcodedExams[0]
        }
      } catch (err) {
        // 이 블록은 사실상 필요 없음, 하지만 남겨둬도 무방
        console.error('❌ 자격증 목록 불러오기 실패 (하드코딩):', err)
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
