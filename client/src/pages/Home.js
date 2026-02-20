import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const floating = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 overflow-hidden">
      {/* --- HERO SECTION --- */}
      {/* <section className="relative min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-[#1e4b6e] via-[#4b8fb3] to-[#e6a23c] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#854d0e] text-white overflow-hidden"> */}
      <section className="relative h-[90vh] flex items-start justify-center pt-12 md:pt-16 bg-gradient-to-b from-[#1e4b6e] via-[#4b8fb3] to-[#e6a23c] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#854d0e] text-white overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 left-10 w-96 h-96 bg-[#f39c12]/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#bae6fd]/20 rounded-full blur-[120px]"
          />
        </div>

        {/* <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center z-10"> */}
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-start z-10 gap-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-50">
                AI-Powered Career Guidance
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]"
            >
              Your Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bae6fd] to-[#f39c12]">
                Synchronized.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-blue-50/80 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              We combine deep psychometric analysis with real-time academic data
              to map your perfect career journey.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5"
            >
              <Link
                to="/quiz"
                className="group px-10 py-5 bg-[#e67e22] text-white font-black rounded-2xl shadow-2xl hover:shadow-orange-500/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10">Launch Career Assessment</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              <Link
                to="/register"
                className="px-10 py-5 border-2 border-white/40 backdrop-blur-md font-black rounded-2xl hover:bg-white hover:text-[#1e4b6e] transition-all duration-300"
              >
                Create Account
              </Link>
            </motion.div>
          </motion.div>

          {/* --- PROFESSIONAL INTELLIGENCE HUB --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hidden lg:flex justify-center items-center relative h-[450px]"
          >
            {/* Main Glowing Orb (The Core AI) */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 40px rgba(52, 152, 219, 0.2)",
                    "0 0 80px rgba(230, 126, 34, 0.3)",
                    "0 0 40px rgba(52, 152, 219, 0.2)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute w-64 h-64 bg-gradient-to-tr from-[#1e4b6e] to-[#3498db] rounded-full blur-2xl opacity-40"
              />

              {/* Geometric Abstract Shape */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative z-10 w-72 h-72 border-[1px] border-white/20 rounded-[3rem] flex items-center justify-center backdrop-blur-sm shadow-2xl"
              >
                <div className="w-full h-full relative overflow-hidden rounded-[3rem]">
                  {/* Animated Grid Lines */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <motion.div
                    animate={{ y: [-100, 100] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-[#bae6fd]/20 to-transparent h-1/2 w-full"
                  />
                </div>

                {/* Center Intelligence Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-white/10 p-6 rounded-3xl border border-white/20 shadow-inner"
                  >
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
                        fill="#e67e22"
                        fillOpacity="0.8"
                      />
                      <path
                        d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
                        stroke="#bae6fd"
                        strokeWidth="0.5"
                      />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>

              {/* Orbiting Nodes (Professional Data Points) */}
              {[
                {
                  delay: 0,
                  color: "#e67e22",
                  top: "-5%",
                  left: "10%",
                  icon: "🎯",
                },
                {
                  delay: 1,
                  color: "#3498db",
                  top: "20%",
                  right: "-10%",
                  icon: "📊",
                },
                {
                  delay: 2,
                  color: "#f39c12",
                  bottom: "10%",
                  left: "-15%",
                  icon: "🏛️",
                },
              ].map((node, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -15, 0],
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    delay: node.delay,
                    ease: "easeInOut",
                  }}
                  className="absolute z-20 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl flex items-center justify-center text-xl"
                  style={{
                    top: node.top,
                    left: node.left,
                    right: node.right,
                    bottom: node.bottom,
                  }}
                >
                  <div className="relative">
                    <div
                      className="absolute -inset-2 rounded-full blur-md"
                      style={{ backgroundColor: `${node.color}40` }}
                    />
                    <span className="relative">{node.icon}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Background Static Connection Lines (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              viewBox="0 0 400 400"
            >
              <motion.path
                d="M100,200 Q200,100 300,200 T400,200"
                stroke="#bae6fd"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.path
                d="M50,150 Q150,250 250,150 T350,150"
                stroke="#e67e22"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-6">
        <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "500+", label: "Govt Colleges", color: "text-[#3498db]" },
            {
              number: "100+",
              label: "Course Options",
              color: "text-[#e67e22]",
            },
            {
              number: "50+",
              label: "Career Paths",
              color: "text-[#1e4b6e] dark:text-[#bae6fd]",
            },
            {
              number: "10K+",
              label: "Active Students",
              color: "text-green-500",
            },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className={`text-4xl md:text-5xl font-black ${stat.color} mb-1 tracking-tighter`}
              >
                {stat.number}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-[#1e293b] dark:text-white mb-6 tracking-tight">
              One Platform. <span className="text-[#e67e22]">Infinite</span>{" "}
              Growth.
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              Everything you need to navigate the transition from school to a
              successful professional life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Psychometric DNA",
                desc: "Go beyond grades. Discover how your personality traits align with high-demand careers.",
                icon: "🧠",
                color: "#e67e22",
              },
              {
                title: "Course Mapping",
                desc: "Find exactly which degree programs lead to the jobs you actually want.",
                icon: "🗺️",
                color: "#3498db",
              },
              {
                title: "Institution Finder",
                desc: "Connect with top government colleges based on your location and academic goals.",
                icon: "🏛️",
                color: "#1e293b",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -15 }}
                className="group bg-white dark:bg-[#1e293b] p-10 rounded-[3rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-100 dark:border-gray-800"
              >
                <div className="w-20 h-20 mb-8 rounded-[2rem] bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 text-[#1e293b] dark:text-white tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (EXTRA DATA) --- */}
      <section className="py-24 bg-[#1e293b] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black mb-20 text-center tracking-tight">
            Your 3-Step Success <span className="text-[#3498db]">Loop</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 hidden md:block" />
            {[
              {
                step: "01",
                title: "Analyze",
                body: "Complete the AI assessment to generate your personality and aptitude profile.",
              },
              {
                step: "02",
                title: "Discover",
                body: "Browse personalized recommendations for streams, courses, and jobs.",
              },
              {
                step: "03",
                title: "Enroll",
                body: "Find government colleges near you that fit your specific requirements.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative z-10 bg-[#1e293b] border border-white/10 p-8 rounded-[2rem]"
              >
                <div className="text-6xl font-black text-[#e67e22]/20 mb-6">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold mb-4 uppercase tracking-widest text-[#bae6fd]">
                  {item.title}
                </h4>
                <p className="text-gray-400 font-medium leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-br from-[#1e4b6e] via-[#3498db] to-[#e67e22] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)]"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
              The First Step <br />
              To Your{" "}
              <span className="underline decoration-[#f39c12]">Legacy</span>.
            </h2>
            <p className="text-xl text-blue-50 mb-12 max-w-xl mx-auto font-medium">
              Join 10,000+ students currently using MargDisha to build their
              futures.
            </p>
            <Link
              to="/register"
              className="inline-block px-14 py-6 bg-white text-[#1e4b6e] font-black uppercase tracking-widest text-sm rounded-2xl shadow-2xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
            >
              Start My Journey Now
            </Link>
          </div>
          {/* Animated rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-pulse delay-700" />
        </motion.div>
      </section>

      {/* --- FOOTER (EXTRA DATA) --- */}
      <footer className="bg-white dark:bg-[#0f172a] pt-24 pb-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img
                src={require("../assets/logo-rb.png")}
                alt="MargDisha Logo"
                className="h-14 w-auto group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-xl font-black tracking-tighter text-[#1e293b] dark:text-white">
                Marg<span className="text-[#e67e22]">Disha</span>
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm font-medium leading-relaxed">
              Empowering the next generation of professionals through
              intelligent guidance and accessible education data.
            </p>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.2em] text-[#e67e22] mb-6">
              Resources
            </h5>
            <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300">
              <li>
                <Link
                  to="/colleges"
                  className="hover:text-[#3498db] transition-colors"
                >
                  College Directory
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="hover:text-[#3498db] transition-colors"
                >
                  Course Mapping
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="hover:text-[#3498db] transition-colors"
                >
                  Skill Assessment
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.2em] text-[#e67e22] mb-6">
              Connect
            </h5>
            <ul className="space-y-4 text-sm font-bold text-gray-600 dark:text-gray-300">
              <li>
                <a href="#" className="hover:text-[#3498db] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#3498db] transition-colors">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#3498db] transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            © 2026 MargDisha AI. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            {["Twitter", "LinkedIn", "Instagram"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#e67e22] transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
