export interface CourseResource {
  name: string;
  url: string;
  type: "pdf" | "link" | "zip" | "doc";
  size?: string;
}

export interface CourseLesson {
  id: string;
  moduleIndex: number;
  lessonIndex: number;
  title: string;
  duration?: string;
  description?: string;
  bunnyVideoId: string;
  bunnyLibraryId?: string;
  videoUrl?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseBonusItem {
  id: string;
  title: string;
  badge: string;
  filename: string;
  downloadUrl: string;
  fileSize: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/* 📹 10 RECORDED COURSE LESSONS                                      */
/* ------------------------------------------------------------------ */
export const COURSE_MODULES: CourseModule[] = [
  {
    id: "course-videos",
    moduleNumber: 1,
    title: "AI Influencer Course",
    lessons: [
      {
        id: "v1",
        moduleIndex: 0,
        lessonIndex: 0,
        title: "Video 1",
        bunnyVideoId: "784d3a99-aba3-469c-bc12-c648d65749df",
        bunnyLibraryId: "765522",
      },
      {
        id: "v2",
        moduleIndex: 0,
        lessonIndex: 1,
        title: "Video 2",
        bunnyVideoId: "6f04feec-38fb-4a8b-94da-284c755ceb87",
        bunnyLibraryId: "765522",
      },
      {
        id: "v3",
        moduleIndex: 0,
        lessonIndex: 2,
        title: "Video 3",
        bunnyVideoId: "21490274-9ac6-4096-87c2-b8b9f779827b",
        bunnyLibraryId: "765522",
      },
      {
        id: "v4",
        moduleIndex: 0,
        lessonIndex: 3,
        title: "Video 4",
        bunnyVideoId: "508153e0-23cf-48aa-afc9-7660a33f6aa5",
        bunnyLibraryId: "765522",
      },
      {
        id: "v5",
        moduleIndex: 0,
        lessonIndex: 4,
        title: "Video 5",
        bunnyVideoId: "5f53fca8-92ba-4bb7-9740-f7757bb4026d",
        bunnyLibraryId: "765522",
      },
      {
        id: "v6",
        moduleIndex: 0,
        lessonIndex: 5,
        title: "Video 6",
        bunnyVideoId: "1ed559dc-83c2-45a5-9f5e-1f6cf5f5c04d",
        bunnyLibraryId: "765522",
      },
      {
        id: "v7",
        moduleIndex: 0,
        lessonIndex: 6,
        title: "Video 7",
        bunnyVideoId: "ca752423-be2d-4bb2-a910-2eeea5245b30",
        bunnyLibraryId: "765522",
      },
      {
        id: "v8",
        moduleIndex: 0,
        lessonIndex: 7,
        title: "Video 8",
        bunnyVideoId: "7f0a49a3-29e3-4a0d-8c29-cc23ae151816",
        bunnyLibraryId: "765522",
      },
      {
        id: "v9",
        moduleIndex: 0,
        lessonIndex: 8,
        title: "Video 9",
        bunnyVideoId: "3b8fe9e2-5a5c-440a-8527-e13093e9636e",
        bunnyLibraryId: "765522",
      },
      {
        id: "v10",
        moduleIndex: 0,
        lessonIndex: 9,
        title: "Video 10",
        bunnyVideoId: "4fe5cf13-78b0-4bd8-933f-33835521b9bb",
        bunnyLibraryId: "765522",
      },
    ],
  },
];

export const TOTAL_LESSONS_COUNT = COURSE_MODULES.reduce(
  (acc, m) => acc + m.lessons.length,
  0
);

/* ------------------------------------------------------------------ */
/* 🎁 OFFICIAL DOWNLOADABLE PDF BONUSES                               */
/* ------------------------------------------------------------------ */
export const OFFICIAL_COURSE_BONUSES: CourseBonusItem[] = [
  {
    id: "bonus-300-prompts",
    title: "Kruti Sharma - 300 Hot + Bold Photorealistic AI Image Prompts",
    badge: "300 PROMPTS VAULT",
    filename: "Kruti_Sharma_300_Prompts_Library.pdf",
    downloadUrl: "/downloads/Kruti_Sharma_300_Prompts_Library.pdf",
    fileSize: "534 KB",
    description: "Official prompt library featuring 300 categorized prompt recipes for photorealistic AI influencers.",
  },
  {
    id: "bonus-page-references",
    title: "AI Influencer Page References",
    badge: "REFERENCE PAGES",
    filename: "AI_Influencer_Page_References.pdf",
    downloadUrl: "/downloads/AI_Influencer_Page_References.pdf",
    fileSize: "30 KB",
    description: "Curated reference Instagram creator pages to study viral positioning, aesthetics, and monetization.",
  },
  {
    id: "bonus-8-consistency-prompts",
    title: "8 Full Character Consistency Prompts",
    badge: "CONSISTENCY FORMULA",
    filename: "8_Character_Consistency_Prompts.pdf",
    downloadUrl: "/downloads/8_Character_Consistency_Prompts.pdf",
    fileSize: "37 KB",
    description: "Step-by-step master sequence for generating consistent character poses across camera angles.",
  },
];
