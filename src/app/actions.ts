'use server';

import prisma from '@/lib/db';
import { dummyCourses } from '@/lib/dummyData';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import { redirect } from 'next/navigation';

// --- AUTH ACTIONS ---

export async function signup(email, password, fullName, role = 'student') {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, error: 'Email already exists' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role
      }
    });

    // Simple session setting
    const cookieStore = await cookies();
    cookieStore.set('session_id', user.id.toString(), { httpOnly: true, path: '/' });

    return { success: true, user: { id: user.id, email: user.email, role: user.role } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function login(email, password) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'Invalid email or password' };

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { success: false, error: 'Invalid email or password' };

    if (!user.isActive) return { success: false, error: 'Your account has been deactivated.' };

    // Simple session setting
    const cookieStore = await cookies();
    cookieStore.set('session_id', user.id.toString(), { httpOnly: true, path: '/' });

    return { success: true, user: { id: user.id, email: user.email, role: user.role, isActive: user.isActive } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete({ name: 'session_id', path: '/' });
  cookieStore.set('session_id', '', { maxAge: 0, path: '/' }); // Extra safe
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    if (!sessionId) return { success: true, user: null };

    const user = await prisma.user.findUnique({
      where: { id: parseInt(sessionId) },
      select: { id: true, email: true, fullName: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) return { success: true, user: null };

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleUserAccess(userId: number, currentStatus: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserDetailsForAdmin(userId: number) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: 'User not found' };

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { enrolledAt: 'desc' }
    });

    let totalPaid = 0;
    let totalDiscountEarned = 0;

    enrollments.forEach(e => {
      let pricePaid = e.pricePaid || 0;
      let couponDiscount = e.discount || 0;

      if (pricePaid === 0 && couponDiscount === 0 && e.course.price > 0) {
        pricePaid = e.course.price;
      }

      totalPaid += pricePaid;

      let offerDiscount = 0;
      const actualBasePriceUsed = pricePaid + couponDiscount;
      if (e.course.price > actualBasePriceUsed) {
        offerDiscount = e.course.price - actualBasePriceUsed;
      }

      totalDiscountEarned += (couponDiscount + offerDiscount);
    });

    const allCourses = await prisma.course.findMany({
      select: { id: true, title: true, price: true, discountedPrice: true },
      orderBy: { title: 'asc' }
    });

    return {
      success: true,
      user,
      enrollments,
      totalPaid,
      totalDiscountEarned,
      allCourses
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleEnrollmentAccess(enrollmentId: number, currentStatus: boolean) {
  try {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { isActive: !currentStatus }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function grantFreeCourse(userId: number, courseId: number) {
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, error: 'Course not found' };

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });

    if (existingEnrollment) {
      if (!existingEnrollment.isActive) {
        // If they have a revoked enrollment, just reactivate it
        await prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { isActive: true }
        });
        revalidatePath('/admin');
        revalidatePath('/my-courses');
        return { success: true, message: 'Existing enrollment reactivated' };
      }
      return { success: false, error: 'User is already enrolled in this course' };
    }

    await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        pricePaid: 0,
        discount: course.price, // 100% discount
        isActive: true
      }
    });

    revalidatePath('/admin');
    revalidatePath('/my-courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleUserRole(userId: number, currentRole: string) {
  try {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserEnrollments(userId: number) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }
    });
    return { success: true, enrollments };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDashboardStats(timeFilter: string = 'all') {
  try {
    let dateFilter = {};
    const now = new Date();

    if (timeFilter === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: startOfMonth };
    } else if (timeFilter === 'prevMonth') {
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      dateFilter = { gte: startOfPrevMonth, lte: endOfPrevMonth };
    } else if (timeFilter === 'thisYear') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { gte: startOfYear };
    } else if (timeFilter === 'thisWeek') {
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      dateFilter = { gte: startOfWeek };
    } else if (timeFilter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: startOfDay };
    } else if (timeFilter === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      dateFilter = { gte: startOfYesterday, lte: endOfYesterday };
    }

    const enrollments = await prisma.enrollment.findMany({
      where: timeFilter !== 'all' ? { enrolledAt: dateFilter } : undefined,
      include: { course: true }
    });

    const totalEnrollments = enrollments.length;

    // Unique users who have enrolled in at least one course
    const uniqueUsersSet = new Set(enrollments.map(e => e.userId));
    const totalUsersEnrolled = uniqueUsersSet.size;

    // Sum pricePaid and discount from the new schema
    let totalRevenue = 0;
    let totalCouponDiscount = 0;
    let totalOfferDiscount = 0;

    // Day-wise revenue and sales for the last 7 days
    const daywiseData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        date: dateString,
        label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: 0,
        sales: 0
      };
    }).reverse();

    // Week-wise revenue and sales for the last 4 weeks
    const weekwiseData = Array.from({ length: 4 }).map((_, i) => {
      const endD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
      const startD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7) - 6);
      return {
        start: startD,
        end: endD,
        label: i === 0 ? 'This Week' : `${i} Wk Ago`,
        revenue: 0,
        sales: 0
      };
    }).reverse();

    // Month-wise revenue and sales for the last 6 months
    const monthwiseData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        month: d.getMonth(),
        year: d.getFullYear(),
        label: d.toLocaleDateString('en-US', { month: 'short' }) + (now.getFullYear() !== d.getFullYear() ? ` '${d.getFullYear().toString().slice(2)}` : ''),
        revenue: 0,
        sales: 0
      };
    }).reverse();

    // Add trending courses aggregation
    const courseSalesMap: Record<number, { title: string, sales: number, revenue: number }> = {};

    for (const e of enrollments) {
      let pricePaid = e.pricePaid || 0;
      let couponDiscount = e.discount || 0;

      // Legacy data fallback: if both are exactly 0 but course has a price, assume they paid full price
      if (pricePaid === 0 && couponDiscount === 0 && e.course.price > 0) {
        pricePaid = e.course.price;
      }

      totalRevenue += pricePaid;
      totalCouponDiscount += couponDiscount;

      const actualBasePriceUsed = pricePaid + couponDiscount;
      if (e.course.price > actualBasePriceUsed) {
        totalOfferDiscount += (e.course.price - actualBasePriceUsed);
      }

      // Add to daywise data if it falls within the last 7 days
      const enrolledDate = new Date(e.enrolledAt);
      const dateStr = `${enrolledDate.getFullYear()}-${String(enrolledDate.getMonth() + 1).padStart(2, '0')}-${String(enrolledDate.getDate()).padStart(2, '0')}`;
      const dayStats = daywiseData.find(d => d.date === dateStr);
      if (dayStats) {
        dayStats.revenue += pricePaid;
        dayStats.sales += 1;
      }

      // Add to weekwise data
      const weekStats = weekwiseData.find(w => enrolledDate >= w.start && enrolledDate <= new Date(w.end.getTime() + 86400000));
      if (weekStats) {
        weekStats.revenue += pricePaid;
        weekStats.sales += 1;
      }

      // Add to monthwise data
      const monthStats = monthwiseData.find(m => m.month === enrolledDate.getMonth() && m.year === enrolledDate.getFullYear());
      if (monthStats) {
        monthStats.revenue += pricePaid;
        monthStats.sales += 1;
      }

      // Add to trending courses
      if (!courseSalesMap[e.courseId]) {
        courseSalesMap[e.courseId] = { title: e.course.title, sales: 0, revenue: 0 };
      }
      courseSalesMap[e.courseId].sales += 1;
      courseSalesMap[e.courseId].revenue += pricePaid;
    }

    const trendingCourses = Object.values(courseSalesMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return { success: true, stats: { totalEnrollments, totalUsersEnrolled, totalRevenue, totalCouponDiscount, totalOfferDiscount, daywiseData, weekwiseData, monthwiseData, trendingCourses } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- COURSE ACTIONS ---

export async function fetchCourses() {
  try {
    const courses = await prisma.course.findMany({
      include: { lessons: true },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, courses };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function seedDummyCourses() {
  try {
    await prisma.course.createMany({
      data: dummyCourses,
    });

    // Add dummy SQL concepts videos to the SQL course
    const sqlCourse = await prisma.course.findFirst({
      where: { title: { contains: 'SQL Database' } }
    });

    if (sqlCourse) {
      await prisma.lesson.createMany({
        data: [
          { courseId: sqlCourse.id, title: "Introduction to SQL", videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", orderIndex: 1 },
          { courseId: sqlCourse.id, title: "SELECT Queries and Filtering", videoUrl: "https://www.youtube.com/watch?v=27axs9dO7AE", orderIndex: 2 },
          { courseId: sqlCourse.id, title: "JOINS and Relationships", videoUrl: "https://www.youtube.com/watch?v=9yeOJ0ZMUYw", orderIndex: 3 }
        ]
      });
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addVideoLesson(courseId: number, title: string, videoUrl: string) {
  try {
    await prisma.lesson.create({
      data: {
        courseId,
        title,
        videoUrl,
        orderIndex: 1, // simplified for now
      }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCourse(data: { title: string, description: string, price: number, discountedPrice?: number | null, discountEndsAt?: Date | null, category: string, instructor: string, imageUrl: string }) {
  try {
    const createData: any = { ...data };
    // Map imageUrl to thumbnailUrl for prisma schema compatibility if needed, though they should match
    if (createData.imageUrl) {
      createData.thumbnailUrl = createData.imageUrl;
      delete createData.imageUrl;
    }
    await prisma.course.create({ data: createData });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCourse(id: number, data: { title?: string, description?: string, price?: number, discountedPrice?: number | null, discountEndsAt?: Date | null, category?: string, instructor?: string, thumbnailUrl?: string }) {
  try {
    await prisma.course.update({
      where: { id },
      data,
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCourse(courseId: number) {
  try {
    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- COUPON ACTIONS ---

export async function fetchCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, coupons };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCoupon(code: string, discountPercent: number, maxUses: number) {
  try {
    await prisma.coupon.create({
      data: {
        code,
        discountPercent,
        maxUses
      }
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(couponId: number) {
  try {
    await prisma.coupon.delete({ where: { id: couponId } });
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- CART & WISHLIST ACTIONS ---

export async function addToCart(courseId: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    await prisma.cartItem.create({
      data: {
        userId: user.id,
        courseId
      }
    });
    revalidatePath('/courses');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Already in cart' };
    return { success: false, error: error.message };
  }
}

export async function addToWishlist(courseId: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        courseId
      }
    });
    revalidatePath('/courses');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: 'Already in wishlist' };
    return { success: false, error: error.message };
  }
}

export async function removeFromCart(courseId: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        courseId
      }
    });
    revalidatePath('/courses');
    revalidatePath('/cart');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCartItems() {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: true, items: [] };

    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { addedAt: 'desc' }
    });

    const userEnrollmentCount = await prisma.enrollment.count({
      where: { userId: user.id }
    });

    return { success: true, items, userEnrollmentCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeFromWishlist(courseId: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        courseId
      }
    });
    revalidatePath('/courses');
    revalidatePath('/wishlist');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWishlistItems() {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: true, items: [] };

    const items = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { addedAt: 'desc' }
    });
    return { success: true, items };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- CHECKOUT & PAYMENT ACTIONS ---

export async function validateCouponCode(code: string) {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) {
      return { success: false, error: 'Invalid or expired coupon' };
    }
    if (coupon.usesCount >= coupon.maxUses) {
      return { success: false, error: 'Coupon usage limit reached' };
    }
    return { success: true, discountPercent: coupon.discountPercent, couponId: coupon.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processCheckout(courseIds: number[], couponId?: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    // Fetch the courses to get their prices
    const coursesToEnroll = await prisma.course.findMany({
      where: { id: { in: courseIds } }
    });

    // Check existing enrollments to avoid duplicates
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        courseId: { in: courseIds }
      }
    });
    const existingCourseIds = new Set(existingEnrollments.map((e: any) => e.courseId));

    // Get coupon discount percent if applicable
    let discountPercent = 0;
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (coupon && coupon.isActive) {
        discountPercent = coupon.discountPercent;
      }
    }

    // Fetch user's current enrollment count to determine milestone discounts
    const userEnrollmentCount = await prisma.enrollment.count({
      where: { userId: user.id }
    });

    // Create new enrollments
    let currentEnrollmentCount = userEnrollmentCount;

    const newEnrollments = coursesToEnroll
      .filter(course => !existingCourseIds.has(course.id))
      .map(course => {
        let basePrice = course.price;
        if (course.discountedPrice !== null && course.discountEndsAt !== null && new Date(course.discountEndsAt) > new Date()) {
          basePrice = course.discountedPrice;
        }

        let currentAutomatedDiscount = 0;
        if (currentEnrollmentCount > 0 && currentEnrollmentCount % 5 === 0) {
          currentAutomatedDiscount = 50;
        }
        currentEnrollmentCount++; // increment for next course in the same cart

        const finalDiscountPercent = Math.min(100, discountPercent + currentAutomatedDiscount);
        const couponDiscountAmt = basePrice * (finalDiscountPercent / 100);
        const pricePaidAmt = Math.max(0, basePrice - couponDiscountAmt);
        return {
          userId: user.id,
          courseId: course.id,
          pricePaid: pricePaidAmt,
          discount: couponDiscountAmt
        };
      });

    if (newEnrollments.length > 0) {
      await prisma.enrollment.createMany({
        data: newEnrollments
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        courseId: { in: courseIds }
      }
    });

    // Update coupon usage if used
    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usesCount: { increment: 1 } }
      });
    }

    revalidatePath('/courses');
    revalidatePath('/cart');
    revalidatePath('/my-courses');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- OTP ACTIONS ---

export async function generateLoginOtp(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'User not found. Please sign up first.' };

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt }
    });

    // Setup Nodemailer transport
    let transporter;
    let isTestAccount = false;

    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD && process.env.SMTP_PASSWORD !== "your-google-app-password-here") {
      // Use Real Gmail
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      // Use Ethereal fake SMTP
      isTestAccount = true;
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"Simdaa Learning" <${process.env.SMTP_EMAIL || 'MOHAMMADALIMAKADI@GMAIL.COM'}>`,
      to: email,
      subject: 'Your SimdaaLearn Login OTP',
      text: `Your OTP for SimdaaLearn is ${otp}. It is valid for 5 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>SimdaaLearn OTP Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for logging in is:</p>
        <h1 style="color: #007bff; letter-spacing: 2px;">${otp}</h1>
        <p>This code is valid for the next 5 minutes. Please do not share it with anyone.</p>
        <p>Thanks,<br/>The Simdaa Team</p>
      </div>`,
    };

    const info = await transporter.sendMail(mailOptions);

    if (isTestAccount) {
      console.log(`\n\n=== [DUMMY EMAIL SENT] ===`);
      console.log(`OTP for ${email} is ${otp}`);
      console.log(`Preview Email Online: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`==========================\n\n`);
    } else {
      console.log(`[REAL EMAIL] Sent OTP to ${email}`);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyLoginOtp(email: string, otp: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'User not found' };

    if (!user.isActive) return { success: false, error: 'Your account has been deactivated.' };

    if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return { success: false, error: 'Invalid or expired OTP' };
    }

    // Clear OTP and set session
    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiresAt: null }
    });

    const cookieStore = await cookies();
    cookieStore.set('session_id', user.id.toString(), { httpOnly: true, path: '/' });

    return { success: true, user: { id: user.id, email: user.email, role: user.role, isActive: user.isActive } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- CAREER OPPORTUNITIES ACTIONS ---

export async function fetchCareerOpportunities() {
  try {
    const opportunities = await prisma.careerOpportunity.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, opportunities };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCareerOpportunity(title: string, type: string, description?: string) {
  try {
    await prisma.careerOpportunity.create({
      data: {
        title,
        type,
        description
      }
    });
    revalidatePath('/admin');
    revalidatePath('/teach');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCareerOpportunity(id: number) {
  try {
    await prisma.careerOpportunity.delete({ where: { id } });
    revalidatePath('/admin');
    revalidatePath('/teach');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- SEARCH ACTIONS ---

export async function searchCourses(query: string) {
  if (!query || query.trim() === '') {
    return { success: true, results: [] };
  }

  try {
    const results = await prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query } },
          { category: { contains: query } },
          { instructor: { contains: query } }
        ]
      },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        thumbnailUrl: true,
        price: true
      }
    });
    return { success: true, results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- LEARNING PORTAL ACTIONS ---

export async function getCourseForLearning(courseId: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    // Verify enrollment
    const isEnrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (!isEnrolled && user.role !== 'admin') {
      return { success: false, error: 'Not enrolled in this course' };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!course) return { success: false, error: 'Course not found' };

    return { success: true, course };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserDetails(userId: number, currentEmail: string, newEmail: string) {
  try {
    if (newEmail !== currentEmail) {
      const existing = await prisma.user.findUnique({ where: { email: newEmail } });
      if (existing) return { success: false, error: 'Email already exists' };
    }
    await prisma.user.update({ where: { id: userId }, data: { email: newEmail } });
    const cookieStore = await cookies();
    cookieStore.set('session', newEmail, { httpOnly: true, path: '/' });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeUserPassword(userId: number, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePasswordByEmail(email: string, newPassword: string) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- CERTIFICATE ACTIONS ---

export async function issueCertificate(courseId: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    // Check if a certificate already exists
    const existing = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId
        }
      }
    });

    if (existing) {
      return { success: true, certificate: existing };
    }

    // Generate a unique Certificate ID
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const certificateId = `SMD-CERT-${randomSuffix}`;

    const newCertificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        courseId,
        certificateId
      }
    });

    return { success: true, certificate: newCertificate };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCertificateData(courseId: number) {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    const certificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId
        }
      },
      include: {
        course: true,
        user: true
      }
    });

    return { success: true, certificate };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCertificateById(certificateId: string) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        course: true,
        user: true
      }
    });

    if (!certificate) return { success: false, error: 'Certificate not found' };

    return { success: true, certificate };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function getUserCertificates() {
  try {
    const { user } = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            lessons: true
          }
        },
        user: true
      },
      orderBy: { issuedAt: 'desc' }
    });

    return { success: true, certificates };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitInstructorApplication(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const age = parseInt(formData.get('age') as string);
    const email = formData.get('email') as string;
    const phoneNo = formData.get('phoneNo') as string;
    const linkedinLink = formData.get('linkedinLink') as string;
    const githubLink = formData.get('githubLink') as string;
    const resume = formData.get('resume') as File;
    const jobIdStr = formData.get('jobId') as string;
    const jobId = jobIdStr ? parseInt(jobIdStr) : null;

    if (!resume) {
      return { success: false, error: 'Resume is required' };
    }

    const bytes = await resume.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${resume.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const resumePath = `/uploads/${fileName}`;

    let application;
    if (jobId) {
      application = await prisma.jobApplication.create({
        data: {
          jobId,
          name,
          age,
          email,
          phoneNo,
          linkedinLink: linkedinLink || null,
          githubLink: githubLink || null,
          resumePath,
        }
      });
    } else {
      application = await prisma.instructorApplication.create({
        data: {
          name,
          age,
          email,
          phoneNo,
          linkedinLink: linkedinLink || null,
          githubLink: githubLink || null,
          resumePath,
        }
      });
    }

    return { success: true, application };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
