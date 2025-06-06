// src/stores/certification.ts
import { defineStore } from 'pinia'
import api from '@/lib/api'
import Cookies from 'js-cookie'

export const useCertificationStore = defineStore('cert', {
  state: () => ({
    certifications: [],
    selectedCert: {},
    examMeta: null,
  }),

  actions: {
    async fetchCertifications() {
      try {
        const hardcodedExams = [
          { exam_code: 'realtor_1', exam_name: '공인중개사 1차' },
          { exam_code: 'realtor_2', exam_name: '공인중개사 2차' },
        ]

        this.certifications = hardcodedExams

        // 🧠 쿠키에서 마지막 선택한 exam_code 가져오기
        const lastExamCode = Cookies.get('last_exam')

        // 🧠 쿠키값이 있고 그게 현재 목록에 있다면 그걸 selectedCert로 설정
        if (lastExamCode) {
          const found = hardcodedExams.find(e => e.exam_code === lastExamCode)
          if (found) {
            this.selectedCert = found
            return
          }
        }

        // 🧶 기본값 처리 (기존 로직)
        if (!this.selectedCert.exam_code && hardcodedExams.length > 0) {
          this.selectedCert = hardcodedExams[0]
        }
      } catch (err) {
        console.error('❌ 자격증 목록 불러오기 실패 (하드코딩):', err)
      }
    },

    setCertification(cert) {
      this.selectedCert = cert
      Cookies.set('last_exam', cert.exam_code, { expires: 7 }) // ✅ 선택 시 쿠키에 저장
    },

    setExamMeta(meta) {
      this.examMeta = meta
    },
  },
})
