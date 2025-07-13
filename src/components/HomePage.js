import React from 'react';
import UserList from './UserList';

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-20">
          <div className="flex justify-between items-center h-[70px] md:h-[70px]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight">Scheduler</span>
            </div>
            <div className="hidden md:flex gap-8">
              <a href="#dashboard" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium transition-all duration-200">
                Dashboard
              </a>
              <a href="#calendar" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium transition-all duration-200">
                Calendar
              </a>
              <a href="#appointments" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium transition-all duration-200">
                Appointments
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-5 md:px-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
              Scheduler App
            </h1>
          </div>

          <UserList />
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 text-center py-5 mt-auto">
        <div className="max-w-6xl mx-auto px-5 md:px-20">
          <p className="text-sm">&copy; 2024 Scheduler App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;