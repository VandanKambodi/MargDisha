import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const SAVED_API = "http://localhost:5000/api/saved";

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    stream: searchParams.get("stream") || "",
    degree: "",
  });
  const [savedCourseIds, setSavedCourseIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const COURSES_PER_PAGE = 10;

  const sampleCourses = [
    // ─── ENGINEERING ────────────────────────────────────────────────
    {
      _id: "1",
      name: "Bachelor of Technology in Computer Science",
      code: "B.Tech CSE",
      stream: "engineering",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "India's most sought-after engineering programme covering programming, algorithms, databases, AI/ML, cybersecurity and software engineering. Graduates power the IT industry and startups.",
      eligibility: {
        minimumMarks: 75,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "JEE Main / JEE Advanced / State CETs",
      },
      careerPaths: [
        {
          jobTitle: "Software Developer",
          industry: "IT & Software",
          averageSalary: { min: 600000, max: 2500000 },
          description: "Design, develop and maintain software applications",
        },
        {
          jobTitle: "Data Scientist",
          industry: "AI & Analytics",
          averageSalary: { min: 800000, max: 3000000 },
          description:
            "Extract insights from large datasets using ML & statistics",
        },
        {
          jobTitle: "Cloud / DevOps Engineer",
          industry: "Cloud Computing",
          averageSalary: { min: 700000, max: 2200000 },
          description:
            "Manage cloud infrastructure, CI/CD pipelines and automation",
        },
        {
          jobTitle: "Cybersecurity Analyst",
          industry: "Information Security",
          averageSalary: { min: 600000, max: 2000000 },
          description: "Protect systems and networks from cyber threats",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Tech in Computer Science",
          degree: "master",
          description: "Specialize in AI, systems or security",
        },
        {
          courseName: "MBA in IT Management",
          degree: "master",
          description: "Blend tech with business leadership",
        },
        {
          courseName: "MS in CS (abroad)",
          degree: "master",
          description: "Research-focused master's at global universities",
        },
      ],
      governmentExams: [
        {
          examName: "GATE CS",
          description: "For M.Tech admissions & PSU recruitment",
          eligibility: "B.Tech CSE",
        },
        {
          examName: "SSC CGL",
          description: "Group B & C government posts",
          eligibility: "Graduate",
        },
        {
          examName: "ISRO Scientist/Engineer",
          description: "Scientist posts in Indian Space Research Organisation",
          eligibility: "B.Tech",
        },
      ],
      skills: [
        "Data Structures & Algorithms",
        "Python / Java / C++",
        "Machine Learning",
        "System Design",
        "Database Management",
        "Web Development",
      ],
      subjects: [
        "Data Structures",
        "Operating Systems",
        "Computer Networks",
        "Database Management Systems",
        "Artificial Intelligence",
        "Software Engineering",
        "Compiler Design",
        "Theory of Computation",
      ],
    },
    {
      _id: "2",
      name: "Bachelor of Technology in Mechanical Engineering",
      code: "B.Tech ME",
      stream: "engineering",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Core engineering discipline covering thermodynamics, manufacturing, robotics and automobile engineering. Opens doors to manufacturing, defence and automotive sectors.",
      eligibility: {
        minimumMarks: 70,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "JEE Main / State CETs",
      },
      careerPaths: [
        {
          jobTitle: "Mechanical Design Engineer",
          industry: "Manufacturing",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Design and develop mechanical systems and components",
        },
        {
          jobTitle: "Automobile Engineer",
          industry: "Automotive",
          averageSalary: { min: 500000, max: 1500000 },
          description: "Design and test vehicles and their subsystems",
        },
        {
          jobTitle: "Production Manager",
          industry: "Manufacturing",
          averageSalary: { min: 600000, max: 1800000 },
          description: "Oversee manufacturing processes and quality control",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Tech in Thermal / Design / Manufacturing",
          degree: "master",
          description: "Advanced specialization in mechanical sub-domains",
        },
        {
          courseName: "MBA",
          degree: "master",
          description: "Transition into management roles",
        },
      ],
      governmentExams: [
        {
          examName: "GATE ME",
          description: "For M.Tech & PSU jobs (BHEL, ONGC, IOCL)",
          eligibility: "B.Tech ME",
        },
        {
          examName: "Indian Engineering Services (IES)",
          description: "Class-I government engineering posts",
          eligibility: "B.Tech",
        },
      ],
      skills: [
        "AutoCAD / SolidWorks",
        "Thermodynamics",
        "Manufacturing Processes",
        "Robotics",
        "FEA / CFD Analysis",
        "Project Management",
      ],
      subjects: [
        "Thermodynamics",
        "Fluid Mechanics",
        "Strength of Materials",
        "Manufacturing Technology",
        "Machine Design",
        "Robotics & Automation",
        "Heat Transfer",
        "IC Engines",
      ],
    },
    {
      _id: "3",
      name: "Bachelor of Technology in Electrical Engineering",
      code: "B.Tech EE",
      stream: "engineering",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Study of power systems, electrical machines, control systems and electronics. Critical for India's power sector, renewable energy and PSU recruitment.",
      eligibility: {
        minimumMarks: 70,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "JEE Main / State CETs",
      },
      careerPaths: [
        {
          jobTitle: "Power Systems Engineer",
          industry: "Energy & Power",
          averageSalary: { min: 500000, max: 1400000 },
          description:
            "Design and maintain electrical power generation and distribution systems",
        },
        {
          jobTitle: "Embedded Systems Engineer",
          industry: "Electronics",
          averageSalary: { min: 500000, max: 1500000 },
          description: "Develop firmware and hardware for embedded devices",
        },
        {
          jobTitle: "Electrical Design Engineer",
          industry: "Infrastructure",
          averageSalary: { min: 450000, max: 1200000 },
          description:
            "Design electrical systems for buildings and industrial plants",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Tech in Power Systems / Control",
          degree: "master",
          description: "Advanced study in power or control engineering",
        },
        {
          courseName: "MS in Electrical Engineering (abroad)",
          degree: "master",
          description: "Research-intensive master's programme",
        },
      ],
      governmentExams: [
        {
          examName: "GATE EE",
          description: "For M.Tech & PSU jobs (NTPC, Power Grid, BHEL)",
          eligibility: "B.Tech EE",
        },
        {
          examName: "IES (Electrical)",
          description: "Engineering Services Exam for Class-I posts",
          eligibility: "B.Tech EE",
        },
      ],
      skills: [
        "Circuit Analysis",
        "MATLAB / Simulink",
        "Power Electronics",
        "PLC / SCADA",
        "Control Systems",
        "Renewable Energy Tech",
      ],
      subjects: [
        "Electrical Machines",
        "Power Systems",
        "Control Systems",
        "Power Electronics",
        "Analog & Digital Electronics",
        "Signal Processing",
        "Electromagnetic Theory",
        "Electrical Measurements",
      ],
    },
    {
      _id: "4",
      name: "Bachelor of Technology in Civil Engineering",
      code: "B.Tech CE",
      stream: "engineering",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Foundation of infrastructure development covering structural analysis, geotechnical engineering, transportation and environmental engineering. Essential for India's Smart Cities & highway projects.",
      eligibility: {
        minimumMarks: 65,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "JEE Main / State CETs",
      },
      careerPaths: [
        {
          jobTitle: "Structural Engineer",
          industry: "Construction",
          averageSalary: { min: 450000, max: 1400000 },
          description:
            "Design and analyze structures for buildings and bridges",
        },
        {
          jobTitle: "Site Engineer",
          industry: "Infrastructure",
          averageSalary: { min: 350000, max: 900000 },
          description: "Supervise construction activities on site",
        },
        {
          jobTitle: "Urban Planner",
          industry: "Government / Smart Cities",
          averageSalary: { min: 500000, max: 1200000 },
          description: "Plan and design urban spaces and infrastructure",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Tech in Structural / Geotechnical / Transportation",
          degree: "master",
          description: "Specialized civil engineering study",
        },
        {
          courseName: "M.Plan (Urban Planning)",
          degree: "master",
          description: "Masters in urban and regional planning",
        },
      ],
      governmentExams: [
        {
          examName: "GATE CE",
          description: "For M.Tech & PSU recruitment",
          eligibility: "B.Tech CE",
        },
        {
          examName: "IES (Civil)",
          description: "Class-I engineering services",
          eligibility: "B.Tech CE",
        },
        {
          examName: "State PWD / CPWD Exams",
          description: "Public works department recruitment",
          eligibility: "B.Tech CE",
        },
      ],
      skills: [
        "AutoCAD / STAAD Pro",
        "Structural Analysis",
        "Surveying",
        "Estimation & Costing",
        "Environmental Engineering",
        "Project Management",
      ],
      subjects: [
        "Structural Analysis",
        "Geotechnical Engineering",
        "Transportation Engineering",
        "Environmental Engineering",
        "Surveying",
        "Concrete Technology",
        "Hydraulics",
        "Construction Management",
      ],
    },
    {
      _id: "5",
      name: "Bachelor of Technology in Electronics & Communication",
      code: "B.Tech ECE",
      stream: "engineering",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Covers VLSI design, signal processing, telecommunications and IoT. Backbone of India's telecom revolution and semiconductor push.",
      eligibility: {
        minimumMarks: 70,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "JEE Main / State CETs",
      },
      careerPaths: [
        {
          jobTitle: "VLSI Design Engineer",
          industry: "Semiconductor",
          averageSalary: { min: 600000, max: 2000000 },
          description: "Design integrated circuits and chip architectures",
        },
        {
          jobTitle: "Telecom Engineer",
          industry: "Telecommunications",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Design and maintain telecommunication networks",
        },
        {
          jobTitle: "IoT Developer",
          industry: "Technology",
          averageSalary: { min: 500000, max: 1500000 },
          description: "Build connected devices and IoT solutions",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Tech in VLSI / Signal Processing",
          degree: "master",
          description: "Advanced semiconductor or signal research",
        },
        {
          courseName: "MS in ECE (abroad)",
          degree: "master",
          description: "Research at top global universities",
        },
      ],
      governmentExams: [
        {
          examName: "GATE ECE",
          description: "M.Tech admissions & PSU hiring",
          eligibility: "B.Tech ECE",
        },
        {
          examName: "ISRO / DRDO Recruitment",
          description: "Defence & space research organizations",
          eligibility: "B.Tech ECE",
        },
      ],
      skills: [
        "VHDL / Verilog",
        "Signal Processing",
        "Embedded C",
        "PCB Design",
        "MATLAB",
        "Antenna Design",
      ],
      subjects: [
        "Analog Electronics",
        "Digital Electronics",
        "Signal & Systems",
        "Communication Systems",
        "VLSI Design",
        "Microprocessors",
        "Electromagnetic Theory",
        "Control Systems",
      ],
    },
    {
      _id: "6",
      name: "Bachelor of Technology in Information Technology",
      code: "B.Tech IT",
      stream: "engineering",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Focuses on software development, networking, information security and web technologies. Prepares students for IT industry roles with strong programming foundation.",
      eligibility: {
        minimumMarks: 70,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "JEE Main / State CETs",
      },
      careerPaths: [
        {
          jobTitle: "Full-Stack Developer",
          industry: "IT Services",
          averageSalary: { min: 600000, max: 2000000 },
          description: "Build end-to-end web and mobile applications",
        },
        {
          jobTitle: "Network Administrator",
          industry: "IT Infrastructure",
          averageSalary: { min: 400000, max: 1000000 },
          description: "Manage and secure computer networks",
        },
        {
          jobTitle: "IT Project Manager",
          industry: "IT Consulting",
          averageSalary: { min: 800000, max: 2500000 },
          description: "Plan and deliver IT projects on time and budget",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Tech in IT / Software Engineering",
          degree: "master",
          description: "Advanced software & systems study",
        },
        {
          courseName: "MBA in IT Management",
          degree: "master",
          description: "Tech leadership and strategy",
        },
      ],
      governmentExams: [
        {
          examName: "GATE CS/IT",
          description: "For M.Tech & PSU jobs",
          eligibility: "B.Tech IT",
        },
        {
          examName: "NIC Scientist",
          description: "National Informatics Centre recruitment",
          eligibility: "B.Tech",
        },
      ],
      skills: [
        "JavaScript / React / Node.js",
        "Cloud Computing (AWS)",
        "Networking",
        "Cybersecurity",
        "Agile Methodology",
        "DevOps",
      ],
      subjects: [
        "Web Technologies",
        "Computer Networks",
        "Information Security",
        "Software Engineering",
        "Cloud Computing",
        "Mobile App Development",
        "Data Warehousing",
        "Operating Systems",
      ],
    },

    // ─── MEDICAL ────────────────────────────────────────────────────
    {
      _id: "7",
      name: "Bachelor of Medicine and Bachelor of Surgery",
      code: "MBBS",
      stream: "medical",
      degree: "bachelor",
      duration: { years: 5, months: 6 },
      description:
        "India's most prestigious medical degree. 5.5-year programme (including 1-year internship) trains students to become licensed medical practitioners. NEET qualified admission.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Physics", "Chemistry", "Biology"],
        entranceExam: "NEET UG",
      },
      careerPaths: [
        {
          jobTitle: "Medical Doctor / Physician",
          industry: "Healthcare",
          averageSalary: { min: 800000, max: 2500000 },
          description: "Diagnose and treat patients in hospitals and clinics",
        },
        {
          jobTitle: "Surgeon",
          industry: "Healthcare",
          averageSalary: { min: 1200000, max: 5000000 },
          description: "Perform surgical procedures across specialties",
        },
        {
          jobTitle: "Medical Researcher",
          industry: "Pharma & Research",
          averageSalary: { min: 600000, max: 1800000 },
          description: "Conduct clinical trials and medical research",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MD (Doctor of Medicine)",
          degree: "master",
          description:
            "Specialization in internal medicine, paediatrics, radiology etc.",
        },
        {
          courseName: "MS (Master of Surgery)",
          degree: "master",
          description: "Surgical specialization — ortho, cardio, neuro etc.",
        },
        {
          courseName: "Super-Speciality (DM / MCh)",
          degree: "master",
          description: "Advanced specialization after MD/MS",
        },
      ],
      governmentExams: [
        {
          examName: "NEET PG",
          description: "For MD/MS admissions after MBBS",
          eligibility: "MBBS completed",
        },
        {
          examName: "USMLE",
          description: "For medical practice in the United States",
          eligibility: "MBBS",
        },
        {
          examName: "FMGE",
          description: "For foreign medical graduates to practise in India",
          eligibility: "Foreign MBBS",
        },
      ],
      skills: [
        "Clinical Diagnosis",
        "Patient Care",
        "Anatomy & Physiology",
        "Pharmacology",
        "Emergency Medicine",
        "Medical Ethics",
      ],
      subjects: [
        "Anatomy",
        "Physiology",
        "Biochemistry",
        "Pathology",
        "Pharmacology",
        "Microbiology",
        "Forensic Medicine",
        "Community Medicine",
        "General Surgery",
        "General Medicine",
      ],
    },
    {
      _id: "8",
      name: "Bachelor of Dental Surgery",
      code: "BDS",
      stream: "medical",
      degree: "bachelor",
      duration: { years: 5, months: 0 },
      description:
        "Professional dental degree training students in oral healthcare, dental surgery, orthodontics and prosthodontics. Includes 1-year compulsory internship.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Physics", "Chemistry", "Biology"],
        entranceExam: "NEET UG",
      },
      careerPaths: [
        {
          jobTitle: "Dentist",
          industry: "Healthcare",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Provide dental care and oral health treatment",
        },
        {
          jobTitle: "Orthodontist",
          industry: "Dental Specialty",
          averageSalary: { min: 800000, max: 2500000 },
          description:
            "Specialize in teeth alignment and corrective procedures",
        },
        {
          jobTitle: "Oral Surgeon",
          industry: "Healthcare",
          averageSalary: { min: 1000000, max: 3000000 },
          description: "Perform complex dental and maxillofacial surgeries",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MDS (Master of Dental Surgery)",
          degree: "master",
          description:
            "Specialize in orthodontics, endodontics, periodontics etc.",
        },
        {
          courseName: "MPH (Public Health)",
          degree: "master",
          description: "Community and public dental health",
        },
      ],
      governmentExams: [
        {
          examName: "NEET MDS",
          description: "For MDS admissions",
          eligibility: "BDS completed",
        },
        {
          examName: "Government Dental Surgeon Posts",
          description: "State PSC dental recruitment",
          eligibility: "BDS",
        },
      ],
      skills: [
        "Dental Procedures",
        "Oral Diagnosis",
        "Patient Management",
        "Prosthodontics",
        "Radiology",
        "Surgical Skills",
      ],
      subjects: [
        "Oral Anatomy",
        "Dental Materials",
        "Oral Pathology",
        "Orthodontics",
        "Prosthodontics",
        "Periodontics",
        "Oral Surgery",
        "Community Dentistry",
      ],
    },
    {
      _id: "9",
      name: "Bachelor of Pharmacy",
      code: "B.Pharm",
      stream: "medical",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Professional degree in pharmaceutical sciences covering drug formulation, pharmacology, clinical pharmacy and quality assurance. Gateway to India's booming pharma industry.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Physics", "Chemistry", "Biology/Mathematics"],
        entranceExam: "State Pharmacy Entrance / GPAT (for M.Pharm)",
      },
      careerPaths: [
        {
          jobTitle: "Pharmaceutical Scientist",
          industry: "Pharma R&D",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Research and develop new drug formulations",
        },
        {
          jobTitle: "Clinical Research Associate",
          industry: "Clinical Trials",
          averageSalary: { min: 350000, max: 1000000 },
          description: "Monitor clinical trials and regulatory compliance",
        },
        {
          jobTitle: "Drug Inspector",
          industry: "Government",
          averageSalary: { min: 500000, max: 900000 },
          description: "Regulate drug quality and enforce pharma laws",
        },
        {
          jobTitle: "Hospital Pharmacist",
          industry: "Healthcare",
          averageSalary: { min: 300000, max: 700000 },
          description: "Dispense medicines and counsel patients in hospitals",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Pharm",
          degree: "master",
          description: "Specialization in pharmacology, pharmaceutics etc.",
        },
        {
          courseName: "MBA in Pharma Management",
          degree: "master",
          description: "Business side of pharmaceutical industry",
        },
      ],
      governmentExams: [
        {
          examName: "GPAT",
          description: "Graduate Pharmacy Aptitude Test for M.Pharm",
          eligibility: "B.Pharm",
        },
        {
          examName: "Drug Inspector Exam",
          description: "State & central drug inspector posts",
          eligibility: "B.Pharm",
        },
      ],
      skills: [
        "Drug Formulation",
        "Quality Control",
        "Regulatory Affairs",
        "Pharmacology",
        "Clinical Research",
        "GMP Practices",
      ],
      subjects: [
        "Pharmaceutical Chemistry",
        "Pharmacology",
        "Pharmaceutics",
        "Pharmacognosy",
        "Hospital Pharmacy",
        "Clinical Pharmacy",
        "Pharmaceutical Analysis",
        "Biopharmaceutics",
      ],
    },
    {
      _id: "10",
      name: "Bachelor of Science in Nursing",
      code: "B.Sc Nursing",
      stream: "medical",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Professional nursing degree covering patient care, community health, paediatric and psychiatric nursing. High demand in India and abroad (UK, Gulf, Australia).",
      eligibility: {
        minimumMarks: 45,
        requiredSubjects: ["Physics", "Chemistry", "Biology"],
        entranceExam: "NEET UG / State Nursing Entrance",
      },
      careerPaths: [
        {
          jobTitle: "Staff Nurse",
          industry: "Healthcare",
          averageSalary: { min: 300000, max: 700000 },
          description: "Provide bedside care in hospitals and clinics",
        },
        {
          jobTitle: "Nursing Superintendent",
          industry: "Hospital Administration",
          averageSalary: { min: 500000, max: 1000000 },
          description: "Manage nursing staff and hospital departments",
        },
        {
          jobTitle: "International Nurse",
          industry: "Global Healthcare",
          averageSalary: { min: 1500000, max: 5000000 },
          description: "Work in hospitals abroad (UK, USA, Gulf countries)",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Sc Nursing",
          degree: "master",
          description: "Specialization in clinical or community nursing",
        },
        {
          courseName: "MPH (Public Health)",
          degree: "master",
          description: "Community health and epidemiology",
        },
      ],
      governmentExams: [
        {
          examName: "AIIMS Nursing Exam",
          description: "Recruitment in AIIMS hospitals",
          eligibility: "B.Sc Nursing",
        },
        {
          examName: "Railway Nursing Exam",
          description: "Indian Railways nursing posts",
          eligibility: "B.Sc Nursing",
        },
        {
          examName: "HAAD / DHA / Prometric",
          description: "Licensing exams for Gulf nursing jobs",
          eligibility: "B.Sc Nursing",
        },
      ],
      skills: [
        "Patient Care",
        "Clinical Assessment",
        "Emergency Care",
        "Medication Administration",
        "Health Education",
        "Critical Thinking",
      ],
      subjects: [
        "Anatomy & Physiology",
        "Medical-Surgical Nursing",
        "Community Health Nursing",
        "Paediatric Nursing",
        "Psychiatric Nursing",
        "Obstetric Nursing",
        "Nursing Research",
        "Nutrition",
      ],
    },

    // ─── SCIENCE ────────────────────────────────────────────────────
    {
      _id: "11",
      name: "Bachelor of Science in Physics",
      code: "B.Sc Physics",
      stream: "science",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "A comprehensive program covering fundamental and advanced concepts in physics, preparing students for research and industry careers.",
      eligibility: {
        minimumMarks: 60,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "None / University Entrance",
      },
      careerPaths: [
        {
          jobTitle: "Research Scientist",
          industry: "Research & Development",
          averageSalary: { min: 400000, max: 800000 },
          description:
            "Conduct scientific research in physics and related fields",
        },
        {
          jobTitle: "Physics Teacher",
          industry: "Education",
          averageSalary: { min: 300000, max: 600000 },
          description: "Teach physics at school or college level",
        },
        {
          jobTitle: "Data Analyst",
          industry: "Technology",
          averageSalary: { min: 350000, max: 700000 },
          description:
            "Analyze complex data using mathematical and statistical methods",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Sc Physics",
          degree: "master",
          description: "Advanced study in specialized physics areas",
        },
        {
          courseName: "M.Tech (Applied Physics)",
          degree: "master",
          description: "Applied physics and engineering",
        },
      ],
      governmentExams: [
        {
          examName: "CSIR NET",
          description: "For research fellowships and lectureship",
          eligibility: "M.Sc Physics",
        },
        {
          examName: "GATE Physics",
          description: "For M.Tech admissions and PSU jobs",
          eligibility: "B.Sc / M.Sc Physics",
        },
      ],
      skills: [
        "Analytical Thinking",
        "Mathematical Modelling",
        "Problem Solving",
        "Research Methods",
        "MATLAB",
        "Lab Techniques",
      ],
      subjects: [
        "Classical Mechanics",
        "Quantum Physics",
        "Thermodynamics",
        "Electromagnetism",
        "Optics",
        "Nuclear Physics",
        "Mathematical Physics",
        "Electronics",
      ],
    },
    {
      _id: "12",
      name: "Bachelor of Science in Computer Science",
      code: "B.Sc CS",
      stream: "science",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Affordable 3-year alternative to B.Tech for students passionate about programming, web development and software engineering without the engineering entrance requirement.",
      eligibility: {
        minimumMarks: 55,
        requiredSubjects: ["Mathematics", "English"],
        entranceExam: "University Entrance / Merit-based",
      },
      careerPaths: [
        {
          jobTitle: "Web Developer",
          industry: "IT",
          averageSalary: { min: 350000, max: 1000000 },
          description: "Build and maintain websites and web applications",
        },
        {
          jobTitle: "Software Tester",
          industry: "IT Services",
          averageSalary: { min: 300000, max: 800000 },
          description: "Test software for bugs and quality assurance",
        },
        {
          jobTitle: "System Administrator",
          industry: "IT Infrastructure",
          averageSalary: { min: 350000, max: 900000 },
          description: "Manage servers, networks and IT systems",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MCA",
          degree: "master",
          description:
            "Master of Computer Applications — 2-year advanced programme",
        },
        {
          courseName: "M.Sc Computer Science",
          degree: "master",
          description: "Research-oriented CS master's",
        },
      ],
      governmentExams: [
        {
          examName: "NIMCET",
          description: "For NIT MCA admissions",
          eligibility: "B.Sc CS / BCA",
        },
        {
          examName: "SSC CGL",
          description: "Government posts (Group B & C)",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Programming (C, Java, Python)",
        "Web Development",
        "SQL & Databases",
        "Linux",
        "Software Testing",
        "Networking",
      ],
      subjects: [
        "Programming in C/C++",
        "Data Structures",
        "Java Programming",
        "DBMS",
        "Web Technologies",
        "Operating Systems",
        "Computer Architecture",
        "Software Engineering",
      ],
    },
    {
      _id: "13",
      name: "Bachelor of Science in Mathematics",
      code: "B.Sc Maths",
      stream: "science",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Rigorous study of pure and applied mathematics including algebra, calculus, statistics and numerical analysis. Strong foundation for actuarial science, data science and teaching.",
      eligibility: {
        minimumMarks: 55,
        requiredSubjects: ["Mathematics"],
        entranceExam: "None / University Entrance",
      },
      careerPaths: [
        {
          jobTitle: "Actuary",
          industry: "Insurance & Finance",
          averageSalary: { min: 600000, max: 2500000 },
          description: "Assess financial risks using mathematical models",
        },
        {
          jobTitle: "Statistician",
          industry: "Research / Government",
          averageSalary: { min: 400000, max: 1000000 },
          description: "Collect, analyze and interpret numerical data",
        },
        {
          jobTitle: "Mathematics Teacher",
          industry: "Education",
          averageSalary: { min: 300000, max: 700000 },
          description: "Teach mathematics at school or university level",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Sc Mathematics",
          degree: "master",
          description: "Advanced pure and applied mathematics",
        },
        {
          courseName: "M.Sc Statistics / Data Science",
          degree: "master",
          description: "Specialize in statistical methods or data analytics",
        },
      ],
      governmentExams: [
        {
          examName: "CSIR NET (Mathematical Sciences)",
          description: "For JRF and lectureship",
          eligibility: "M.Sc Maths",
        },
        {
          examName: "Indian Statistical Service (ISS)",
          description: "Group A government statistician posts",
          eligibility: "Graduate with Statistics",
        },
      ],
      skills: [
        "Abstract Reasoning",
        "Statistical Analysis",
        "MATLAB / R",
        "Problem Solving",
        "Mathematical Modelling",
        "LaTeX",
      ],
      subjects: [
        "Real Analysis",
        "Linear Algebra",
        "Abstract Algebra",
        "Differential Equations",
        "Probability & Statistics",
        "Numerical Methods",
        "Discrete Mathematics",
        "Complex Analysis",
      ],
    },
    {
      _id: "14",
      name: "Bachelor of Science in Chemistry",
      code: "B.Sc Chemistry",
      stream: "science",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Comprehensive study of organic, inorganic and physical chemistry. Graduates work in pharmaceuticals, chemical manufacturing, food processing and environmental science.",
      eligibility: {
        minimumMarks: 55,
        requiredSubjects: ["Physics", "Chemistry", "Mathematics"],
        entranceExam: "None / University Entrance",
      },
      careerPaths: [
        {
          jobTitle: "Quality Control Chemist",
          industry: "Pharma / FMCG",
          averageSalary: { min: 300000, max: 800000 },
          description: "Test raw materials and finished products for quality",
        },
        {
          jobTitle: "R&D Chemist",
          industry: "Chemical Industry",
          averageSalary: { min: 400000, max: 1000000 },
          description: "Develop new chemicals, formulations and processes",
        },
        {
          jobTitle: "Environmental Scientist",
          industry: "Environment",
          averageSalary: { min: 350000, max: 900000 },
          description:
            "Monitor pollution levels and develop remediation strategies",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Sc Chemistry",
          degree: "master",
          description:
            "Specialize in organic, inorganic or analytical chemistry",
        },
        {
          courseName: "M.Sc Forensic Science",
          degree: "master",
          description: "Apply chemistry in criminal investigation",
        },
      ],
      governmentExams: [
        {
          examName: "CSIR NET (Chemical Sciences)",
          description: "JRF and lectureship eligibility",
          eligibility: "M.Sc Chemistry",
        },
        {
          examName: "BARC OCES/DGFS",
          description: "Bhabha Atomic Research Centre scientist posts",
          eligibility: "M.Sc Chemistry",
        },
      ],
      skills: [
        "Lab Techniques",
        "Spectroscopy",
        "Chromatography",
        "Analytical Skills",
        "Safety Protocols",
        "Research Documentation",
      ],
      subjects: [
        "Organic Chemistry",
        "Inorganic Chemistry",
        "Physical Chemistry",
        "Analytical Chemistry",
        "Biochemistry",
        "Environmental Chemistry",
        "Industrial Chemistry",
        "Spectroscopy",
      ],
    },
    {
      _id: "15",
      name: "Bachelor of Science in Biotechnology",
      code: "B.Sc Biotech",
      stream: "science",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Interdisciplinary programme combining biology with technology. Covers genetic engineering, bioinformatics, microbiology and industrial biotech.",
      eligibility: {
        minimumMarks: 55,
        requiredSubjects: ["Biology", "Chemistry", "Physics/Mathematics"],
        entranceExam: "University Entrance / Merit-based",
      },
      careerPaths: [
        {
          jobTitle: "Biotech Research Associate",
          industry: "Biotech & Pharma",
          averageSalary: { min: 350000, max: 900000 },
          description:
            "Conduct research in genetics, molecular biology or drug development",
        },
        {
          jobTitle: "Bioinformatics Analyst",
          industry: "Healthcare IT",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Analyze biological data using computational tools",
        },
        {
          jobTitle: "Quality Analyst (Biotech)",
          industry: "Manufacturing",
          averageSalary: { min: 300000, max: 800000 },
          description: "Ensure quality in biotech product manufacturing",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Sc Biotechnology",
          degree: "master",
          description: "Advanced research in genetic engineering, biopharma",
        },
        {
          courseName: "MBA in Biotech Management",
          degree: "master",
          description: "Business of biotechnology",
        },
      ],
      governmentExams: [
        {
          examName: "CSIR NET (Life Sciences)",
          description: "JRF and lectureship",
          eligibility: "M.Sc Biotech",
        },
        {
          examName: "DBT JRF",
          description: "Dept of Biotechnology fellowship",
          eligibility: "M.Sc Biotech",
        },
      ],
      skills: [
        "Molecular Biology",
        "Genetic Engineering",
        "Bioinformatics Tools",
        "Cell Culture",
        "PCR / Gene Cloning",
        "Research Writing",
      ],
      subjects: [
        "Molecular Biology",
        "Genetic Engineering",
        "Immunology",
        "Bioinformatics",
        "Microbiology",
        "Biochemistry",
        "Cell Biology",
        "Industrial Biotechnology",
      ],
    },
    {
      _id: "16",
      name: "Bachelor of Science in Agriculture",
      code: "B.Sc Agriculture",
      stream: "science",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Professional degree in agricultural sciences covering crop production, soil science, horticulture and agribusiness. India's backbone sector with growing agri-tech opportunities.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Physics", "Chemistry", "Biology/Agriculture"],
        entranceExam: "ICAR AIEEA / State Agriculture Entrance",
      },
      careerPaths: [
        {
          jobTitle: "Agricultural Officer",
          industry: "Government / Banking",
          averageSalary: { min: 400000, max: 800000 },
          description: "Advise farmers on modern agricultural practices",
        },
        {
          jobTitle: "Agri-Tech Entrepreneur",
          industry: "AgriTech Startups",
          averageSalary: { min: 300000, max: 1500000 },
          description: "Build tech solutions for farming and supply chain",
        },
        {
          jobTitle: "Soil Scientist",
          industry: "Research",
          averageSalary: { min: 400000, max: 900000 },
          description: "Study soil properties and improve crop productivity",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Sc Agriculture (Agronomy / Horticulture)",
          degree: "master",
          description: "Specialized agricultural research",
        },
        {
          courseName: "MBA in Agribusiness",
          degree: "master",
          description: "Business management in agricultural sector",
        },
      ],
      governmentExams: [
        {
          examName: "ICAR NET / SRF",
          description: "Agricultural research fellowship",
          eligibility: "M.Sc Agriculture",
        },
        {
          examName: "NABARD Grade A/B",
          description: "National agriculture bank recruitment",
          eligibility: "Graduate in Agriculture",
        },
        {
          examName: "IBPS SO (Agriculture)",
          description: "Agricultural Field Officer in banks",
          eligibility: "B.Sc Agriculture",
        },
      ],
      skills: [
        "Crop Management",
        "Soil Testing",
        "Agri Machinery",
        "Organic Farming",
        "Supply Chain",
        "Data-Driven Farming",
      ],
      subjects: [
        "Agronomy",
        "Soil Science",
        "Horticulture",
        "Plant Pathology",
        "Entomology",
        "Agricultural Economics",
        "Genetics & Plant Breeding",
        "Agricultural Extension",
      ],
    },

    // ─── COMMERCE ───────────────────────────────────────────────────
    {
      _id: "17",
      name: "Bachelor of Commerce",
      code: "B.Com",
      stream: "commerce",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "India's most popular commerce degree covering accounting, finance, economics, taxation and business management. Gateway to CA, CS, CMA and banking careers.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Mathematics / Business Maths", "English"],
        entranceExam: "None / DU JAT / University Merit",
      },
      careerPaths: [
        {
          jobTitle: "Chartered Accountant",
          industry: "Finance & Accounting",
          averageSalary: { min: 600000, max: 1500000 },
          description:
            "Provide accounting, auditing, and financial advisory services",
        },
        {
          jobTitle: "Financial Analyst",
          industry: "Banking & Finance",
          averageSalary: { min: 400000, max: 900000 },
          description: "Analyze financial data and market trends",
        },
        {
          jobTitle: "Tax Consultant",
          industry: "Taxation",
          averageSalary: { min: 300000, max: 900000 },
          description: "Advise clients on tax planning and compliance",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Com",
          degree: "master",
          description: "Advanced commerce and accounting studies",
        },
        {
          courseName: "MBA (Finance)",
          degree: "master",
          description: "Master of Business Administration in Finance",
        },
        {
          courseName: "CA / CS / CMA",
          degree: "master",
          description: "Professional chartered qualifications",
        },
      ],
      governmentExams: [
        {
          examName: "CA Foundation",
          description: "First level of Chartered Accountancy",
          eligibility: "Class 12 passed",
        },
        {
          examName: "Banking Exams (IBPS PO/Clerk)",
          description: "Bank probationary officer and clerk posts",
          eligibility: "Graduate",
        },
        {
          examName: "SSC CGL",
          description: "Group B/C government posts including Auditor, Tax Asst",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Financial Analysis",
        "Accounting (Tally / SAP)",
        "Taxation",
        "Business Communication",
        "Auditing",
        "Strategic Thinking",
      ],
      subjects: [
        "Financial Accounting",
        "Business Economics",
        "Corporate Law",
        "Taxation",
        "Cost Accounting",
        "Business Statistics",
        "Auditing",
        "Management Accounting",
      ],
    },
    {
      _id: "18",
      name: "Bachelor of Commerce (Honours)",
      code: "B.Com (Hons)",
      stream: "commerce",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Specialized commerce programme with deeper focus on accounting, economics and business. Preferred for top MBA programmes and professional courses like CA.",
      eligibility: {
        minimumMarks: 60,
        requiredSubjects: ["Mathematics", "English", "Accountancy"],
        entranceExam: "CUET / DU JAT / University Merit",
      },
      careerPaths: [
        {
          jobTitle: "Investment Banker",
          industry: "Banking & Capital Markets",
          averageSalary: { min: 800000, max: 3000000 },
          description:
            "Advise companies on mergers, acquisitions and fund raising",
        },
        {
          jobTitle: "Management Consultant",
          industry: "Consulting",
          averageSalary: { min: 600000, max: 2000000 },
          description:
            "Help organizations improve performance and solve problems",
        },
        {
          jobTitle: "Company Secretary",
          industry: "Corporate Governance",
          averageSalary: { min: 500000, max: 1500000 },
          description: "Ensure legal and regulatory compliance for companies",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MBA (from IIMs / top B-schools)",
          degree: "master",
          description: "Premier management education",
        },
        {
          courseName: "CFA (Chartered Financial Analyst)",
          degree: "master",
          description: "Global investment management certification",
        },
      ],
      governmentExams: [
        {
          examName: "CS Foundation",
          description: "Company Secretary foundation exam",
          eligibility: "Class 12 passed",
        },
        {
          examName: "RBI Grade B",
          description: "Reserve Bank of India officer recruitment",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Financial Modelling",
        "Excel & VBA",
        "Corporate Finance",
        "Economic Analysis",
        "Business Law",
        "Data Interpretation",
      ],
      subjects: [
        "Advanced Accounting",
        "Corporate Finance",
        "Business Statistics",
        "Microeconomics",
        "Macroeconomics",
        "Income Tax",
        "Business Law",
        "Entrepreneurship",
      ],
    },

    // ─── MANAGEMENT ─────────────────────────────────────────────────
    {
      _id: "19",
      name: "Bachelor of Business Administration",
      code: "BBA",
      stream: "management",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Foundation programme in business management covering marketing, HR, finance and operations. Ideal stepping stone for MBA from IIMs and top B-schools.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["English", "Mathematics/Business Studies"],
        entranceExam: "CUET / IPU CET / SET / University Merit",
      },
      careerPaths: [
        {
          jobTitle: "Marketing Executive",
          industry: "FMCG / Digital Marketing",
          averageSalary: { min: 300000, max: 800000 },
          description: "Plan and execute marketing campaigns",
        },
        {
          jobTitle: "HR Executive",
          industry: "Human Resources",
          averageSalary: { min: 300000, max: 700000 },
          description: "Handle recruitment, employee relations and payroll",
        },
        {
          jobTitle: "Business Development Executive",
          industry: "Sales & BD",
          averageSalary: { min: 350000, max: 900000 },
          description: "Identify growth opportunities and client partnerships",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MBA",
          degree: "master",
          description: "Master of Business Administration — best ROI after BBA",
        },
        {
          courseName: "PGDM",
          degree: "master",
          description:
            "Post Graduate Diploma in Management from AICTE institutes",
        },
      ],
      governmentExams: [
        {
          examName: "CAT / XAT / MAT",
          description: "MBA entrance to IIMs and top B-schools",
          eligibility: "Graduate",
        },
        {
          examName: "SSC CGL",
          description: "Government posts",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Leadership",
        "Digital Marketing",
        "Microsoft Office Suite",
        "Communication",
        "Negotiation",
        "Interpersonal Skills",
      ],
      subjects: [
        "Principles of Management",
        "Marketing Management",
        "Financial Management",
        "Human Resource Management",
        "Business Ethics",
        "Organizational Behaviour",
        "Operations Management",
        "Strategic Management",
      ],
    },
    {
      _id: "20",
      name: "Master of Business Administration",
      code: "MBA",
      stream: "management",
      degree: "master",
      duration: { years: 2, months: 0 },
      description:
        "India's highest-demand management degree. Top IIM graduates earn ₹20-80 LPA. Covers strategy, marketing, finance, operations and consulting. CAT score is the primary gateway.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Any Graduate Degree"],
        entranceExam: "CAT / XAT / MAT / CMAT / GMAT",
      },
      careerPaths: [
        {
          jobTitle: "Management Consultant",
          industry: "Consulting (McKinsey, BCG)",
          averageSalary: { min: 1500000, max: 5000000 },
          description:
            "Solve complex business problems for Fortune 500 clients",
        },
        {
          jobTitle: "Product Manager",
          industry: "Tech & E-commerce",
          averageSalary: { min: 1200000, max: 4000000 },
          description: "Lead product strategy, development and go-to-market",
        },
        {
          jobTitle: "Investment Banker",
          industry: "Finance",
          averageSalary: { min: 1500000, max: 6000000 },
          description: "Manage IPOs, mergers and capital raising for companies",
        },
        {
          jobTitle: "Marketing Manager",
          industry: "FMCG / Tech",
          averageSalary: { min: 1000000, max: 3000000 },
          description: "Lead brand strategy and marketing campaigns",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "PhD in Management",
          degree: "master",
          description: "Academic research and teaching in management",
        },
        {
          courseName: "Executive MBA / CXO Programs",
          degree: "master",
          description: "Advanced leadership development",
        },
      ],
      governmentExams: [
        {
          examName: "Civil Services (IAS)",
          description: "Many MBA grads transition to civil services",
          eligibility: "Graduate",
        },
        {
          examName: "RBI Grade B",
          description:
            "Reserve Bank officer (Finance specialization advantage)",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Strategic Thinking",
        "Financial Analysis",
        "People Management",
        "Data-Driven Decision Making",
        "Presentation Skills",
        "Case Study Analysis",
      ],
      subjects: [
        "Business Strategy",
        "Marketing Management",
        "Corporate Finance",
        "Operations Research",
        "Organizational Behaviour",
        "Managerial Economics",
        "Business Analytics",
        "Supply Chain Management",
      ],
    },
    {
      _id: "21",
      name: "Bachelor of Hotel Management",
      code: "BHM",
      stream: "management",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Professional degree covering hotel operations, food production, front office management and tourism. India's hospitality industry is projected to reach $50B+ by 2028.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["English"],
        entranceExam: "NCHMCT JEE / State Hotel Management Entrance",
      },
      careerPaths: [
        {
          jobTitle: "Hotel Manager",
          industry: "Hospitality",
          averageSalary: { min: 400000, max: 1500000 },
          description: "Manage hotel operations and guest experience",
        },
        {
          jobTitle: "Executive Chef",
          industry: "Food & Beverage",
          averageSalary: { min: 500000, max: 2000000 },
          description: "Lead kitchen operations and menu planning",
        },
        {
          jobTitle: "Event Manager",
          industry: "Events & MICE",
          averageSalary: { min: 350000, max: 1200000 },
          description:
            "Plan and manage corporate events, weddings and conferences",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MBA in Hospitality Management",
          degree: "master",
          description: "Business management in hospitality",
        },
        {
          courseName: "PG Diploma in Hotel Management",
          degree: "master",
          description: "Advanced hotel operations",
        },
      ],
      governmentExams: [
        {
          examName: "Indian Railway Catering & Tourism (IRCTC)",
          description: "Catering and tourism posts",
          eligibility: "BHM",
        },
        {
          examName: "IHM Faculty Posts",
          description: "Teaching in govt hotel management institutes",
          eligibility: "BHM + experience",
        },
      ],
      skills: [
        "Guest Service",
        "Food & Beverage Knowledge",
        "Revenue Management",
        "Communication",
        "Team Leadership",
        "Culinary Arts",
      ],
      subjects: [
        "Food Production",
        "Front Office Management",
        "Food & Beverage Service",
        "Housekeeping",
        "Hotel Accounting",
        "Tourism Management",
        "Nutrition Science",
        "Hospitality Marketing",
      ],
    },

    // ─── COMPUTER APPLICATIONS ──────────────────────────────────────
    {
      _id: "22",
      name: "Bachelor of Computer Applications",
      code: "BCA",
      stream: "science",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Popular 3-year IT degree covering programming, web development, databases and networking. More affordable and accessible alternative to B.Tech CSE with strong job placement.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Mathematics", "English"],
        entranceExam: "University Entrance / Merit-based",
      },
      careerPaths: [
        {
          jobTitle: "Software Developer",
          industry: "IT Services",
          averageSalary: { min: 350000, max: 1000000 },
          description: "Develop and maintain software applications",
        },
        {
          jobTitle: "Web Developer",
          industry: "IT",
          averageSalary: { min: 300000, max: 900000 },
          description: "Build responsive websites and web applications",
        },
        {
          jobTitle: "App Developer",
          industry: "Mobile Tech",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Create mobile applications for Android and iOS",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MCA",
          degree: "master",
          description:
            "Master of Computer Applications — 2-year advanced programme",
        },
        {
          courseName: "MBA in IT",
          degree: "master",
          description: "Business + technology management",
        },
      ],
      governmentExams: [
        {
          examName: "NIMCET",
          description: "NIT MCA entrance test",
          eligibility: "BCA",
        },
        {
          examName: "SSC CGL",
          description: "Government Group B/C posts",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Java / Python / C++",
        "HTML/CSS/JavaScript",
        "MySQL / MongoDB",
        "Android Development",
        "Data Structures",
        "Git & Version Control",
      ],
      subjects: [
        "Programming in C",
        "Object-Oriented Programming",
        "Data Structures",
        "DBMS",
        "Web Technologies",
        "Computer Networks",
        "Operating Systems",
        "Software Engineering",
      ],
    },
    {
      _id: "23",
      name: "Master of Computer Applications",
      code: "MCA",
      stream: "science",
      degree: "master",
      duration: { years: 2, months: 0 },
      description:
        "Post-graduate programme in computer science equivalent to M.Tech for BCA/B.Sc graduates. Deep dive into advanced programming, AI/ML and enterprise software development.",
      eligibility: {
        minimumMarks: 55,
        requiredSubjects: ["BCA / B.Sc CS / B.Sc IT / B.Com with Maths"],
        entranceExam: "NIMCET / State MCA CET / University Entrance",
      },
      careerPaths: [
        {
          jobTitle: "Senior Software Engineer",
          industry: "IT & Tech",
          averageSalary: { min: 600000, max: 2000000 },
          description: "Lead software development and architecture",
        },
        {
          jobTitle: "Data Engineer",
          industry: "Big Data",
          averageSalary: { min: 700000, max: 2200000 },
          description: "Build and maintain data pipelines and infrastructure",
        },
        {
          jobTitle: "AI/ML Engineer",
          industry: "Artificial Intelligence",
          averageSalary: { min: 800000, max: 2500000 },
          description: "Build machine learning models and AI applications",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "PhD in Computer Science",
          degree: "master",
          description: "Research in CS for academic career",
        },
        {
          courseName: "Executive MBA",
          degree: "master",
          description: "Move into tech leadership",
        },
      ],
      governmentExams: [
        {
          examName: "GATE CS",
          description: "For PSU jobs and PhD admissions",
          eligibility: "MCA",
        },
        {
          examName: "NIC Scientist B",
          description: "National Informatics Centre IT posts",
          eligibility: "MCA",
        },
      ],
      skills: [
        "Advanced Java / .NET",
        "Machine Learning (TensorFlow)",
        "Cloud Architecture (AWS/Azure)",
        "Big Data (Hadoop/Spark)",
        "System Design",
        "Agile + Scrum",
      ],
      subjects: [
        "Advanced Algorithms",
        "Artificial Intelligence",
        "Machine Learning",
        "Cloud Computing",
        "Distributed Systems",
        "Advanced DBMS",
        "Compiler Design",
        "Advanced Software Engineering",
      ],
    },

    // ─── LAW ────────────────────────────────────────────────────────
    {
      _id: "24",
      name: "Bachelor of Laws",
      code: "LLB",
      stream: "law",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "3-year law degree for graduates wanting to enter the legal profession. Covers constitutional law, criminal law, civil procedure, corporate law and human rights.",
      eligibility: {
        minimumMarks: 45,
        requiredSubjects: ["Any Graduate Degree"],
        entranceExam: "CLAT PG / DU LLB Entrance / State Law CET",
      },
      careerPaths: [
        {
          jobTitle: "Advocate / Lawyer",
          industry: "Legal Practice",
          averageSalary: { min: 300000, max: 1500000 },
          description: "Represent clients in court and provide legal counsel",
        },
        {
          jobTitle: "Corporate Lawyer",
          industry: "Corporate Law",
          averageSalary: { min: 600000, max: 3000000 },
          description: "Handle mergers, IPOs, compliance for corporations",
        },
        {
          jobTitle: "Legal Advisor",
          industry: "Corporate / Government",
          averageSalary: { min: 500000, max: 1800000 },
          description: "Advise organizations on legal matters and compliance",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "LLM (Master of Laws)",
          degree: "master",
          description:
            "Specialization in constitutional, international or corporate law",
        },
        {
          courseName: "PhD in Law",
          degree: "master",
          description: "Research and academic career in law",
        },
      ],
      governmentExams: [
        {
          examName: "Judicial Services (PCS-J)",
          description: "State-level judge appointments",
          eligibility: "LLB",
        },
        {
          examName: "AIBE",
          description: "All India Bar Examination for practice certificate",
          eligibility: "LLB",
        },
        {
          examName: "Civil Services (IAS/IPS)",
          description: "Optional subject: Law",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Legal Research",
        "Argumentation",
        "Drafting & Documentation",
        "Constitutional Knowledge",
        "Critical Thinking",
        "Client Counseling",
      ],
      subjects: [
        "Constitutional Law",
        "Criminal Law (IPC)",
        "Civil Procedure Code",
        "Corporate Law",
        "Contract Law",
        "Labour Law",
        "Property Law",
        "Human Rights Law",
      ],
    },
    {
      _id: "25",
      name: "Integrated BA LLB",
      code: "BA LLB (5-Year)",
      stream: "law",
      degree: "bachelor",
      duration: { years: 5, months: 0 },
      description:
        "India's premier 5-year integrated law programme after Class 12. Offered by National Law Universities (NLUs). Combines arts/social sciences with comprehensive legal education.",
      eligibility: {
        minimumMarks: 45,
        requiredSubjects: ["Any Stream (10+2)"],
        entranceExam: "CLAT / AILET / LSAT India / MH CET Law",
      },
      careerPaths: [
        {
          jobTitle: "Litigation Lawyer",
          industry: "Courts & Tribunals",
          averageSalary: { min: 400000, max: 2000000 },
          description: "Argue cases in High Courts and Supreme Court",
        },
        {
          jobTitle: "Corporate Lawyer (Tier-1 firm)",
          industry: "Law Firms",
          averageSalary: { min: 1000000, max: 4000000 },
          description:
            "Work at AZB, Trilegal, Cyril Amarchand on M&A and PE deals",
        },
        {
          jobTitle: "Legal Policy Researcher",
          industry: "Think Tanks / Government",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Research and draft legal policy recommendations",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "LLM (India / Abroad)",
          degree: "master",
          description: "Specialize at NLUs or Oxford, Harvard, Cambridge",
        },
        {
          courseName: "MBA (Dual Career)",
          degree: "master",
          description: "Many lawyers pursue MBA for corporate roles",
        },
      ],
      governmentExams: [
        {
          examName: "CLAT (for admission)",
          description: "Common Law Admission Test — gateway to 22+ NLUs",
          eligibility: "10+2 passed",
        },
        {
          examName: "Judicial Services",
          description: "Become a judge at district/sessions court level",
          eligibility: "LLB",
        },
        {
          examName: "UGC NET Law",
          description: "For law teaching positions",
          eligibility: "LLM",
        },
      ],
      skills: [
        "Moot Court Skills",
        "Legal Drafting",
        "Research & Writing",
        "Public Speaking",
        "Negotiation",
        "International Law",
      ],
      subjects: [
        "Constitutional Law",
        "Criminal Law",
        "Contracts",
        "Family Law",
        "International Law",
        "Tax Law",
        "Intellectual Property Law",
        "Environmental Law",
        "Political Science",
        "Sociology",
      ],
    },

    // ─── ARTS & HUMANITIES ──────────────────────────────────────────
    {
      _id: "26",
      name: "Bachelor of Arts in English Literature",
      code: "BA English",
      stream: "arts",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Study of English language, literature and critical analysis of literary works from various periods and cultures. Opens doors to content, media, teaching and civil services.",
      eligibility: {
        minimumMarks: 45,
        requiredSubjects: ["English"],
        entranceExam: "None / CUET / University Merit",
      },
      careerPaths: [
        {
          jobTitle: "Content Writer / Copywriter",
          industry: "Media & Digital",
          averageSalary: { min: 250000, max: 800000 },
          description: "Create written content for brands and publications",
        },
        {
          jobTitle: "English Teacher / Lecturer",
          industry: "Education",
          averageSalary: { min: 300000, max: 700000 },
          description: "Teach English language and literature",
        },
        {
          jobTitle: "Journalist / Editor",
          industry: "Media & Publishing",
          averageSalary: { min: 300000, max: 1000000 },
          description:
            "Report news, edit publications and manage editorial teams",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MA English",
          degree: "master",
          description: "Advanced study of English literature and linguistics",
        },
        {
          courseName: "MA Journalism / Mass Communication",
          degree: "master",
          description: "Specialize in media and journalism",
        },
      ],
      governmentExams: [
        {
          examName: "UGC NET English",
          description: "For lectureship and JRF",
          eligibility: "MA English",
        },
        {
          examName: "Civil Services (UPSC)",
          description: "English Literature as optional subject",
          eligibility: "Graduate",
        },
        {
          examName: "SSC CGL / CHSL",
          description: "Government clerical and officer posts",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Writing & Editing",
        "Critical Analysis",
        "Communication",
        "Research",
        "Public Speaking",
        "Creative Thinking",
      ],
      subjects: [
        "British Literature",
        "American Literature",
        "Indian English Literature",
        "Literary Criticism",
        "Linguistics",
        "Postcolonial Literature",
        "Creative Writing",
        "Drama Studies",
      ],
    },
    {
      _id: "27",
      name: "Bachelor of Arts in Psychology",
      code: "BA Psychology",
      stream: "arts",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Study of human behaviour, cognitive processes, mental health and social interaction. Growing demand for mental health professionals in India makes this increasingly valuable.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["English"],
        entranceExam: "CUET / University Merit",
      },
      careerPaths: [
        {
          jobTitle: "Counselling Psychologist",
          industry: "Mental Health",
          averageSalary: { min: 300000, max: 900000 },
          description:
            "Provide therapy and counselling for mental health issues",
        },
        {
          jobTitle: "HR Professional",
          industry: "Human Resources",
          averageSalary: { min: 350000, max: 800000 },
          description:
            "Apply psychological principles in organizational settings",
        },
        {
          jobTitle: "UX Researcher",
          industry: "Technology",
          averageSalary: { min: 500000, max: 1500000 },
          description: "Research user behaviour to improve product design",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MA Psychology (Clinical / Industrial)",
          degree: "master",
          description:
            "Specialize in clinical practice or organizational psychology",
        },
        {
          courseName: "M.Phil in Clinical Psychology",
          degree: "master",
          description: "RCI-recognized degree to practise clinical psychology",
        },
      ],
      governmentExams: [
        {
          examName: "UGC NET Psychology",
          description: "For lectureship and JRF",
          eligibility: "MA Psychology",
        },
        {
          examName: "UPSC (Psychology Optional)",
          description: "Civil Services with Psychology optional paper",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Active Listening",
        "Empathy",
        "Behavioral Analysis",
        "Psychometric Testing",
        "Research Methods",
        "Counselling Techniques",
      ],
      subjects: [
        "Cognitive Psychology",
        "Abnormal Psychology",
        "Social Psychology",
        "Developmental Psychology",
        "Research Methodology",
        "Psychometrics",
        "Industrial Psychology",
        "Positive Psychology",
      ],
    },
    {
      _id: "28",
      name: "Bachelor of Arts in Political Science",
      code: "BA Political Science",
      stream: "arts",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Study of government systems, political theory, international relations and public policy. The most popular optional subject for UPSC Civil Services aspirants.",
      eligibility: {
        minimumMarks: 45,
        requiredSubjects: ["English"],
        entranceExam: "CUET / University Merit",
      },
      careerPaths: [
        {
          jobTitle: "Civil Servant (IAS/IPS/IFS)",
          industry: "Government",
          averageSalary: { min: 800000, max: 2000000 },
          description: "Serve in top administrative positions in government",
        },
        {
          jobTitle: "Policy Analyst",
          industry: "Think Tanks / NGOs",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Research and evaluate public policies",
        },
        {
          jobTitle: "Political Journalist",
          industry: "Media",
          averageSalary: { min: 350000, max: 1000000 },
          description: "Cover political events and analyze governance",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MA Political Science",
          degree: "master",
          description: "Advanced study of political theory and governance",
        },
        {
          courseName: "MA International Relations",
          degree: "master",
          description: "Specialize in diplomacy and foreign affairs",
        },
      ],
      governmentExams: [
        {
          examName: "UPSC Civil Services",
          description:
            "IAS, IPS, IFS — Political Science most popular optional",
          eligibility: "Graduate",
        },
        {
          examName: "State PCS",
          description: "State-level civil services",
          eligibility: "Graduate",
        },
        {
          examName: "UGC NET Political Science",
          description: "For lectureship",
          eligibility: "MA Political Science",
        },
      ],
      skills: [
        "Political Analysis",
        "Public Speaking",
        "Policy Writing",
        "Research & Debate",
        "Current Affairs",
        "Critical Thinking",
      ],
      subjects: [
        "Indian Politics",
        "Political Theory",
        "International Relations",
        "Comparative Politics",
        "Public Administration",
        "Indian Constitution",
        "Foreign Policy",
        "Political Sociology",
      ],
    },
    {
      _id: "29",
      name: "Bachelor of Arts in Economics",
      code: "BA Economics",
      stream: "arts",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Study of economic theory, econometrics, development economics and financial markets. Highly valued for banking, consulting and policy-making roles in India.",
      eligibility: {
        minimumMarks: 55,
        requiredSubjects: ["Mathematics", "English"],
        entranceExam: "CUET / DU Entrance / University Merit",
      },
      careerPaths: [
        {
          jobTitle: "Economist",
          industry: "Research / Government",
          averageSalary: { min: 500000, max: 1500000 },
          description: "Analyze economic trends and advise on policy",
        },
        {
          jobTitle: "Banking Professional",
          industry: "Banking & Finance",
          averageSalary: { min: 400000, max: 1200000 },
          description:
            "Work in commercial banking, treasury or credit analysis",
        },
        {
          jobTitle: "Economic Journalist",
          industry: "Media",
          averageSalary: { min: 350000, max: 900000 },
          description: "Report on economic policies, markets and business",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MA Economics (DSE / JNU / ISI)",
          degree: "master",
          description: "Top economics programmes in India",
        },
        {
          courseName: "MBA (Finance)",
          degree: "master",
          description: "Pivot into corporate finance and banking",
        },
      ],
      governmentExams: [
        {
          examName: "Indian Economic Service (IES)",
          description: "Class-A economist posts in government",
          eligibility: "MA Economics",
        },
        {
          examName: "RBI Grade B",
          description: "Reserve Bank of India officer recruitment",
          eligibility: "Graduate with Economics",
        },
        {
          examName: "UPSC (Economics Optional)",
          description: "Civil Services with Economics optional",
          eligibility: "Graduate",
        },
      ],
      skills: [
        "Econometrics",
        "Statistical Analysis (STATA/R)",
        "Economic Modelling",
        "Data Interpretation",
        "Policy Analysis",
        "Financial Literacy",
      ],
      subjects: [
        "Microeconomics",
        "Macroeconomics",
        "Econometrics",
        "Development Economics",
        "International Trade",
        "Indian Economy",
        "Public Finance",
        "Money & Banking",
      ],
    },
    {
      _id: "30",
      name: "Bachelor of Journalism & Mass Communication",
      code: "BJMC",
      stream: "arts",
      degree: "bachelor",
      duration: { years: 3, months: 0 },
      description:
        "Professional degree covering print, broadcast, digital media and public relations. India's media industry is worth ₹2.3 lakh crore with growing digital media opportunities.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["English"],
        entranceExam: "CUET / IPU CET / University Entrance",
      },
      careerPaths: [
        {
          jobTitle: "TV / Digital Journalist",
          industry: "News Media",
          averageSalary: { min: 300000, max: 1000000 },
          description:
            "Report and present news for TV channels and digital platforms",
        },
        {
          jobTitle: "PR Professional",
          industry: "Public Relations",
          averageSalary: { min: 350000, max: 1200000 },
          description: "Manage brand reputation and media relations",
        },
        {
          jobTitle: "Social Media Manager",
          industry: "Digital Marketing",
          averageSalary: { min: 300000, max: 900000 },
          description: "Manage brand presence across social media platforms",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "MA Mass Communication",
          degree: "master",
          description: "Advanced media studies",
        },
        {
          courseName: "PG Diploma in Advertising / Film Making",
          degree: "master",
          description: "Creative media specialization",
        },
      ],
      governmentExams: [
        {
          examName: "IIMC Entrance",
          description: "Indian Institute of Mass Communication diploma",
          eligibility: "Graduate",
        },
        {
          examName: "PIB / Doordarshan Recruitment",
          description: "Government media and broadcasting posts",
          eligibility: "Graduate in Journalism",
        },
      ],
      skills: [
        "Reporting & Writing",
        "Video Editing (Premiere Pro)",
        "Photography",
        "Social Media Strategy",
        "Content Creation",
        "Public Speaking",
      ],
      subjects: [
        "Print Journalism",
        "Broadcast Journalism",
        "Digital Media",
        "Advertising",
        "Public Relations",
        "Media Laws & Ethics",
        "Photojournalism",
        "Communication Theory",
      ],
    },

    // ─── DESIGN & ARCHITECTURE ──────────────────────────────────────
    {
      _id: "31",
      name: "Bachelor of Architecture",
      code: "B.Arch",
      stream: "engineering",
      degree: "bachelor",
      duration: { years: 5, months: 0 },
      description:
        "Professional 5-year degree in architectural design, planning and construction. Governed by Council of Architecture (CoA). Essential for India's Smart Cities and infrastructure boom.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Mathematics", "Physics", "Chemistry"],
        entranceExam: "NATA / JEE Main Paper 2",
      },
      careerPaths: [
        {
          jobTitle: "Architect",
          industry: "Architecture & Design",
          averageSalary: { min: 400000, max: 1500000 },
          description: "Design buildings, interiors and urban spaces",
        },
        {
          jobTitle: "Urban Designer",
          industry: "Urban Planning",
          averageSalary: { min: 500000, max: 1800000 },
          description: "Plan sustainable cities and public spaces",
        },
        {
          jobTitle: "Interior Designer",
          industry: "Interior Design",
          averageSalary: { min: 350000, max: 1200000 },
          description: "Design functional and aesthetic interior spaces",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Arch",
          degree: "master",
          description:
            "Specialization in urban design, landscape, sustainable architecture",
        },
        {
          courseName: "M.Plan (Urban Planning)",
          degree: "master",
          description: "Master's in city and regional planning",
        },
      ],
      governmentExams: [
        {
          examName: "UPSC (Architecture posts)",
          description: "Central govt architect positions",
          eligibility: "B.Arch",
        },
        {
          examName: "State PWD Architect Posts",
          description: "Public works department recruitment",
          eligibility: "B.Arch + CoA Registration",
        },
      ],
      skills: [
        "AutoCAD / Revit / SketchUp",
        "3D Rendering (V-Ray)",
        "Structural Understanding",
        "Creative Design",
        "Model Making",
        "Sustainable Design",
      ],
      subjects: [
        "Architectural Design",
        "Building Construction",
        "History of Architecture",
        "Structural Systems",
        "Environmental Planning",
        "Building Services",
        "Urban Design",
        "Landscape Architecture",
      ],
    },
    {
      _id: "32",
      name: "Bachelor of Design",
      code: "B.Des",
      stream: "arts",
      degree: "bachelor",
      duration: { years: 4, months: 0 },
      description:
        "Creative professional degree covering UI/UX design, product design, fashion design, graphic design and animation. NID and NIFT are India's premier design institutes.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Any Stream (10+2)"],
        entranceExam: "NID DAT / NIFT / UCEED / CEED",
      },
      careerPaths: [
        {
          jobTitle: "UI/UX Designer",
          industry: "Technology",
          averageSalary: { min: 500000, max: 2000000 },
          description:
            "Design intuitive digital interfaces and user experiences",
        },
        {
          jobTitle: "Product Designer",
          industry: "Consumer Products",
          averageSalary: { min: 400000, max: 1500000 },
          description:
            "Design physical or digital products from concept to production",
        },
        {
          jobTitle: "Graphic Designer",
          industry: "Creative Agency",
          averageSalary: { min: 300000, max: 1000000 },
          description: "Create visual content for brands and media",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Des (NID / IIT)",
          degree: "master",
          description: "Advanced design research and specialization",
        },
        {
          courseName: "MBA in Design Management",
          degree: "master",
          description: "Strategic design leadership",
        },
      ],
      governmentExams: [
        {
          examName: "NID DAT (for admission)",
          description: "National Institute of Design entrance",
          eligibility: "10+2 passed",
        },
        {
          examName: "UCEED / CEED",
          description: "IIT design programme entrance",
          eligibility: "10+2 / Graduate",
        },
      ],
      skills: [
        "Figma / Adobe XD",
        "Adobe Photoshop / Illustrator",
        "Prototyping",
        "Design Thinking",
        "Typography",
        "Motion Graphics",
      ],
      subjects: [
        "Design Fundamentals",
        "Visual Communication",
        "UI/UX Design",
        "Product Design",
        "Typography",
        "Animation & Motion",
        "Design Research",
        "Material Studies",
      ],
    },

    // ─── EDUCATION ──────────────────────────────────────────────────
    {
      _id: "33",
      name: "Bachelor of Education",
      code: "B.Ed",
      stream: "education",
      degree: "bachelor",
      duration: { years: 2, months: 0 },
      description:
        "Mandatory 2-year professional degree for anyone wanting to become a school teacher in India (Classes 6-12). Recognized by NCTE. Required for government teaching posts.",
      eligibility: {
        minimumMarks: 50,
        requiredSubjects: ["Any Graduate / Postgraduate Degree"],
        entranceExam: "State B.Ed CET / University Entrance",
      },
      careerPaths: [
        {
          jobTitle: "School Teacher (PGT/TGT)",
          industry: "Education",
          averageSalary: { min: 400000, max: 1000000 },
          description: "Teach subjects at secondary and senior secondary level",
        },
        {
          jobTitle: "Vice Principal / Principal",
          industry: "School Administration",
          averageSalary: { min: 600000, max: 1500000 },
          description: "Manage school administration and academic planning",
        },
        {
          jobTitle: "Education Consultant",
          industry: "EdTech",
          averageSalary: { min: 400000, max: 1200000 },
          description: "Design curriculum and ed-tech solutions",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "M.Ed (Master of Education)",
          degree: "master",
          description: "Advanced study in educational theory and practice",
        },
        {
          courseName: "PhD in Education",
          degree: "master",
          description: "Research in pedagogy and educational policy",
        },
      ],
      governmentExams: [
        {
          examName: "CTET",
          description:
            "Central Teacher Eligibility Test — mandatory for central schools",
          eligibility: "B.Ed",
        },
        {
          examName: "State TET",
          description: "State-level teacher eligibility test",
          eligibility: "B.Ed",
        },
        {
          examName: "KVS / NVS Recruitment",
          description: "Kendriya Vidyalaya & Navodaya teaching posts",
          eligibility: "B.Ed + CTET",
        },
      ],
      skills: [
        "Pedagogy",
        "Classroom Management",
        "Lesson Planning",
        "Student Assessment",
        "Communication",
        "Educational Technology",
      ],
      subjects: [
        "Pedagogy of School Subjects",
        "Educational Psychology",
        "Curriculum Development",
        "ICT in Education",
        "Assessment & Evaluation",
        "Inclusive Education",
        "Teaching Methodology",
        "Educational Philosophy",
      ],
    },

    // ─── MASTER'S PROGRAMMES ────────────────────────────────────────
    {
      _id: "34",
      name: "Master of Technology",
      code: "M.Tech",
      stream: "engineering",
      degree: "master",
      duration: { years: 2, months: 0 },
      description:
        "Postgraduate engineering degree with specialization in CS, mechanical, electrical, civil etc. GATE qualified students get stipend of ₹12,400/month. Required for PSU and research roles.",
      eligibility: {
        minimumMarks: 60,
        requiredSubjects: ["B.Tech / BE in relevant branch"],
        entranceExam: "GATE",
      },
      careerPaths: [
        {
          jobTitle: "PSU Engineer (BHEL, ONGC, NTPC)",
          industry: "Public Sector",
          averageSalary: { min: 800000, max: 1800000 },
          description:
            "Design and manage engineering projects in PSUs with GATE score",
        },
        {
          jobTitle: "Research Scientist",
          industry: "R&D (ISRO, DRDO)",
          averageSalary: { min: 700000, max: 1600000 },
          description:
            "Conduct advanced research in defense and space technology",
        },
        {
          jobTitle: "Senior Engineer (Tech companies)",
          industry: "Technology",
          averageSalary: { min: 1200000, max: 3500000 },
          description: "Lead technical teams with deep specialization",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "PhD in Engineering",
          degree: "master",
          description: "Research career in IITs, IISc or abroad",
        },
        {
          courseName: "Post-Doc Research",
          degree: "master",
          description: "Advanced research after PhD",
        },
      ],
      governmentExams: [
        {
          examName: "GATE (for admission itself)",
          description: "Graduate Aptitude Test in Engineering",
          eligibility: "B.Tech / BE",
        },
        {
          examName: "IES (Engineering Services)",
          description: "Class-I technical government posts",
          eligibility: "B.Tech / M.Tech",
        },
      ],
      skills: [
        "Advanced Research Methods",
        "Technical Writing",
        "MATLAB / Python",
        "Specialization Expertise",
        "Project Management",
        "Published Research",
      ],
      subjects: [
        "Advanced subjects per specialization",
        "Research Methodology",
        "Thesis / Dissertation",
        "Electives in emerging areas",
        "Computational Methods",
        "Seminar Presentations",
      ],
    },
    {
      _id: "35",
      name: "Master of Science in Data Science",
      code: "M.Sc Data Science",
      stream: "science",
      degree: "master",
      duration: { years: 2, months: 0 },
      description:
        "Emerging postgraduate programme covering machine learning, big data analytics, statistical modelling and AI. India needs 2 lakh+ data scientists by 2026.",
      eligibility: {
        minimumMarks: 55,
        requiredSubjects: ["B.Sc / BCA / B.Tech with Mathematics / Statistics"],
        entranceExam: "University Entrance / IIT JAM (for IITs)",
      },
      careerPaths: [
        {
          jobTitle: "Data Scientist",
          industry: "Tech / Analytics",
          averageSalary: { min: 800000, max: 2500000 },
          description: "Build predictive models and ML solutions",
        },
        {
          jobTitle: "Business Analyst",
          industry: "Consulting / Corporate",
          averageSalary: { min: 500000, max: 1500000 },
          description: "Translate data insights into business strategy",
        },
        {
          jobTitle: "AI Research Engineer",
          industry: "AI Labs",
          averageSalary: { min: 1200000, max: 4000000 },
          description: "Research and implement cutting-edge AI algorithms",
        },
      ],
      higherEducationOptions: [
        {
          courseName: "PhD in Data Science / AI",
          degree: "master",
          description: "Research career in academia or industry labs",
        },
        {
          courseName: "MBA (Analytics)",
          degree: "master",
          description: "Data-driven business leadership",
        },
      ],
      governmentExams: [
        {
          examName: "GATE (Data Science & AI)",
          description: "Newly introduced GATE paper for data science",
          eligibility: "Relevant UG degree",
        },
        {
          examName: "NIC Scientist",
          description: "Govt IT roles needing data skills",
          eligibility: "PG in CS / Data Science",
        },
      ],
      skills: [
        "Python (Pandas, Scikit-learn)",
        "SQL & NoSQL",
        "Machine Learning",
        "Deep Learning (TensorFlow / PyTorch)",
        "Tableau / Power BI",
        "Statistical Modelling",
      ],
      subjects: [
        "Machine Learning",
        "Deep Learning",
        "Natural Language Processing",
        "Big Data Technologies",
        "Statistical Inference",
        "Data Visualization",
        "Time Series Analysis",
        "Computer Vision",
      ],
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setCourses(sampleCourses);
      setLoading(false);
    }, 1000);
  }, []);

  // ── Fetch saved course IDs on mount (if logged in) ───────────────
  useEffect(() => {
    if (user) {
      axios
        .get(`${SAVED_API}/ids`)
        .then((res) => {
          if (res.data.success) setSavedCourseIds(new Set(res.data.courseIds));
        })
        .catch((err) => console.error("Error fetching saved IDs:", err));
    } else {
      setSavedCourseIds(new Set());
    }
  }, [user]);

  // ── Save / Unsave course ─────────────────────────────────────────
  const toggleSaveCourse = async (course) => {
    if (!user) {
      alert("Please login to save courses");
      return;
    }
    const id = course._id;
    setSavingId(id);
    try {
      if (savedCourseIds.has(id)) {
        await axios.delete(`${SAVED_API}/course/${encodeURIComponent(id)}`);
        setSavedCourseIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        });
      } else {
        await axios.post(`${SAVED_API}/course`, { course });
        setSavedCourseIds((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      console.error("Error saving course:", err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesStream = !filters.stream || course.stream === filters.stream;
    const matchesDegree = !filters.degree || course.degree === filters.degree;
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStream && matchesDegree && matchesSearch;
  });

  // ── Pagination logic ─────────────────────────────────────────────
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE,
  );

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.stream, filters.degree, searchTerm]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#bae6fd] dark:border-gray-800"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#e67e22] absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">
            Loading Course Catalog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e67e22]/5 dark:bg-[#e67e22]/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header Section with Workable Search */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
              Academic <span className="text-[#e67e22]">Catalog</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg font-medium">
              Explore deep insights into your potential career paths, subjects,
              and government exam opportunities.
            </p>
          </div>

          {/* SEARCH FEATURE: Positioned on the right side of the header */}
          <div className="w-full lg:max-w-sm">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search courses or codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-blue-900/5 focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold text-gray-700 dark:text-white placeholder-gray-400"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#e67e22] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-10 items-start">
          {/* --- SIDEBAR FILTERS --- */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-10"
          >
            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-[#1e293b] shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-black text-[#1e293b] dark:text-white mb-8 flex items-center gap-2 uppercase tracking-tighter">
                <span className="w-2 h-6 bg-[#e67e22] rounded-full"></span>{" "}
                Filters
              </h3>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">
                    Stream
                  </label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a] text-gray-700 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold appearance-none cursor-pointer shadow-sm"
                    value={filters.stream}
                    onChange={(e) =>
                      handleFilterChange("stream", e.target.value)
                    }
                  >
                    <option value="">All Streams</option>
                    <option value="engineering">Engineering</option>
                    <option value="medical">Medical</option>
                    <option value="science">Science</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts & Humanities</option>
                    <option value="management">Management</option>
                    <option value="law">Law</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">
                    Degree
                  </label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0f172a] text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold appearance-none cursor-pointer shadow-sm"
                    value={filters.degree}
                    onChange={(e) =>
                      handleFilterChange("degree", e.target.value)
                    }
                  >
                    <option value="">All Degrees</option>
                    <option value="bachelor">Bachelor's</option>
                    <option value="master">Master's</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- COURSE LISTING --- */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8 px-4">
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
                Found:{" "}
                <span className="text-[#3498db]">
                  {filteredCourses.length} Programs
                </span>
                {totalPages > 1 && (
                  <span className="ml-3 text-gray-400">
                    — Page {currentPage} of {totalPages}
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-10">
              {paginatedCourses.length > 0 ? (
                paginatedCourses.map((course, index) => (
                  <motion.div
                    layout
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-8 md:p-10 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-transparent hover:border-[#bae6fd]/50 dark:hover:border-blue-900/30"
                  >
                    {/* ... (Existing Course Card Content remains exactly the same as previous code) ... */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-4 py-1.5 bg-[#bae6fd] dark:bg-blue-900/30 text-[#1e4b6e] dark:text-[#bae6fd] text-[9px] font-black uppercase tracking-widest rounded-full">
                            {course.stream}
                          </span>
                          <span className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-[#e67e22] text-[9px] font-black uppercase tracking-widest rounded-full">
                            {course.duration.years} Year Program
                          </span>
                        </div>
                        <h3 className="text-3xl font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors leading-tight">
                          {course.name}
                        </h3>
                        <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">
                          {course.code}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedCourse(
                            selectedCourse === course._id ? null : course._id,
                          )
                        }
                        className={`px-8 py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-2xl ${
                          selectedCourse === course._id
                            ? "bg-[#1e293b] text-white dark:bg-white dark:text-[#1e293b]"
                            : "bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white shadow-blue-500/20"
                        }`}
                      >
                        {selectedCourse === course._id
                          ? "Close Brief"
                          : "Explore Detail"}
                      </button>
                      <button
                        onClick={() => toggleSaveCourse(course)}
                        disabled={savingId === course._id}
                        className={`px-6 py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-lg ${
                          savedCourseIds.has(course._id)
                            ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-500"
                            : "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                        } disabled:opacity-50`}
                      >
                        {savingId === course._id
                          ? "..."
                          : savedCourseIds.has(course._id)
                            ? "♥ Saved"
                            : "♡ Save"}
                      </button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                      {course.description}
                    </p>

                    <AnimatePresence>
                      {selectedCourse === course._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-10 pt-10 border-t-2 border-dashed border-gray-100 dark:border-gray-800 grid md:grid-cols-2 gap-10">
                            {/* Left Detail Column */}
                            <div className="space-y-10">
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-6 flex items-center gap-2">
                                  <span className="w-8 h-[2px] bg-[#e67e22]"></span>{" "}
                                  Career Prospects
                                </h4>
                                <div className="grid gap-4">
                                  {course.careerPaths.map((career, i) => (
                                    <div
                                      key={i}
                                      className="p-6 rounded-3xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 hover:bg-white transition-all shadow-sm"
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-black text-[#1e293b] dark:text-white text-base">
                                          {career.jobTitle}
                                        </span>
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-black rounded-lg">
                                          High Growth
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        {career.description}
                                      </p>
                                      <div className="text-[#e67e22] font-black text-sm italic">
                                        Est. Salary: ₹
                                        {(
                                          career.averageSalary.min / 100000
                                        ).toFixed(1)}
                                        L -{" "}
                                        {(
                                          career.averageSalary.max / 100000
                                        ).toFixed(1)}
                                        L
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1e4b6e] to-[#0f172a] text-white">
                                <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">
                                  Eligibility Criteria
                                </h4>
                                <ul className="space-y-3 text-sm font-bold">
                                  <li className="flex justify-between">
                                    <span>Minimum Marks:</span>{" "}
                                    <span className="text-[#e67e22]">
                                      {course.eligibility.minimumMarks}%
                                    </span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Entrance Exam:</span>{" "}
                                    <span>
                                      {course.eligibility.entranceExam}
                                    </span>
                                  </li>
                                  <li className="flex flex-col gap-2 mt-4">
                                    <span className="opacity-70">
                                      Required Subjects:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {course.eligibility.requiredSubjects.map(
                                        (s, i) => (
                                          <span
                                            key={i}
                                            className="px-3 py-1 bg-white/10 rounded-lg text-[10px]"
                                          >
                                            {s}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Right Detail Column */}
                            <div className="space-y-10">
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#3498db] mb-6 flex items-center gap-2">
                                  <span className="w-8 h-[2px] bg-[#3498db]"></span>{" "}
                                  Core Industry Skills
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                  {course.skills.map((skill, i) => (
                                    <span
                                      key={i}
                                      className="px-5 py-3 bg-white dark:bg-[#0f172a] border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black text-gray-500 dark:text-gray-400 shadow-sm hover:border-[#3498db] transition-colors"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#e67e22] mb-6 flex items-center gap-2">
                                  <span className="w-8 h-[2px] bg-[#e67e22]"></span>{" "}
                                  Competitive Exams
                                </h4>
                                <div className="space-y-4">
                                  {course.governmentExams.map((exam, i) => (
                                    <div
                                      key={i}
                                      className="flex gap-4 p-5 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border-l-4 border-[#e67e22]"
                                    >
                                      <div className="flex-1">
                                        <p className="font-black text-[#1e293b] dark:text-white text-sm">
                                          {exam.examName}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {exam.description}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-8 rounded-[2rem] border-2 border-[#bae6fd] dark:border-blue-900/30">
                                <h4 className="text-xs font-black uppercase tracking-widest text-[#3498db] mb-4">
                                  Key Subjects
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  {course.subjects.map((sub, i) => (
                                    <div
                                      key={i}
                                      className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2"
                                    >
                                      <span className="w-1.5 h-1.5 bg-[#3498db] rounded-full"></span>{" "}
                                      {sub}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-bold">
                    No courses found matching your search or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({ stream: "", degree: "" });
                    }}
                    className="mt-4 text-[#e67e22] font-black uppercase text-xs tracking-widest hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* ── Pagination Controls ─────────────────────────────── */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                {/* Previous */}
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="px-5 py-3 rounded-xl font-black text-sm bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm hover:border-[#e67e22] hover:text-[#e67e22] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-11 h-11 rounded-xl font-black text-sm transition-all shadow-sm ${
                        currentPage === page
                          ? "bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white shadow-blue-500/20"
                          : "bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#3498db] hover:text-[#3498db]"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* Next */}
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-5 py-3 rounded-xl font-black text-sm bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm hover:border-[#e67e22] hover:text-[#e67e22] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
