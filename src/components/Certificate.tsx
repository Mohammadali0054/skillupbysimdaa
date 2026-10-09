"use client";

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  totalHours: number;
  completedAt: Date;
  certificateId: string;
  courseId: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseTitle,
  instructorName,
  totalHours,
  completedAt,
  certificateId,
  courseId,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(completedAt).toUpperCase();

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(completedAt);

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://simdaa.com'}/verify/${certificateId}`;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div 
        ref={certificateRef}
        style={{ 
          position: 'relative',
          backgroundColor: '#ffffff', 
          width: '1000px', 
          height: '707px', // 1000 / 1.414 (A4 landscape ratio)
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '12px solid #eff6ff', 
          padding: '48px', 
          display: 'flex', 
          flexDirection: 'column', 
          fontFamily: 'sans-serif',
          color: '#1a1a1a',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Simdaa Logo" 
              style={{ height: '48px' }} 
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ color: '#2563eb', letterSpacing: '0.2em', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', margin: 0 }}>Certificate of Completion</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px', margin: 0 }}>Issued by simdaa Learning</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '24px', margin: 0 }}>This is to certify that</p>
          <h2 style={{ fontSize: '48px', fontFamily: 'serif', fontWeight: 'bold', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.025em', margin: '0 0 8px 0' }}>
            [{studentName}]
          </h2>
          <div style={{ width: '256px', height: '4px', backgroundColor: '#2563eb', marginBottom: '40px' }}></div>
          
          <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '16px', margin: 0 }}>has successfully completed the course</p>
          <h3 style={{ fontSize: '30px', fontFamily: 'serif', color: '#1f2937', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 24px 0' }}>
            [{courseTitle}]
          </h3>
          <p style={{ color: '#4b5563', margin: 0 }}>
            Instructor: <span style={{ fontWeight: 600, color: '#111827' }}>[{instructorName}]</span> &nbsp;&middot;&nbsp; Total hours: <span style={{ fontWeight: 600, color: '#111827' }}>[{totalHours.toFixed(1)} hours]</span>
          </p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '40px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: '48px', rowGap: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Completed On (Timestamp)</p>
              <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>[{formattedDate}]</p>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>[{formattedTime}]</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Certificate ID</p>
              <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>[{certificateId}]</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Course ID</p>
              <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>[{courseId}]</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>Verify At</p>
              <p style={{ color: '#2563eb', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                [{typeof window !== 'undefined' ? window.location.host : 'yourwebsite.com'}/verify/{certificateId}]
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '64px', alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'serif', fontSize: '24px', color: '#1f2937', fontStyle: 'italic', marginBottom: '8px' }}>[Signature]</div>
              <div style={{ width: '192px', height: '1px', backgroundColor: '#9ca3af', marginBottom: '8px', margin: '0 auto' }}></div>
              <p style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Authorized Signatory</p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '8px', display: 'inline-block' }}>
                <QRCodeSVG value={verificationUrl} size={90} />
              </div>
              <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Scan to Verify</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
      >
        <Download size={20} />
        Download Certificate
      </button>
    </div>
  );
};
