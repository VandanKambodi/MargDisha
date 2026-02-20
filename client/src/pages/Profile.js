import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    class: "",
    location: { state: "", district: "", city: "" },
    interests: [],
    academicBackground: { stream: "", subjects: [], percentage: "" },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const interestOptions = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "English Literature", "History", "Geography", "Economics", "Business Studies",
    "Arts & Crafts", "Music", "Sports", "Social Work", "Research",
  ];

  const subjectOptions = {
    science: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
    commerce: ["Accountancy", "Business Studies", "Economics", "Mathematics", "English"],
    arts: ["English", "History", "Geography", "Political Science", "Psychology", "Sociology"],
    diploma: ["Computer Applications", "Multimedia", "Tourism", "Fashion Design", "Agriculture"],
  };

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const profileData = response.data.profile;
        setProfile({
          age: profileData.personalInfo?.age || "",
          gender: profileData.personalInfo?.gender || "",
          class: profileData.academicInfo?.currentClass || "",
          location: {
            state: profileData.location?.state || "",
            district: profileData.location?.district || "",
            city: profileData.location?.city || "",
          },
          interests: profileData.careerPreferences?.interests?.map((i) => i.name) || [],
          academicBackground: {
            stream: profileData.academicInfo?.stream || "",
            subjects: profileData.academicInfo?.subjects?.map((s) => s.name) || [],
            percentage: profileData.academicInfo?.currentPercentage || "",
          },
        });
      }
    } catch (error) { console.log(error); }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfile((prev) => ({
        ...prev,
        [parent]: { ...(prev[parent] || {}), [child]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleInterestChange = (interest) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubjectChange = (subject) => {
    setProfile((prev) => ({
      ...prev,
      academicBackground: {
        ...prev.academicBackground,
        subjects: prev.academicBackground.subjects.includes(subject)
          ? prev.academicBackground.subjects.filter((s) => s !== subject)
          : [...prev.academicBackground.subjects, subject],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const profileData = {
        personalInfo: { age: profile.age, gender: profile.gender },
        academicInfo: {
          currentClass: profile.class,
          stream: profile.academicBackground.stream,
          currentPercentage: profile.academicBackground.percentage,
          subjects: profile.academicBackground.subjects.map((s) => ({
            name: s, grade: "", marks: 0, maxMarks: 100,
          })),
        },
        location: { state: profile.location.state, district: profile.location.district, city: profile.location.city },
        careerPreferences: {
          interests: profile.interests.map((i) => ({ category: "general", name: i, level: "medium" })),
        },
      };
      const response = await axios.put("http://localhost:5000/api/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) setMessage("Profile updated successfully!");
      else setMessage("Error updating profile");
    } catch { setMessage("Error updating profile"); }
    setLoading(false);
  };

  const completion = [
    profile.age, profile.gender, profile.class, profile.location.state, profile.academicBackground.stream,
  ].filter(Boolean).length * 20;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-all duration-500 relative overflow-hidden pb-12">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3498db]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e67e22]/5 rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto px-4 pt-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-2xl border border-gray-100 dark:border-gray-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
          
          {/* HEADER */}
          <div className="px-10 py-8 border-b border-gray-100 dark:border-gray-800 bg-white/30 dark:bg-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1e4b6e] to-[#3498db] rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-[#1e293b] dark:text-white tracking-tight">Profile Settings</h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Fine-tune your academic persona</p>
                </div>
              </div>

              <div className="bg-gray-100/50 dark:bg-black/20 p-4 rounded-2xl w-full md:w-56 border border-white/50 dark:border-white/5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#3498db]">Data Integrity</span>
                  <span className="text-sm font-black text-[#e67e22]">{completion}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <motion.div className="bg-gradient-to-r from-[#3498db] to-[#e67e22] h-full"
                    initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 1 }} />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-12">
            {/* PERSONAL SECTION */}
            <section className="space-y-6">
              <SectionHeader title="Basic Demographics" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FloatingInput label="Age" type="number" value={profile.age} onChange={(e) => handleInputChange("age", e.target.value)} />
                <FloatingSelect label="Gender" value={profile.gender} onChange={(e) => handleInputChange("gender", e.target.value)} options={["male", "female", "other"]} />
                <FloatingSelect label="Class Level" value={profile.class} onChange={(e) => handleInputChange("class", e.target.value)} options={["10", "11", "12", "graduate", "postgraduate"]} />
              </div>
            </section>

            {/* LOCATION SECTION */}
            <section className="space-y-6">
              <SectionHeader title="Geographic Presence" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FloatingInput label="State" value={profile.location.state} onChange={(e) => handleInputChange("location.state", e.target.value)} />
                <FloatingInput label="District" value={profile.location.district} onChange={(e) => handleInputChange("location.district", e.target.value)} />
                <FloatingInput label="City" value={profile.location.city} onChange={(e) => handleInputChange("location.city", e.target.value)} />
              </div>
            </section>

            {/* INTERESTS SECTION */}
            <section className="space-y-6">
              <SectionHeader title="Core Career Interests" />
              <SelectableCards options={interestOptions} selected={profile.interests} onChange={handleInterestChange} themeColor="[#e67e22]" />
            </section>

            {/* ACADEMIC SECTION */}
            <section className="space-y-6">
              <SectionHeader title="Academic Performance" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <FloatingSelect label="Academic Stream" value={profile.academicBackground.stream} onChange={(e) => handleInputChange("academicBackground.stream", e.target.value)} options={["science", "commerce", "arts", "diploma"]} />
                <FloatingInput label="Recent Percentage (%)" type="number" value={profile.academicBackground.percentage} onChange={(e) => handleInputChange("academicBackground.percentage", e.target.value)} />
              </div>
              
              {profile.academicBackground.stream && (
                <div className="mt-8 animate-fadeIn">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Stream Specific Subjects</p>
                  <SelectableCards options={subjectOptions[profile.academicBackground.stream]} selected={profile.academicBackground.subjects} onChange={handleSubjectChange} themeColor="[#3498db]" />
                </div>
              )}
            </section>

            {/* FOOTER ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-100 dark:border-gray-800 gap-6">
              <div className="min-h-[24px]">
                {message && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-bold px-4 py-2 rounded-lg ${message.includes("Error") ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"}`}>
                    {message}
                  </motion.div>
                )}
              </div>

              <button disabled={loading}
                className="w-full md:w-auto px-10 py-3.5 rounded-2xl text-white font-black uppercase tracking-widest text-xs bg-gradient-to-r from-[#1e4b6e] to-[#3498db] shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all">
                {loading ? "Synchronizing..." : "Commit Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3">
    <div className="h-6 w-1 bg-[#e67e22] rounded-full" />
    <h2 className="text-sm font-black uppercase tracking-widest text-[#1e293b] dark:text-white">{title}</h2>
  </div>
);

const FloatingInput = ({ label, value, onChange, type = "text" }) => (
  <div className="relative group">
    <input type={type} value={value} onChange={onChange} placeholder=" "
      className="peer w-full px-5 pt-6 pb-2 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold text-gray-700 dark:text-white text-sm" />
    <label className="absolute left-5 top-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[10px] transition-all pointer-events-none">
      {label}
    </label>
  </div>
);

const FloatingSelect = ({ label, value, onChange, options }) => (
  <div className="relative group">
    <select value={value} onChange={onChange}
      className="peer w-full px-5 pt-6 pb-2 rounded-2xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold text-gray-700 dark:text-white text-sm appearance-none cursor-pointer">
      <option value=""></option>
      {options.map((o) => <option key={o} value={o} className="dark:bg-[#1e293b]">{o}</option>)}
    </select>
    <label className="absolute left-5 top-2 text-[10px] font-black uppercase tracking-tighter text-gray-400 transition-all pointer-events-none">{label}</label>
    <div className="absolute right-5 top-1/2 -translate-y-1/4 pointer-events-none text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
    </div>
  </div>
);

const SelectableCards = ({ options, selected, onChange, themeColor }) => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
    {options.map((option) => {
      const isSelected = selected.includes(option);
      return (
        <div key={option} onClick={() => onChange(option)}
          className={`cursor-pointer px-3 py-2.5 rounded-xl border text-[11px] font-bold text-center transition-all duration-300
          ${isSelected 
            ? `bg${themeColor} text-white border-transparent shadow-lg scale-105` 
            : "bg-white dark:bg-[#0f172a] dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-[#3498db]"}`}
          style={isSelected ? { backgroundColor: themeColor.replace('[', '').replace(']', '') } : {}}
        >
          {option}
        </div>
      );
    })}
  </div>
);

export default Profile;