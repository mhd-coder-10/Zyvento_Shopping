
// CAREERS PAGE
// Description: Careers page with open positions and company culture
// Features: Job listings, company benefits, application process


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiBriefcase,
    FiMapPin,
    FiClock,
    FiDollarSign,
    FiUsers,
    FiAward,
    FiGift,
    FiTrendingUp,
    FiChevronRight,
    FiMail,
    FiPhone,
    FiSearch
} from 'react-icons/fi';

const Careers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    const departments = [
        { id: 'all', name: 'All Departments' },
        { id: 'engineering', name: 'Engineering' },
        { id: 'design', name: 'Design' },
        { id: 'marketing', name: 'Marketing' },
        { id: 'sales', name: 'Sales' },
        { id: 'hr', name: 'Human Resources' },
    ];

    const jobs = [
        {
            id: 1,
            title: 'Senior Full Stack Developer',
            department: 'Engineering',
            location: 'Remote',
            type: 'Full-time',
            salary: '₹15L - ₹25L',
            posted: '2 days ago',
            description: 'Build scalable e-commerce solutions using React, Node.js, and MongoDB.',
        },
        {
            id: 2,
            title: 'UI/UX Designer',
            department: 'Design',
            location: 'Bangalore',
            type: 'Full-time',
            salary: '₹10L - ₹18L',
            posted: '3 days ago',
            description: 'Design beautiful and intuitive user experiences for millions of customers.',
        },
        {
            id: 3,
            title: 'Digital Marketing Manager',
            department: 'Marketing',
            location: 'Mumbai',
            type: 'Full-time',
            salary: '₹12L - ₹20L',
            posted: '5 days ago',
            description: 'Drive growth through SEO, social media, and content marketing strategies.',
        },
        {
            id: 4,
            title: 'Sales Executive',
            department: 'Sales',
            location: 'Delhi',
            type: 'Full-time',
            salary: '₹6L - ₹12L',
            posted: '1 week ago',
            description: 'Build relationships with brands and onboard them to our platform.',
        },
        {
            id: 5,
            title: 'HR Business Partner',
            department: 'HR',
            location: 'Hyderabad',
            type: 'Full-time',
            salary: '₹8L - ₹15L',
            posted: '1 week ago',
            description: 'Manage talent acquisition, employee engagement, and performance management.',
        },
    ];

    const benefits = [
        { icon: <FiUsers />, title: 'Great Culture', description: 'Collaborative and inclusive work environment' },
        { icon: <FiAward />, title: 'Learning & Growth', description: 'Continuous learning opportunities and career growth' },
        { icon: <FiGift />, title: 'Benefits & Perks', description: 'Health insurance, flexible hours, and more' },
        { icon: <FiTrendingUp />, title: 'Stock Options', description: 'Employee stock ownership plan' },
    ];

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = selectedDepartment === 'all' || job.department.toLowerCase() === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    return (
        <div className="space-y-12 pb-12">

            {/* ============ HERO SECTION ============ */}
            <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <FiUsers className="text-lg" />
                            We're Hiring!
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Join Our Team
                            <span className="block text-yellow-300">Build the Future of E-Commerce</span>
                        </h1>
                        <p className="text-lg text-white/80 mb-6 max-w-2xl">
                            Work with passionate people to create world-class shopping experiences for millions of customers.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="#openings"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:shadow-xl transition-all"
                            >
                                View Openings
                                <FiChevronRight />
                            </a>
                            <a
                                href="#culture"
                                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/50 text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
                            >
                                Learn About Culture
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ BENEFITS SECTION ============ */}
            <section id="culture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Why Join Us?</h2>
                    <p className="text-gray-500 mt-2">We care about our people and their growth</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 text-2xl">
                                {benefit.icon}
                            </div>
                            <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============ JOB OPENINGS ============ */}
            <section id="openings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Open Positions</h2>
                        <p className="text-gray-500 mt-1">Find your dream role</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        {filteredJobs.length} position{filteredJobs.length > 1 ? 's' : ''} available
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        />
                    </div>
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
                    >
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Job Cards */}
                <div className="space-y-4">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                            <Link to={`/careers/${job.id}`}>{job.title}</Link>
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">{job.description}</p>

                                        <div className="flex flex-wrap gap-4 mt-3">
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <FiBriefcase className="text-gray-400" />
                                                {job.department}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <FiMapPin className="text-gray-400" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <FiClock className="text-gray-400" />
                                                {job.type}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <FiDollarSign className="text-gray-400" />
                                                {job.salary}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                        <span className="text-xs text-gray-400">{job.posted}</span>
                                        <Link
                                            to={`/careers/${job.id}`}
                                            className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Apply Now
                                            <FiChevronRight />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-900">No positions found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filter</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ============ CONTACT SECTION ============ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-indigo-50 rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Don't see the right role?</h2>
                    <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                        Send us your resume and we'll reach out when a suitable position opens up.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                        <a
                            href="mailto:careers@ecommerce.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FiMail />
                            Send Resume
                        </a>
                        <a
                            href="tel:+12345678900"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                            <FiPhone />
                            Contact HR
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;