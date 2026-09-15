export type StudentStatus = '재학생' | '졸업생' | '수료생' | '휴학생';

export interface UserProfile {
  id: string;
  realName: string;
  studentId: string; // e.g. 2021140123
  university: string; // e.g. 고려대학교
  department: string; // e.g. 컴퓨터학과, 디자인조형학부
  matriculationYear: string; // e.g. 21학번
  status: StudentStatus;
  isVerified: boolean;
  avatarUrl: string;
  roleOrCompany?: string; // e.g. "토스 프로덕트 디자이너" or "캡스톤 디자인 수료"
  bio: string;
  links: {
    github?: string;
    linkedin?: string;
    behance?: string;
    website?: string;
    email: string;
  };
}

export interface PortfolioBlock {
  id: string;
  type: 'image' | 'text' | 'quote' | 'two_column' | 'divider' | 'video' | 'link';
  linkUrl?: string;
  videoUrl?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  title?: string;
  content?: string;
  imageUrl?: string;
  caption?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  subtitle: string;
  category: '디지털아트' | '시각·모션디자인' | '영화·방송영상' | '무대·공간예술' | '실용음악·음향' | '사진·순수미술' | 'UI/UX·소프트웨어';
  projectType: '졸업작품' | '캡스톤 디자인' | '산학협력 프로젝트' | '동아리/학회' | '개인 연구/사이드' | '공모전 수상작';
  coverImageUrl: string;
  author: UserProfile;
  createdAt: string;
  views: number;
  likes: number;
  likedByMe?: boolean;
  tags: string[];
  toolsUsed: string[];
  period: string; // e.g. 2024.03 - 2024.08
  periodRange?: { precision: 'month' | 'day'; start: string; end: string };
  actionLinks?: { id: string; label: string; url: string }[];
  teamInfo: string; // e.g. 개인 작업 (1인) or 3인 팀 (기획 및 디자인 리드)
  summary: string;
  blocks: PortfolioBlock[];
  links: {
    liveUrl?: string;
    githubUrl?: string;
    figmaUrl?: string;
    pdfUrl?: string;
    behanceUrl?: string;
  };
  comments: ProjectComment[];
  isPublished: boolean;
}

export interface ProjectComment {
  id: string;
  author: UserProfile;
  content: string;
  createdAt: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: '정규직 신입' | '인턴십' | '전환형 인턴' | '경력 이직' | '프로젝트 외주';
  category: string;
  postedByAlumni: {
    name: string;
    department: string;
    matriculationYear: string;
    currentPosition: string;
  };
  salaryInfo?: string;
  description: string;
  requirements: string[];
  preferredQualifications: string[];
  benefits: string[];
  deadline: string;
  isReferralAvailable: boolean; // 동문 선배 추천 채용 여부
  applicantsCount: number;
}

export interface ScoutOffer {
  id: string;
  sender: UserProfile;
  receiverStudentId: string;
  targetPortfolioId: string;
  targetPortfolioTitle: string;
  company: string;
  offerType: '정규직/신입 채용' | '인턴십 제안' | '커피챗 및 멘토링' | '프로젝트/산학 협력';
  message: string;
  contactEmail: string;
  sentAt: string;
  status: '대기중' | '수락' | '조율중';
}
