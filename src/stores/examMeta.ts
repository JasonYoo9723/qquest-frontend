import { defineStore } from "pinia";
import api from "@/lib/api";

interface Subject {
  subject_code: string;
  subject_name: string;
  start_no?: number;
}

interface ExamMetaMap {
  [exam_code: string]: {
    exam_name: string;
    meta: {
      [year: string]: {
        [round: string]: {
          [session: string]: {
            [subject_code: string]: {
              subject_name: string;
              start_no: number;
            };
          };
        };
      };
    };
  };
}

export const useExamMetaStore = defineStore("examMetaStore", {
  state: () => ({
    examMetaMap: {} as ExamMetaMap,
  }),

  actions: {
    async fetchMeta() {
      try {
        const res = await api.get("/public/exam-meta/map");
        this.examMetaMap = res.data.exam_meta_map || {};
      } catch (err) {
        console.error("❌ 메타 정보 로딩 실패:", err);
      }
    },

    getExamCodes() {
      return Object.entries(this.examMetaMap).map(([code, info]) => ({
        label: info.exam_name,
        value: code,
      }));
    },

    getYears(exam_code: string): string[] {
      const meta = this.examMetaMap[exam_code]?.meta;
      return meta
        ? Object.keys(meta).sort((a, b) => Number(b) - Number(a))
        : [];
    },

    getRounds(exam_code: string, year: string): string[] {
      const yearMeta = this.examMetaMap[exam_code]?.meta?.[year];
      return yearMeta ? Object.keys(yearMeta) : [];
    },

    getSessions(exam_code: string, year: string, round: string): string[] {
      const roundMeta = this.examMetaMap[exam_code]?.meta?.[year]?.[round];
      return roundMeta ? Object.keys(roundMeta) : [];
    },

    getSubjects(
      exam_code: string,
      year: string,
      round: string,
      session: string
    ): Subject[] {
      const sessionMeta =
        this.examMetaMap[exam_code]?.meta?.[year]?.[round]?.[session];
      if (!sessionMeta) return [];

      return Object.entries(sessionMeta).map(([subject_code, data]) => ({
        subject_code: subject_code,
        subject_name: data.subject_name,
        start_no: data.start_no,
      }));
    },

    getStartNo(
      exam_code: string,
      year: string,
      round: string,
      session: string,
      subject_code: string
    ): number {
      const subjects =
        this.examMetaMap?.[exam_code]?.meta?.[year]?.[round]?.[session] || {};

      const subject = subjects[subject_code];
      return subject?.start_no || 1;
    },

    // ✅ 추가된 함수: 전체 과목 반환
    getAllSubjects(exam_code: string): Subject[] {
      const result: Subject[] = [];
      const seen = new Set<string>();

      const exam = this.examMetaMap[exam_code];
      if (!exam) return [];

      const meta = exam.meta;
      for (const year of Object.keys(meta)) {
        const yearMeta = meta[year];
        for (const round of Object.keys(yearMeta)) {
          const roundMeta = yearMeta[round];
          for (const session of Object.keys(roundMeta)) {
            const sessionMeta = roundMeta[session];
            for (const subject_code of Object.keys(sessionMeta)) {
              if (!seen.has(subject_code)) {
                seen.add(subject_code);
                const data = sessionMeta[subject_code];
                result.push({
                  subject_code,
                  subject_name: data.subject_name,
                  start_no: data.start_no,
                });
              }
            }
          }
        }
      }

      return result;
    },
  },
});
