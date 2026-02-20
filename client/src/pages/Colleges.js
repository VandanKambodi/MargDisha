import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    state: "",
    district: "",
    type: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data preserved
  const sampleColleges = [
    {
      _id: "1",
      name: "Government Degree College, Delhi",
      type: "government",
      location: { state: "Delhi", district: "Central Delhi", city: "New Delhi", address: "Connaught Place, New Delhi" },
      contact: { phone: "+91-11-23456789", email: "info@gdcdelhi.edu.in", website: "www.gdcdelhi.edu.in" },
      courses: [
        { name: "Bachelor of Arts", code: "BA", stream: "arts" },
        { name: "Bachelor of Commerce", code: "B.Com", stream: "commerce" },
        { name: "Bachelor of Science", code: "B.Sc", stream: "science" },
      ],
      facilities: { hostel: true, library: true, laboratory: true, internetAccess: true, sportsComplex: true, canteen: true },
      fees: { tuitionFee: 15000, hostelFee: 25000, otherFees: 5000 },
      rating: 4.2,
    },
    {
      _id: "2",
      name: "Government College of Arts & Science, Mumbai",
      type: "government",
      location: { state: "Maharashtra", district: "Mumbai", city: "Mumbai", address: "Dadar, Mumbai" },
      contact: { phone: "+91-22-24567890", email: "info@gcasmumbai.edu.in", website: "www.gcasmumbai.edu.in" },
      courses: [
        { name: "Bachelor of Arts", code: "BA", stream: "arts" },
        { name: "Bachelor of Science", code: "B.Sc", stream: "science" },
        { name: "Bachelor of Computer Applications", code: "BCA", stream: "diploma" },
      ],
      facilities: { hostel: false, library: true, laboratory: true, internetAccess: true, sportsComplex: false, canteen: true },
      fees: { tuitionFee: 12000, hostelFee: 0, otherFees: 3000 },
      rating: 3.8,
    },
    {
      _id: "3",
      name: "Government Degree College, Bangalore",
      type: "government",
      location: { state: "Karnataka", district: "Bangalore Urban", city: "Bangalore", address: "MG Road, Bangalore" },
      contact: { phone: "+91-80-25678901", email: "info@gdcbangalore.edu.in", website: "www.gdcbangalore.edu.in" },
      courses: [
        { name: "Bachelor of Commerce", code: "B.Com", stream: "commerce" },
        { name: "Bachelor of Business Administration", code: "BBA", stream: "commerce" },
        { name: "Bachelor of Science", code: "B.Sc", stream: "science" },
      ],
      facilities: { hostel: true, library: true, laboratory: true, internetAccess: true, sportsComplex: true, canteen: true },
      fees: { tuitionFee: 18000, hostelFee: 30000, otherFees: 7000 },
      rating: 4.5,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setColleges(sampleColleges);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredColleges = colleges.filter((college) => {
    const matchesSearch =
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !filters.state || college.location.state === filters.state;
    const matchesDistrict = !filters.district || college.location.district === filters.district;
    const matchesType = !filters.type || college.type === filters.type;
    return matchesSearch && matchesState && matchesDistrict && matchesType;
  });

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
            Scanning Institutions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#3498db]/5 dark:bg-[#3498db]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e67e22]/5 dark:bg-[#e67e22]/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-[#1e293b] dark:text-white mb-4 tracking-tight">
            College <span className="text-[#e67e22]">Navigator</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-medium">
            Find certified government institutions with detailed course mappings and facility insights.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 rounded-[2.5rem] bg-white dark:bg-[#1e293b] shadow-2xl shadow-blue-900/5 border border-gray-100 dark:border-gray-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Quick Search</label>
              <input
                type="text"
                placeholder="College or City..."
                className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Select State</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold appearance-none cursor-pointer"
                value={filters.state}
                onChange={(e) => handleFilterChange("state", e.target.value)}
              >
                <option value="">All States</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">District</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#3498db] outline-none transition-all font-bold appearance-none cursor-pointer"
                value={filters.district}
                onChange={(e) => handleFilterChange("district", e.target.value)}
              >
                <option value="">All Districts</option>
                <option value="Central Delhi">Central Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore Urban">Bangalore Urban</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Inst. Type</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-white focus:ring-2 focus:ring-[#e67e22] outline-none transition-all font-bold appearance-none cursor-pointer"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="government">Government</option>
                <option value="aided">Govt Aided</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-4">
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
            Directory Results: <span className="text-[#3498db]">{filteredColleges.length} Institutions</span>
          </p>
        </div>

        {/* College Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {filteredColleges.map((college, index) => (
            <motion.div
              key={college._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-[3rem] bg-white dark:bg-[#1e293b] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-transparent hover:border-[#bae6fd]/50"
            >
              {/* Top Row: Title & Rating */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#3498db] text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {college.type}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-[#1e293b] dark:text-white group-hover:text-[#e67e22] transition-colors leading-tight mb-1">
                    {college.name}
                  </h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                    <span className="text-[#3498db]">📍</span> {college.location.city}, {college.location.state}
                  </p>
                </div>
                <div className="bg-[#f39c12] text-white px-3 py-2 rounded-2xl flex items-center gap-1 shadow-lg shadow-yellow-500/20">
                  <span className="text-sm font-black">★</span>
                  <span className="text-xs font-black">{college.rating}</span>
                </div>
              </div>

              {/* Course Badges */}
              <div className="mb-8 flex flex-wrap gap-2">
                {college.courses.slice(0, 3).map((course, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-50 dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black rounded-xl">
                    {course.code}
                  </span>
                ))}
                {college.courses.length > 3 && (
                  <span className="px-4 py-2 bg-gray-50 dark:bg-[#0f172a] text-[#3498db] text-[10px] font-black rounded-xl italic">
                    +{college.courses.length - 3} More
                  </span>
                )}
              </div>

              {/* Bottom Row: Fees & Actions */}
              <div className="flex justify-between items-center pt-6 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tuition / Year</p>
                  <p className="text-2xl font-black text-[#1e4b6e] dark:text-[#bae6fd]">
                    ₹{college.fees.tuitionFee.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest border-2 border-gray-100 dark:border-gray-800 text-gray-400 hover:bg-[#e67e22] hover:text-white hover:border-[#e67e22] transition-all">
                    Details
                  </button>
                  <button className="px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-gradient-to-r from-[#1e4b6e] to-[#3498db] text-white shadow-lg shadow-blue-500/20 transform active:scale-95 transition-all">
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredColleges.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-[#1e293b] rounded-[3rem] shadow-xl">
            <p className="text-gray-400 font-black uppercase tracking-widest">No matching institutions found.</p>
            <button 
              onClick={() => {setSearchTerm(""); setFilters({state: "", district: "", type: ""});}}
              className="mt-4 text-[#e67e22] font-black uppercase text-xs tracking-widest hover:underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;