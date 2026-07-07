'use client';

import { useState, useEffect } from 'react';
import { getActiveCrisis, resolveCrisis } from '@/lib/api';

export default function CrisisCard() {
  const [crisis, setCrisis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchActiveCrisis();
  }, []);

  const fetchActiveCrisis = async () => {
    try {
      setLoading(true);
      const data = await getActiveCrisis();
      if (data && data.has_crisis) {
        setCrisis(data);
      }
    } catch (err) {
      console.error('Error fetching crisis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {

    console.log(crisis.id,"crisisi")
    if (!crisis || !crisis.id) return;
    
    setResolving(true);
    try {
      await resolveCrisis(crisis.id);
      setCrisis(null);
      setDismissed(true);
    } catch (err) {
      console.error('Error resolving crisis:', err);
    } finally {
      setResolving(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (loading) return null;
  if (dismissed) return null;
  if (!crisis || crisis.level === 0) return null;

  const getCrisisColors = () => {
    switch (crisis.level) {
      case 1:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        };
      case 2:
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-800',
          button: 'bg-orange-100 hover:bg-orange-200 text-orange-800'
        };
      case 3:
        return {
          bg: 'bg-red-50',
          border: 'border-red-300',
          text: 'text-red-800',
          button: 'bg-red-100 hover:bg-red-200 text-red-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-800',
          button: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        };
    }
  };

  const getCrisisIcon = () => {
    switch (crisis.level) {
      case 1: return '⚠️';
      case 2: return '🆘';
      case 3: return '🚨';
      default: return 'ℹ️';
    }
  };

  const getCrisisTitle = () => {
    switch (crisis.level) {
      case 1: return 'نیاز به توجه';
      case 2: return 'نیاز به کمک';
      case 3: return 'وضعیت بحرانی';
      default: return '';
    }
  };

  const colors = getCrisisColors();

  return (
    <div className={`rounded-2xl p-5 border-2 ${colors.bg} ${colors.border} relative`}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
      >
        ✕
      </button>

      <div className="flex items-start gap-4">
        <div className={`text-4xl ${crisis.level === 3 ? 'animate-pulse' : ''}`}>
          {getCrisisIcon()}
        </div>

        <div className="flex-1">
          <h3 className={`font-bold text-lg ${colors.text}`}>
            {getCrisisTitle()}
          </h3>
          
          <p className={`mt-2 text-sm ${colors.text}`}>
            {crisis.message || 'وضعیت نیاز به توجه دارد. لطفاً مراقب خودت باش.'}
          </p>

          {crisis.resources && crisis.resources.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">📞 منابع کمک:</p>
              <div className="flex flex-col gap-2">
                {crisis.resources.map((resource, idx) => (
                  <div key={idx}>
                    {resource.type === 'phone_number' ? (
                      <a href={`tel:${resource.contact}`} className="text-sm underline">
                        📞 {resource.title}: {resource.contact}
                      </a>
                    ) : resource.type === 'breathing_exercise' ? (
                      <div className="text-sm">🧘 {resource.title}: {resource.description}</div>
                    ) : (
                      <div className="text-sm">🔗 {resource.title}: {resource.contact}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleResolve}
              disabled={resolving}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${colors.button} disabled:opacity-50`}
            >
              {resolving ? 'در حال ثبت...' : '✓ مشکل حل شد'}
            </button>
            
            <button
              onClick={() => window.open('https://behsos.com', '_blank')}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/50 hover:bg-white/70 transition"
            >
              دریافت کمک بیشتر →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}