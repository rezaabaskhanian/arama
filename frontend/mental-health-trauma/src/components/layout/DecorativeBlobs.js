'use client';

const DecorativeBlobs = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-pink-200/20 blur-2xl" />
    </div>
  );


export default DecorativeBlobs;
