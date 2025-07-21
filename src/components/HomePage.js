import React from "react";
import LoginForm from "./LoginForm";

function HomePage() {
	return (
		<div className="min-h-screen flex flex-col bg-gray-100">
			<nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
				<div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<span className="text-2xl">📅</span>
						<h1 className="text-xl font-bold">Scheduler</h1>
					</div>
					<div className="hidden md:flex gap-4">
						<a href="#dashboard" className="hover:underline">
							Dashboard
						</a>
						<a href="#calendar" className="hover:underline">
							Calendar
						</a>
						<a href="#appointments" className="hover:underline">
							Appointments
						</a>
					</div>
				</div>
			</nav>

			<main className="flex-1 py-8 px-4">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-10">
						<h2 className="text-3xl font-bold text-gray-800">Scheduler App</h2>
						<p className="text-gray-500 text-sm">
							A simple appointment management system
						</p>
					</div>

					<LoginForm />
				</div>
			</main>

			<footer className="bg-gray-800 text-gray-300 text-center py-4 mt-auto">
				<p className="text-sm">
					&copy; 2025 Scheduler App. All rights reserved.
				</p>
			</footer>
		</div>
	);
}

export default HomePage;