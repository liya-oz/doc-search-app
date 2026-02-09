'use client';
import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import UploadModal from './components/UploadModal';

export default function Home() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documentsCount, setDocumentsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchDocumentsCount = async () => {
      try {
        const res = await fetch('/api/file-manager');
        const data = await res.json();
        if (!data?.error && Array.isArray(data?.documents)) {
          setDocumentsCount(data.documents.length);
        }
      } catch {
        setDocumentsCount(null);
      }
    };

    fetchDocumentsCount();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer('');
    setSources([]);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) {
        setAnswer(`Error: ${data.error}`);
      } else {
        setAnswer(data.answer || 'No answer generated');
        setSources(data.sources || []);
      }
    } catch (error: any) {
      setAnswer(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-5xl mx-auto p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Search
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-300">
              Upload your documents, then ask questions and get answers with
              sources.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm shadow-indigo-200/40"
          >
            Upload Document
          </button>
        </div>

        {documentsCount === 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              No documents yet
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Start by uploading a PDF, DOCX, or TXT file to enable search.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium shadow-sm shadow-indigo-200/40"
            >
              Upload your first document
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm mb-6">
          <textarea
            className="w-full p-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Ask a question about your uploaded documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={4}
          />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium shadow-sm shadow-indigo-200/40"
              disabled={loading || !query.trim()}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Press Cmd/Ctrl + Enter to search
            </p>
          </div>
        </div>

        {answer && (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-3">Answer:</h2>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {answer}
            </p>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">
              Sources ({sources.length}):
            </h2>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <span className="font-medium">Source:</span>{' '}
                    {source.metadata?.source ||
                      source.metadata?.file_name ||
                      'Unknown'}
                  </p>
                  <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-3">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-sm text-slate-600 dark:text-slate-400">
          <p>
            Search uses only your uploaded files. Double‑check in Documents that
            the right files are included.
          </p>
          <a
            href="/documents"
            className="mt-2 inline-block text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Review Documents
          </a>
        </div>

        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            window.location.href = '/documents';
          }}
        />
      </main>
    </div>
  );
}
