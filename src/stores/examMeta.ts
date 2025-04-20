import { defineStore } from 'pinia'
import api from '@/lib/api'

export const useExamMetaStore = defineStore('examMeta', {
        state: () => ({
          years: [],
          subjects: [],
          lastExamCode: ''
        }),
      
        actions: {
          async fetchMetadata(exam_code: string) {
            if (exam_code === this.lastExamCode) {
              return {
                years: this.years,
                subjects: this.subjects
              }
            }
      
            try {
              const res = await api.get('/exam-metadata', {
                params: { exam_code }
              })
              this.years = res.data.years
              this.subjects = res.data.subjects
              this.lastExamCode = exam_code
      
              return {
                years: this.years,
                subjects: this.subjects
              }
            } catch (err) {
              console.error('❌ exam 메타데이터 불러오기 실패:', err)
              return {
                years: [],
                subjects: []
              }
            }
          }
        }
      })