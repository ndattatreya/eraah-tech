export interface Candidate {
  _id?: string
  name: string
  email: string
  phone?: string
  role: string
  experience: number
  status: "applied" | "interview" | "offer" | "rejected"
  resumeUrl?: string
  resumeFileName?: string
  appliedDate: Date
  lastUpdated: Date
  notes?: string
}

export interface Job {
  _id?: string
  title: string
  department: string
  location: string
  type: "full-time" | "part-time" | "contract" | "internship"
  description: string
  requirements: string[]
  isActive: boolean
  createdDate: Date
  applications: number
}

export interface User {
  _id?: string
  email: string
  name: string
  role: "admin" | "recruiter"
  createdDate: Date
}

export interface AuthUser extends User {
  password?: string
}

export interface Analytics {
  totalApplications: number
  applicationsByStatus: {
    applied: number
    interview: number
    offer: number
    rejected: number
  }
  applicationsByRole: { [key: string]: number }
  averageExperience: number
  recentApplications: Candidate[]
}
