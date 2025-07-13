import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../apollo/queries';
import { useAuth } from '../context/AuthContext';

function UserList() {
  const { loading, error, data } = useQuery(GET_USERS);
  const { login } = useAuth();

  if (loading) return (
    <div className="text-center py-16 px-5">
      <h3 className="text-slate-600 font-semibold text-xl">Loading users from backend</h3>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 mx-5">
      <h3 className="text-red-700 font-bold mb-4">Connection Error</h3>
      <p className="text-red-800 mb-3"><strong>Error:</strong> {error.message}</p>
    </div>
  );

  const handleUserClick = (user) => {
    login(user);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-br from-slate-50 to-slate-200 p-8 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          System Users
        </h2>
        <p className="text-slate-600">Click on any user to login as them</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 p-8 min-[350px]:grid-cols-1">
        {data.users.map((user, index) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            className={`
              bg-white border border-slate-200 rounded-lg p-5 transition-all duration-200 relative overflow-hidden cursor-pointer
              hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 hover:scale-105
              ${user.role === 'admin' ? 'bg-gradient-to-br from-blue-50 to-sky-50 border-sky-300' : ''}
              animate-[fadeInUp_0.5s_ease-out]
              ${index % 2 === 0 ? '[animation-delay:0.1s]' : '[animation-delay:0.2s]'}
            `}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="text-lg font-semibold text-slate-800 mb-1">
                  {user.name}
                </div>
                <div className="text-slate-600 text-[15px] flex items-center gap-1.5 mb-2">
                  {user.email}
                </div>
                <span className={`
                  inline-block px-2.5 py-1 rounded-xl text-xs font-semibold uppercase tracking-wide
                  ${user.role === 'admin'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                    : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                  }
                `}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;