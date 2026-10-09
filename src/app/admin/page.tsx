"use client";

import { useEffect, useState } from 'react';
import { fetchCourses, seedDummyCourses, addVideoLesson, getAllUsers, toggleUserAccess, getUserDetailsForAdmin, toggleEnrollmentAccess, grantFreeCourse, toggleUserRole, createCourse, updateCourse, deleteCourse, fetchCoupons, createCoupon, deleteCoupon, getDashboardStats, fetchCareerOpportunities, createCareerOpportunity, deleteCareerOpportunity, getCurrentUser } from '@/app/actions';
import SettingsClient from '@/app/settings/SettingsClient';
import { ComposedChart, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import styles from './admin.module.css';

interface Course {
  id: number;
  title: string;
  category: string;
  instructor: string;
  price: number;
  discountedPrice?: number | null;
  discountEndsAt?: string | Date | null;
  description: string;
  thumbnailUrl: string;
  lessons?: { id: number, title: string, videoUrl: string }[];
}

interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  maxUses: number;
  usesCount: number;
  isActive: boolean;
  createdAt: Date;
}

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'coupons' | 'careers' | 'dashboard' | 'settings'>('courses');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEnrollments: 0, totalUsersEnrolled: 0, totalRevenue: 0, totalCouponDiscount: 0, totalOfferDiscount: 0, daywiseData: [] as any[], weekwiseData: [] as any[], monthwiseData: [] as any[], trendingCourses: [] as any[] });
  const [trendType, setTrendType] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [selectedCourseToGrant, setSelectedCourseToGrant] = useState<string>('');

  // States for adding a video
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!adminUser) {
        const u = await getCurrentUser();
        if (u.success) setAdminUser(u.user);
      }
      if (activeTab === 'dashboard') {
        const result = await getDashboardStats(timeFilter);
        if (result.success) setStats(result.stats);
        else throw new Error(result.error);
      } else if (activeTab === 'courses') {
        const result = await fetchCourses();
        if (result.success) setCourses(result.courses || []);
        else throw new Error(result.error);
      } else if (activeTab === 'users') {
        const result = await getAllUsers();
        if (result.success) setUsers(result.users as any || []);
        else throw new Error(result.error);
      } else if (activeTab === 'coupons') {
        const result = await fetchCoupons();
        if (result.success) setCoupons(result.coupons as any || []);
        else throw new Error(result.error);
      } else if (activeTab === 'careers') {
        const result = await fetchCareerOpportunities();
        if (result.success) setOpportunities(result.opportunities || []);
        else throw new Error(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data. Ensure your SQL Server database is running.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab, timeFilter]);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      setError(null);
      const result = await seedDummyCourses();
      if (!result.success) throw new Error(result.error);
      
      alert('Dummy courses and SQL concept videos successfully added!');
      loadData();
    } catch (err: any) {
      console.error(err);
      setError(`Insert failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      setIsAddingLesson(true);
      const result = await addVideoLesson(selectedCourseId, lessonTitle, videoUrl);
      if (!result.success) throw new Error(result.error);
      
      alert('Video lesson added successfully!');
      setLessonTitle('');
      setVideoUrl('');
      setSelectedCourseId(null);
      loadData();
    } catch (err: any) {
      alert(`Error adding lesson: ${err.message}`);
    } finally {
      setIsAddingLesson(false);
    }
  };

  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', category: '', instructor: '', price: 5000, description: '', imageUrl: '' });
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingCourse(true);
      const result = await createCourse(newCourse);
      if (!result.success) throw new Error(result.error);
      
      alert('Course created successfully!');
      setNewCourse({ title: '', category: '', instructor: '', price: 5000, description: '', imageUrl: '' });
      setShowAddCourse(false);
      loadData();
    } catch (err: any) {
      alert(`Error creating course: ${err.message}`);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      setIsUpdatingCourse(true);
      const payload: any = {
        title: editingCourse.title,
        category: editingCourse.category,
        instructor: editingCourse.instructor,
        price: editingCourse.price,
        description: editingCourse.description,
        thumbnailUrl: editingCourse.thumbnailUrl
      };
      if (editingCourse.discountedPrice !== undefined) {
        payload.discountedPrice = editingCourse.discountedPrice || null;
      }
      if (editingCourse.discountEndsAt !== undefined) {
        payload.discountEndsAt = editingCourse.discountEndsAt ? new Date(editingCourse.discountEndsAt) : null;
      }
      const result = await updateCourse(editingCourse.id, payload);
      if (!result.success) throw new Error(result.error);
      
      alert('Course updated successfully!');
      setEditingCourse(null);
      loadData();
    } catch (err: any) {
      alert(`Error updating course: ${err.message}`);
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to dismiss this course?')) return;
    try {
      const result = await deleteCourse(courseId);
      if (!result.success) throw new Error(result.error);
      alert('Course dismissed successfully!');
      loadData();
    } catch (err: any) {
      alert(`Error deleting course: ${err.message}`);
    }
  };

  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 10, maxUses: 100 });
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingCoupon(true);
      const result = await createCoupon(newCoupon.code, newCoupon.discountPercent, newCoupon.maxUses);
      if (!result.success) throw new Error(result.error);
      alert('Coupon created successfully!');
      setNewCoupon({ code: '', discountPercent: 10, maxUses: 100 });
      setShowAddCoupon(false);
      loadData();
    } catch (err: any) {
      alert(`Error creating coupon: ${err.message}`);
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const result = await deleteCoupon(couponId);
      if (!result.success) throw new Error(result.error);
      alert('Coupon deleted successfully!');
      loadData();
    } catch (err: any) {
      alert(`Error deleting coupon: ${err.message}`);
    }
  };

  const [showAddCareer, setShowAddCareer] = useState(false);
  const [newCareer, setNewCareer] = useState({ title: '', type: 'Full-time • Remote', description: '' });
  const [isCreatingCareer, setIsCreatingCareer] = useState(false);

  const handleCreateCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingCareer(true);
      const result = await createCareerOpportunity(newCareer.title, newCareer.type, newCareer.description);
      if (!result.success) throw new Error(result.error);
      alert('Career opportunity created successfully!');
      setNewCareer({ title: '', type: 'Full-time • Remote', description: '' });
      setShowAddCareer(false);
      loadData();
    } catch (err: any) {
      alert(`Error creating career opportunity: ${err.message}`);
    } finally {
      setIsCreatingCareer(false);
    }
  };

  const handleDeleteCareer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      const result = await deleteCareerOpportunity(id);
      if (!result.success) throw new Error(result.error);
      alert('Career opportunity deleted successfully!');
      loadData();
    } catch (err: any) {
      alert(`Error deleting opportunity: ${err.message}`);
    }
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <img src="https://www.simdaa.com/wp-content/uploads/2026/07/Simdaa_Logo_FullColor-2.png" alt="Simdaa Logo" style={{ height: '32px' }} />
        </div>
        <nav className={styles.navMenu}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }} className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}>Dashboard</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('courses'); }} className={`${styles.navItem} ${activeTab === 'courses' ? styles.navItemActive : ''}`}>Courses</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('users'); }} className={`${styles.navItem} ${activeTab === 'users' ? styles.navItemActive : ''}`}>Users</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('coupons'); }} className={`${styles.navItem} ${activeTab === 'coupons' ? styles.navItemActive : ''}`}>Coupons</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('careers'); }} className={`${styles.navItem} ${activeTab === 'careers' ? styles.navItemActive : ''}`}>Careers</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }} className={`${styles.navItem} ${activeTab === 'settings' ? styles.navItemActive : ''}`}>Settings</a>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <h1 className={styles.pageTitle}>
            {activeTab === 'courses' ? 'Course Management' : activeTab === 'users' ? 'User Management' : activeTab === 'coupons' ? 'Coupon Management' : activeTab === 'careers' ? 'Instructor Careers' : 'Analytics Dashboard'}
          </h1>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <span>Admin User</span>
          </div>
        </header>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Sales & Enrollment Report</h2>
                  <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>PowerBI-style live metrics overview</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <select 
                    value={timeFilter} 
                    onChange={(e) => setTimeFilter(e.target.value)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="thisWeek">This Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="prevMonth">Previous Month</option>
                    <option value="thisYear">This Year</option>
                  </select>
                  <button onClick={loadData} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    Refresh Data
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Total Enrolled Courses</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.totalEnrollments}</div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>across all categories</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Unique Enrolled Users</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{stats.totalUsersEnrolled}</div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>active learners</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Total Payment Received</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>estimated gross revenue</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Total Coupon Discount Given</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹{stats.totalCouponDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>from used coupons</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(236, 72, 153, 0.3)' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 500, opacity: 0.9 }}>Total Offer Discount Given</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>₹{stats.totalOfferDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.8 }}>from course sale prices</div>
                </div>
              </div>

              {/* PowerBI-style Charts */}
              {stats.daywiseData && stats.daywiseData.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                  
                  {/* Revenue & Sales Trend */}
                  <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Sales & Revenue Trend</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['day', 'week', 'month'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => setTrendType(type)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              border: `1px solid ${trendType === type ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                              background: trendType === type ? 'var(--accent-primary)' : 'transparent',
                              color: trendType === type ? '#fff' : 'var(--text-secondary)',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textTransform: 'capitalize'
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ height: '350px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart 
                          data={trendType === 'day' ? stats.daywiseData : trendType === 'week' ? stats.weekwiseData : stats.monthwiseData} 
                          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                          <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip 
                            contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            formatter={(value, name) => [name === 'Revenue' ? `₹${value}` : value, name]}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-primary)' }}/>
                          <Bar yAxisId="right" dataKey="sales" name="Sales (Count)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                          <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Trending Courses */}
                  <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Trending Courses in Sales</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats.trendingCourses} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                          <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis dataKey="title" type="category" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} width={120} />
                          <RechartsTooltip 
                            contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            formatter={(value) => [value, 'Sales']}
                          />
                          <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Discount Distribution */}
                  <div style={{ padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Revenue vs Discounts</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={(stats.totalRevenue > 0 || stats.totalCouponDiscount > 0 || stats.totalOfferDiscount > 0) ? [
                              { name: 'Net Revenue', value: stats.totalRevenue },
                              { name: 'Coupon Discounts', value: stats.totalCouponDiscount },
                              { name: 'Offer Discounts', value: stats.totalOfferDiscount }
                            ] : [{ name: 'No Data', value: 1 }]}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(stats.totalRevenue > 0 || stats.totalCouponDiscount > 0 || stats.totalOfferDiscount > 0) ? [
                              <Cell key="net" fill="#3b82f6" />,
                              <Cell key="coupon" fill="#ec4899" />,
                              <Cell key="offer" fill="#f59e0b" />
                            ] : [
                              <Cell key="nodata" fill="var(--border-color)" />
                            ]}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                            formatter={(value) => [`₹${value}`, 'Amount']}
                          />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--text-primary)' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ marginTop: '2rem', height: '300px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  <p>Detailed temporal charts will appear here as more data points are collected.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statTitle}>Total Courses</span>
                <span className={styles.statValue}>{courses.length}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statTitle}>Active Instructors</span>
                <span className={styles.statValue}>{new Set(courses.map(c => c.instructor)).size}</span>
              </div>
            </div>

            {selectedCourseId && (
              <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <h3>Add Video Lesson</h3>
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  Adding video to course ID: {selectedCourseId}
                </p>
                <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Lesson Title</label>
                    <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-primary)' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Video URL (YouTube/Vimeo)</label>
                    <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--text-primary)' }}/>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" disabled={isAddingLesson} style={{ background: 'var(--accent-color)', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      {isAddingLesson ? 'Saving...' : 'Save Lesson'}
                    </button>
                    <button type="button" onClick={() => setSelectedCourseId(null)} style={{ background: 'transparent', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showAddCourse && (
              <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <h3>Create New Course</h3>
                <form onSubmit={handleCreateCourse} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course Title</label>
                    <input type="text" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <input type="text" value={newCourse.category} onChange={(e) => setNewCourse({...newCourse, category: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Instructor</label>
                    <input type="text" value={newCourse.instructor} onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price (₹)</label>
                    <input type="number" value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value)})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                    <textarea value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '80px' }}></textarea>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL</label>
                    <input type="url" value={newCourse.imageUrl} onChange={(e) => setNewCourse({...newCourse, imageUrl: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 2' }}>
                    <button type="submit" disabled={isCreatingCourse} style={{ background: 'var(--accent-color)', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      {isCreatingCourse ? 'Creating...' : 'Create Course'}
                    </button>
                    <button type="button" onClick={() => setShowAddCourse(false)} style={{ background: 'transparent', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {editingCourse && (
              <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <h3>Edit Course</h3>
                <form onSubmit={handleUpdateCourse} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Course Title</label>
                    <input type="text" value={editingCourse.title} onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <input type="text" value={editingCourse.category} onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Instructor</label>
                    <input type="text" value={editingCourse.instructor} onChange={(e) => setEditingCourse({...editingCourse, instructor: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price (₹)</label>
                    <input type="number" value={editingCourse.price} onChange={(e) => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Discounted Price (₹) (Optional)</label>
                    <input type="number" value={editingCourse.discountedPrice || ''} onChange={(e) => setEditingCourse({...editingCourse, discountedPrice: e.target.value ? parseFloat(e.target.value) : null})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Discount Ends At (Optional)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="datetime-local" 
                        value={editingCourse.discountEndsAt ? new Date(new Date(editingCourse.discountEndsAt).getTime() - new Date(editingCourse.discountEndsAt).getTimezoneOffset() * 60000).toISOString().slice(0,16) : ''} 
                        onChange={(e) => setEditingCourse({...editingCourse, discountEndsAt: e.target.value || null})} 
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black' }}
                      />
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                    <textarea value={editingCourse.description} onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black', minHeight: '80px' }}></textarea>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL</label>
                    <input type="url" value={editingCourse.thumbnailUrl} onChange={(e) => setEditingCourse({...editingCourse, thumbnailUrl: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid black' }}/>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 2', marginTop: '1rem' }}>
                    <button type="submit" disabled={isUpdatingCourse} style={{ background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
                      {isUpdatingCourse ? 'Updating...' : 'Submit / Done'}
                    </button>
                    <button type="button" onClick={() => setEditingCourse(null)} style={{ background: '#f3f4f6', color: '#374151', padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '1rem' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>All Courses (SQL Server)</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => setShowAddCourse(true)}
                  >
                    + Create Course
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                    onClick={handleSeedData}
                    disabled={isSeeding}
                  >
                    {isSeeding ? 'Seeding...' : 'Add Dummy Courses'}
                  </button>
                </div>
              </div>
              
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Instructor</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Loading database...</td>
                    </tr>
                  ) : courses.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No courses found. Click "Add Dummy Courses" to seed the database!
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id}>
                        <td style={{ fontWeight: 500 }}>
                          <div>{course.title}</div>
                          {course.lessons && course.lessons.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              <strong>Videos:</strong>
                              <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
                                {course.lessons.map(lesson => (
                                  <li key={lesson.id}><a href={lesson.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>{lesson.title}</a></li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                        <td>{course.category}</td>
                        <td>{course.instructor}</td>
                        <td>
                          {course.discountedPrice && course.discountEndsAt && new Date(course.discountEndsAt) > new Date() ? (
                            <div>
                              <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                ₹{course.discountedPrice.toFixed(2)}
                                <span style={{ background: '#dcfce3', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  {Math.round(((course.price - course.discountedPrice) / course.price) * 100)}% OFF
                                </span>
                              </div>
                              <div style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{course.price.toFixed(2)}</div>
                              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                                Ends {new Date(course.discountEndsAt).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <div>₹{course.price.toFixed(2)}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => setSelectedCourseId(course.id)}
                              style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              + Add Video
                            </button>
                            <button 
                              onClick={() => setEditingCourse(course)}
                              style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #d97706', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCourse(course.id)}
                              style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>All Users & Admins (SQL Server)</h2>
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No users found. Sign up on the main page first!
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: 500 }}>#{user.id}</td>
                      <td>{user.fullName || 'N/A'}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={styles.badge} style={{ 
                          background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', 
                          color: user.role === 'admin' ? '#ef4444' : '#3b82f6' 
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={styles.badge} style={{ 
                          background: user.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                          color: user.isActive ? '#10b981' : '#6b7280'
                        }}>
                          {user.isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={async () => {
                              const result = await toggleUserAccess(user.id, user.isActive);
                              if (result.success) loadData();
                              else alert('Failed to toggle access');
                            }}
                            style={{ background: 'transparent', color: user.isActive ? '#ef4444' : '#10b981', border: `1px solid ${user.isActive ? '#ef4444' : '#10b981'}`, padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            {user.isActive ? 'Revoke Access' : 'Grant Access'}
                          </button>
                          
                          <button 
                            onClick={async () => {
                              if (confirm(`Are you sure you want to make ${user.email} a ${user.role === 'admin' ? 'student' : 'admin'}?`)) {
                                const result = await toggleUserRole(user.id, user.role);
                                if (result.success) loadData();
                                else alert('Failed to change role');
                              }
                            }}
                            style={{ background: 'transparent', color: user.role === 'admin' ? '#f59e0b' : '#8b5cf6', border: `1px solid ${user.role === 'admin' ? '#f59e0b' : '#8b5cf6'}`, padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                          </button>

                          <button 
                            onClick={async () => {
                              setUserDetailsLoading(true);
                              const result = await getUserDetailsForAdmin(user.id);
                              setUserDetailsLoading(false);
                              if (result.success) {
                                setSelectedUserForDetails(result);
                              } else {
                                alert(`Failed to load user details: ${result.error}`);
                              }
                            }}
                            style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            View Courses
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* User Details Modal */}
          {selectedUserForDetails && (
            <div onClick={() => setSelectedUserForDetails(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>User Details: {selectedUserForDetails.user.fullName || 'N/A'}</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>{selectedUserForDetails.user.email}</p>
                  </div>
                  <button onClick={() => setSelectedUserForDetails(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Paid Till Date</h4>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{selectedUserForDetails.totalPaid.toFixed(2)}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Discount Earned</h4>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>₹{selectedUserForDetails.totalDiscountEarned.toFixed(2)}</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enrolled Courses</h4>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{selectedUserForDetails.enrollments.length}</div>
                  </div>
                </div>

                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Course Access Management</h3>
                {selectedUserForDetails.enrollments.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No courses enrolled yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUserForDetails.enrollments.map((enrollment: any) => (
                      <div key={enrollment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{enrollment.course.title}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()} | Price Paid: ₹{(enrollment.pricePaid || 0).toFixed(2)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: enrollment.isActive ? '#10b981' : '#ef4444' }}>
                            {enrollment.isActive ? 'Active' : 'Revoked'}
                          </span>
                          <button
                            onClick={async () => {
                              const result = await toggleEnrollmentAccess(enrollment.id, enrollment.isActive);
                              if (result.success) {
                                // Refresh modal data
                                const updatedResult = await getUserDetailsForAdmin(selectedUserForDetails.user.id);
                                if (updatedResult.success) setSelectedUserForDetails(updatedResult);
                              } else {
                                alert(`Error: ${result.error}`);
                              }
                            }}
                            style={{
                              background: enrollment.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: enrollment.isActive ? '#ef4444' : '#10b981',
                              border: '1px solid currentColor', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                            }}
                          >
                            {enrollment.isActive ? 'Revoke Access' : 'Grant Access'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Grant Free Course</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                  <select 
                    value={selectedCourseToGrant}
                    onChange={(e) => setSelectedCourseToGrant(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  >
                    <option value="">-- Select a Course to Grant --</option>
                    {selectedUserForDetails.allCourses?.map((c: any) => {
                      const isAlreadyEnrolled = selectedUserForDetails.enrollments.some((e: any) => e.courseId === c.id);
                      return (
                        <option key={c.id} value={c.id} disabled={isAlreadyEnrolled}>
                          {c.title} {isAlreadyEnrolled ? '(Already Enrolled)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <button 
                    onClick={async () => {
                      if (!selectedCourseToGrant) return alert('Please select a course');
                      const result = await grantFreeCourse(selectedUserForDetails.user.id, parseInt(selectedCourseToGrant));
                      if (result.success) {
                        alert('Course granted successfully!');
                        setSelectedCourseToGrant('');
                        // Refresh modal data
                        const updatedResult = await getUserDetailsForAdmin(selectedUserForDetails.user.id);
                        if (updatedResult.success) setSelectedUserForDetails(updatedResult);
                      } else {
                        alert(`Failed to grant course: ${result.error}`);
                      }
                    }}
                    disabled={!selectedCourseToGrant}
                    style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: selectedCourseToGrant ? 'pointer' : 'not-allowed', opacity: selectedCourseToGrant ? 1 : 0.6 }}
                  >
                    Grant Course
                  </button>
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setSelectedUserForDetails(null)} 
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.75rem 2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'background 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--border-color)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  >
                    Go Back / Close
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )}

        {activeTab === 'coupons' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Discount Coupons</h2>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setShowAddCoupon(!showAddCoupon)}
              >
                + Create Coupon
              </button>
            </div>

            {showAddCoupon && (
              <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <h3>Generate New Coupon</h3>
                <form onSubmit={handleCreateCoupon} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Coupon Code (e.g. SUMMER50)</label>
                    <input type="text" value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Discount Percentage (%)</label>
                    <input type="number" min="1" max="100" value={newCoupon.discountPercent} onChange={(e) => setNewCoupon({...newCoupon, discountPercent: parseInt(e.target.value)})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Max Uses</label>
                    <input type="number" min="1" value={newCoupon.maxUses} onChange={(e) => setNewCoupon({...newCoupon, maxUses: parseInt(e.target.value)})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 3' }}>
                    <button type="submit" disabled={isCreatingCoupon} style={{ background: 'var(--accent-color)', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      {isCreatingCoupon ? 'Generating...' : 'Generate Coupon'}
                    </button>
                    <button type="button" onClick={() => setShowAddCoupon(false)} style={{ background: 'transparent', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <table className={styles.table} style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Uses</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading coupons...</td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No coupons found. Create one above!
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{coupon.code}</td>
                      <td>{coupon.discountPercent}%</td>
                      <td>{coupon.usesCount} / {coupon.maxUses}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.85rem',
                          background: coupon.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: coupon.isActive ? '#16a34a' : '#ef4444'
                        }}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(coupon.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'careers' && (
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Manage Instructor Careers</h2>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setShowAddCareer(!showAddCareer)}
              >
                + Add Opportunity
              </button>
            </div>

            {showAddCareer && (
              <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <h3>Create New Career Opportunity</h3>
                <form onSubmit={handleCreateCareer} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Title</label>
                    <input type="text" value={newCareer.title} onChange={(e) => setNewCareer({...newCareer, title: e.target.value})} required placeholder="e.g. Lead Data Science Instructor" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Job Type</label>
                    <input type="text" value={newCareer.type} onChange={(e) => setNewCareer({...newCareer, type: e.target.value})} required placeholder="e.g. Full-time • Remote" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}/>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description (Optional)</label>
                    <textarea value={newCareer.description} onChange={(e) => setNewCareer({...newCareer, description: e.target.value})} placeholder="Short description..." style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', minHeight: '60px' }}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 2' }}>
                    <button type="submit" disabled={isCreatingCareer} style={{ background: 'var(--accent-color)', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                      {isCreatingCareer ? 'Creating...' : 'Create Opportunity'}
                    </button>
                    <button type="button" onClick={() => setShowAddCareer(false)} style={{ background: 'transparent', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <table className={styles.table} style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Job Title</th>
                  <th>Job Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Loading careers...</td>
                  </tr>
                ) : opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                      No opportunities found. Create one above!
                    </td>
                  </tr>
                ) : (
                  opportunities.map((opp) => (
                    <tr key={opp.id}>
                      <td>#{opp.id}</td>
                      <td style={{ fontWeight: 'bold' }}>{opp.title}</td>
                      <td>{opp.type}</td>
                      <td>{opp.description || '-'}</td>
                      <td>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.85rem',
                          background: opp.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: opp.isActive ? '#16a34a' : '#ef4444'
                        }}>
                          {opp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(opp.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDeleteCareer(opp.id)}
                          style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #ef4444', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className={styles.tableContainer} style={{ background: 'transparent', boxShadow: 'none' }}>
            <div className={styles.tableHeader} style={{ background: 'transparent' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Admin Account Settings</h2>
            </div>
            {adminUser ? (
              <div style={{ maxWidth: '600px' }}>
                <SettingsClient user={adminUser} />
              </div>
            ) : (
              <p>Loading user data...</p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
