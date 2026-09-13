export interface Education {
  id: number;
  school: string;
  degree: string;
  relevantCourses?: string[];
  achievements?: string[];
}

export interface Experience {
  id: number;
  company: string;
  team?: string;
  tags?: string[];
  role: string;
  duration: string;
  description?: string[];
  technologies?: string[];
}

export interface Project {
  id: number;
  name: string;
  summary?: string;
  tags?: string[];
  description?: string[];
  technologies?: string[];
  video?: string;
  github?: string;
  award?: string;
}

export interface Note {
  id: number;
  title: string;
  date: string;
  tags?: string[];
  body: string;
}

export interface TabConfig {
  id: string;
  label: string;
  bg: string;
  text: string;
}

export interface LoveItem {
  label: string;
  image: string;
}
