'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { issueCertificate } from '@/app/actions';
import { Certificate } from '@/components/Certificate';

export default function LearnPortal({ course, user, initialCertificate }: { course: any, user: any, initialCertificate?: any }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(initialCertificate);
  const [isIssuing, setIsIssuing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-play when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    // Give iframe time to load before trying to auto-play if we wanted to
  }, [currentLessonIndex]);

  const togglePlay = () => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    const command = isPlaying ? 'pauseVideo' : 'playVideo';
    iframeRef.current.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args: []
    }), '*');
    setIsPlaying(!isPlaying);
  };

  const handleFinishCourse = async () => {
    setIsIssuing(true);
    const res = await issueCertificate(course.id);
    if (res.success && res.certificate) {
      setCertificateData(res.certificate);
    } else {
      alert(res.error || 'Failed to issue certificate');
    }
    setIsIssuing(false);
  };

  if (!course.lessons || course.lessons.length === 0) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>No lessons available for this course yet.</h2>
        <Link href="/my-courses" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>
          Back to My Courses
        </Link>
      </div>
    );
  }

  const currentLesson = course.lessons[currentLessonIndex];

  // Helper to convert standard youtube link to embed link
  const getEmbedUrl = (url: string) => {
    let embedUrl = url;
    let videoId = '';
    
    if (url.includes('watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    // Replace with youtube-nocookie for less tracking and cleaner UI
    embedUrl = embedUrl.replace('youtube.com', 'youtube-nocookie.com');
    
    // Add parameters to prevent opening in YouTube and remove related videos/branding
    const separator = embedUrl.includes('?') ? '&' : '?';
    let params = 'rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=0&color=white&controls=1&playsinline=1&disablekb=1&enablejsapi=1&cc_load_policy=1';
    
    // The playlist + loop trick completely prevents the "More Videos" grid from showing at the end
    if (videoId) {
      params += `&loop=1&playlist=${videoId}`;
    }
    
    return `${embedUrl}${separator}${params}`;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: 'var(--bg-primary)' }}>
      
      {/* Sidebar: Course Playlist */}
      <div style={{ 
        width: '350px', 
        borderRight: '1px solid var(--glass-border)', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <Link href="/my-courses" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            ← Back to Dashboard
          </Link>
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, lineHeight: 1.3 }}>{course.title}</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 600 }}>
            {currentLessonIndex + 1} / {course.lessons.length} Lessons
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {course.lessons.map((lesson: any, index: number) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLessonIndex(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                border: 'none',
                borderBottom: '1px solid var(--glass-border)',
                background: currentLessonIndex === index ? 'rgba(6, 147, 227, 0.1)' : 'transparent',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                background: currentLessonIndex === index ? 'var(--accent-primary)' : 'var(--glass-bg)',
                color: currentLessonIndex === index ? 'white' : 'var(--text-secondary)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 600,
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: currentLessonIndex === index ? 600 : 500 }}>
                  {lesson.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Video Player */}
      <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 700 }}>
          {currentLesson.title}
        </h1>
        
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '56.25%', /* 16:9 Aspect Ratio */
          background: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {currentLesson.videoUrl ? (
              <iframe
                ref={iframeRef}
                src={getEmbedUrl(currentLesson.videoUrl)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  pointerEvents: 'auto' /* Allow interaction for CC/Quality */
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                allowFullScreen
              ></iframe>
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              No video available for this lesson.
            </div>
          )}
        </div>
        
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          💡 Click the video to Play / Pause.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-secondary"
            disabled={currentLessonIndex === 0}
            onClick={() => setCurrentLessonIndex(prev => prev - 1)}
            style={{ padding: '0.75rem 1.5rem', fontWeight: 600, opacity: currentLessonIndex === 0 ? 0.5 : 1 }}
          >
            ← Previous Lesson
          </button>
          
          {currentLessonIndex === course.lessons.length - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={handleFinishCourse}
              disabled={isIssuing || !!certificateData}
              style={{ padding: '0.75rem 1.5rem', fontWeight: 600, background: 'var(--accent-primary)' }}
            >
              {isIssuing ? 'Issuing...' : certificateData ? 'Course Finished' : 'Finish Course ✓'}
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentLessonIndex(prev => prev + 1)}
              style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}
            >
              Next Lesson →
            </button>
          )}
        </div>
        
        {certificateData && (
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Your Certificate</h3>
            <Certificate
              studentName={user?.fullName || 'Student'}
              courseTitle={course.title}
              instructorName={course.instructor || 'Instructor'}
              totalHours={course.lessons.length}
              completedAt={new Date(certificateData.issuedAt)}
              certificateId={certificateData.certificateId}
              courseId={course.id.toString()}
            />
          </div>
        )}

        {currentLesson.contentText && (
          <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Lesson Notes</h3>
            <div dangerouslySetInnerHTML={{ __html: currentLesson.contentText }} />
          </div>
        )}
      </div>
    </div>
  );
}
