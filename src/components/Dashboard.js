import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@apollo/client";
import { GET_DOCTORS, GET_PATIENTS } from "../apollo/queries";
import AppointmentCalendar from "./Calendar";
import AppointmentsList from "./AppointmentsList";

function Dashboard() {
    const { currentUser, logout, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState("appointments");
    const [selectedUserId, setSelectedUserId] = useState(null);

    const { data: doctorsData } = useQuery(GET_DOCTORS, { skip: !isAdmin });
    const { data: patientsData } = useQuery(GET_PATIENTS, { skip: !isAdmin });

    const users = [
       ...(doctorsData?.doctors || []),
       ...(patientsData?.patients || []),
    ];

    const handleUserSelection = (userId) => {
       setSelectedUserId(userId === "all" ? null : userId);
    };

    const getSelectedUserName = () => {
       if (!selectedUserId) return "All Users";
       const user = users.find((u) => u.id === selectedUserId);
       return user ? user.name : "All Users";
    };

    const getBadgeColor = (role) => {
       switch (role?.toLowerCase()) {
          case "admin": return "bg-red-500";
          case "doctor": return "bg-blue-500";
          case "patient": return "bg-green-500";
          default: return "bg-gray-500";
       }
    };

    const getGreeting = () => {
       switch (currentUser?.role?.toLowerCase()) {
          case "admin": return "Admin Dashboard";
          case "doctor": return "Doctor Portal";
          case "patient": return "Patient Portal";
          default: return "Welcome";
       }
    };

    return (
       <div className="min-h-screen flex flex-col bg-gray-100">
          <nav className="bg-blue-600 text-white">
             <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <span className="text-xl">📅</span>
                   <span className="font-bold text-lg">Scheduler</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right text-sm hidden md:block">
                      <div>{currentUser?.name || currentUser?.email?.split('@')[0] || 'User'}</div>
                      <div className="text-gray-200">{currentUser?.email}</div>
                   </div>
                   <span className={`px-2 py-1 text-xs rounded text-white ${getBadgeColor(currentUser?.role)}`}>
                      {currentUser?.role?.toUpperCase() || "USER"}
                   </span>
                   <button
                      onClick={logout}
                      className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100 text-sm"
                   >
                      Logout
                   </button>
                </div>
             </div>
          </nav>

          <main className="flex-1 py-6 px-4 mx-auto w-full max-w-[1000px]">
             <div className="mb-6">
               <div className="flex gap-2 justify-between w-full">
                 <div className="flex gap-2">
                   {["appointments","calendar"].map((tab) => (
                     <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-4 py-2 text-sm rounded ${activeTab === tab
                         ? "bg-white border border-gray-300"
                         : "bg-gray-200"
                       }`}
                     >
                       {tab === "appointments" && "📝 Appointments"}
                       {tab === "calendar" && "📅 Calendar"}
                     </button>
                   ))}
                 </div>

                 <div>
                   <button
                     onClick={() => setActiveTab("profile")}
                     className={`px-4 py-2 text-sm rounded ${activeTab === "profile"
                       ? "bg-white border border-gray-300"
                       : "bg-gray-200"
                     }`}
                   >
                     👤 Profile
                   </button>
                 </div>
               </div>
             </div>


             {isAdmin && activeTab === "profile" && (
                <div className="bg-white p-4 border rounded mb-6">
                   <div className="mb-2 font-semibold">Admin Controls</div>
                   <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">Select User:</label>
                      <select
                         value={selectedUserId || "all"}
                         onChange={(e) => handleUserSelection(e.target.value)}
                         className="px-2 py-1 border rounded text-sm"
                      >
                         <option value="all">All Users</option>
                         {users.map((user) => (
                            <option key={user.id} value={user.id}>
                               {user.name} ({user.role})
                            </option>
                         ))}
                      </select>
                   </div>
                </div>
             )}

             {activeTab === "calendar" && (
                <AppointmentCalendar
                   selectedUserId={isAdmin ? selectedUserId : currentUser?.id}
                />
             )}

             {activeTab === "profile" && (
                <div className="bg-white p-6 border rounded">
                   <h2 className="text-xl font-semibold mb-4">
                      {isAdmin && selectedUserId
                         ? `${getSelectedUserName()}'s Profile`
                         : isAdmin && !selectedUserId
                            ? "Admin Dashboard - System Overview"
                            : `${getGreeting()}: ${currentUser?.name || currentUser?.email}`}
                   </h2>

                   {isAdmin && !selectedUserId ? (
                      <div className="space-y-4">
                         <div className="bg-gray-100 p-4 rounded">
                            <h3 className="font-semibold mb-3">System Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                               <div className="bg-white p-3 rounded text-center">
                                  <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                                  <div className="text-gray-600">Total Users</div>
                               </div>
                               <div className="bg-white p-3 rounded text-center">
                                  <div className="text-2xl font-bold text-red-600">
                                     {users.filter((u) => u.role === "admin").length}
                                  </div>
                                  <div className="text-gray-600">Admins</div>
                               </div>
                               <div className="bg-white p-3 rounded text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                     {users.filter((u) => u.role === "doctor").length}
                                  </div>
                                  <div className="text-gray-600">Doctors</div>
                               </div>
                               <div className="bg-white p-3 rounded text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                     {users.filter((u) => u.role === "patient").length}
                                  </div>
                                  <div className="text-gray-600">Patients</div>
                               </div>
                            </div>
                         </div>
                      </div>
                   ) : (
                      (() => {
                         const displayUser =
                            isAdmin && selectedUserId
                               ? users.find((u) => u.id === selectedUserId)
                               : currentUser;

                         return displayUser ? (
                            <div className="space-y-3">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                     <p className="mb-2">
                                        <strong>Name:</strong> {displayUser.name || "Loading..."}
                                     </p>
                                     <p className="mb-2">
                                        <strong>Email:</strong> {displayUser.email}
                                     </p>
                                     <p className="mb-2">
                                        <strong>Role:</strong>
                                        <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${getBadgeColor(displayUser.role)}`}>
                                           {displayUser.role?.toUpperCase()}
                                        </span>
                                     </p>
                                  </div>
                                  <div>
                                     <p className="mb-2">
                                        <strong>User ID:</strong> {displayUser.id}
                                     </p>
                                     {displayUser.phoneNumber && (
                                        <p className="mb-2">
                                           <strong>Phone:</strong> {displayUser.phoneNumber}
                                        </p>
                                     )}
                                     {displayUser.age && (
                                        <p className="mb-2">
                                           <strong>Age:</strong> {displayUser.age}
                                        </p>
                                     )}
                                  </div>
                               </div>
                            </div>
                         ) : (
                            <div className="text-center p-4">
                               <p>Loading user profile...</p>
                            </div>
                         );
                      })()
                   )}
                </div>
             )}

             {activeTab === "appointments" && (
                <AppointmentsList
                   selectedUserId={isAdmin ? selectedUserId : currentUser?.id}
                />
             )}
          </main>
       </div>
    );
}

export default Dashboard;