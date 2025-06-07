import { defineStore } from 'pinia'
import api from '@/lib/api'

interface Subject {
  subject_code: string
  subject_name: string
  start_no?: number
}

interface ExamMetaMap {
  [exam_code: string]: {
    exam_name: string
    meta: {
      [year: string]: {
        [round: string]: {
          [session: string]: {
            [subject_code: string]: {
              subject_name: string
              start_no: number
            }
          }
        }
      }
    }
  }
}

export const useExamMetaStore = defineStore('examMetaStore', {
  state: () => ({
    examMetaMap: {} as ExamMetaMap
  }),

  actions: {
    async fetchMeta() {
      try {
        const res = await api.get('/exam-meta-map')
        this.examMetaMap = res.data.exam_meta_map || {}
      } catch (err) {
        console.error('❌ 메타 정보 로딩 실패:', err)
      }
    },

    getExamCodes() {
      return Object.entries(this.examMetaMap).map(([code, info]) => ({
        label: info.exam_name,
        value: code
      }))
    },

    getYears(exam_code: string): string[] {
      const meta = this.examMetaMap[exam_code]?.meta
      return meta ? Object.keys(meta).sort((a, b) => Number(b) - Number(a)) : []
    },

    getRounds(exam_code: string, year: string): string[] {
      const yearMeta = this.examMetaMap[exam_code]?.meta?.[year]
      return yearMeta ? Object.keys(yearMeta) : []
    },

    getSessions(exam_code: string, year: string, round: string): string[] {
      const roundMeta = this.examMetaMap[exam_code]?.meta?.[year]?.[round]
      return roundMeta ? Object.keys(roundMeta) : []
    },

    getSubjects(exam_code: string, year: string, round: string, session: string): Subject[] {
      const sessionMeta = this.examMetaMap[exam_code]?.meta?.[year]?.[round]?.[session]
      if (!sessionMeta) return []

      return Object.entries(sessionMeta).map(([subject_code, data]) => ({
        subject_code: data.subject_code,
        subject_name: data.subject_name,
        start_no: data.start_no
      }))
    },

    getStartNo(
      exam_code: string,
      year: string,
      round: string,
      session: string,
      subject_code: string
    ): number {
      const subjects =
        this.examMetaMap?.[exam_code]?.meta?.[year]?.[round]?.[session] || []

      const subject = subjects.find(s => s.subject_code === subject_code)

      return subject?.start_no || 1
    }
  }
})
