// src/stores/examMeta.ts
import { defineStore } from 'pinia'
import api from '@/lib/api'

export const useExamMetaStore = defineStore('examMeta', {
  state: () => ({
    years: [] as number[],
    subjects: [] as {
      subject_code: string
      subject_name: string
      session?: string | number
    }[],
    sessions: [] as string[], // ✅ 교시 목록
    lastExamCode: '',
    lastSession: null as number | null,
  }),

  actions: {
    async fetchMetadata(exam_code: string, session?: number, force: boolean = false) {
      // ✅ 캐시된 조합이라면 그대로 반환
      if (
        !force &&
        exam_code === this.lastExamCode &&
        (session ?? null) === this.lastSession
      ) {
        return {
          years: this.years,
          subjects: this.subjects,
          sessions: this.sessions,
        }
      }

      try {
        const params: Record<string, any> = { exam_code }
        if (session !== undefined) {
          params.session = session
        }

        const res = await api.get('/exam-metadata', { params })

        this.years = res.data.years || []
        this.subjects = res.data.subjects || []
        this.sessions = Array.isArray(res.data.sessions)
          ? res.data.sessions.map(s => String(s))
          : []

        this.lastExamCode = exam_code
        this.lastSession = session ?? null

        return {
          years: this.years,
          subjects: this.subjects,
          sessions: this.sessions,
        }
      } catch (err) {
        console.error('❌ exam 메타데이터 불러오기 실패:', err)
        return {
          years: [],
          subjects: [],
          sessions: []
        }
      }
    },
  },
})
