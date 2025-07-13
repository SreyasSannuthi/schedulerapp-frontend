import React from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { currentUser, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 md:px-20">
          <div className="flex justify-between items-center h-[70px]">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight">Scheduler</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-white">
                <div className="text-right">
                  <div className="font-semibold">{currentUser.name}</div>
                  <div className="text-xs text-white/80">{currentUser.email}</div>
                </div>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-bold uppercase
                  ${isAdmin ? 'bg-red-500' : 'bg-purple-500'}
                `}>
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-5 md:px-20">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome, {currentUser.name}!
              </h1>
              <p className="text-slate-600">
                {isAdmin ? 'Administrator Dashboard' : 'User Dashboard'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Your Profile</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-600 font-medium">Name:</span>
                  <p className="text-slate-800 font-semibold">{currentUser.name}</p>
                </div>
                <div>
                  <span className="text-slate-600 font-medium">Email:</span>
                  <p className="text-slate-800 font-semibold">{currentUser.email}</p>
                </div>
                <div>
                  <span className="text-slate-600 font-medium">Role:</span>
                  <p className="text-slate-800 font-semibold capitalize">{currentUser.role}</p>
                </div>
                <div>
                  <span className="text-slate-600 font-medium">User ID:</span>
                  <p className="text-slate-800 font-mono text-sm">{currentUser.id}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 text-center">
                <h3 className="font-bold text-slate-800 mb-2">Calendar</h3>
                <p className="text-slate-600 text-sm">View your appointments</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 text-center">
                <h3 className="font-bold text-slate-800 mb-2">Appointments</h3>
                <p className="text-slate-600 text-sm">Manage your schedule</p>
              </div>

              {isAdmin && (
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-6 text-center">
                  <h3 className="font-bold text-slate-800 mb-2">Admin Panel</h3>
                  <p className="text-slate-600 text-sm">Manage all users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;