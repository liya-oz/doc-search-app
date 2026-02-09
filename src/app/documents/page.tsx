'use client';
import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import PDFViewerModal from '../components/PDFViewerModal';
import UploadModal from '../components/UploadModal';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  total_chunks: number;
  file_url?: string;
  file_path?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<{
    url: string;
    name: string;
    id?: string;
    isPDF?: boolean;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/file-manager');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch documents',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return isNaN(d.getTime())
        ? s
        : d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
    } catch {
      return s;
    }
  };

  const formatFileSize = (b: number) =>
    b < 1024
      ? `${b} B`
      : b < 1024 * 1024
        ? `${(b / 1024).toFixed(2)} KB`
        : `${(b / (1024 * 1024)).toFixed(2)} MB`;

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Delete "${name}"? This will permanently delete the document, embeddings, and file.`,
      )
    ) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/file-manager/delete?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setDocuments(documents.filter((doc) => doc.id !== id));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Documents
          </h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm shadow-indigo-200/40"
          >
            Upload Document
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              Loading documents...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No documents uploaded yet.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Chunks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-200 dark:divide-slate-800">
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {doc.file_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {doc.file_type || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatFileSize(doc.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {doc.total_chunks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(doc.upload_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3 items-center">
                          {doc.file_name.toLowerCase().endsWith('.pdf') ? (
                            <button
                              onClick={() => {
                                const pdfUrl = doc.file_url
                                  ? `${doc.file_url}?view=true`
                                  : `/api/file-manager/download?id=${doc.id}&file=true&view=true`;
                                setSelectedPDF({
                                  url: pdfUrl,
                                  name: doc.file_name,
                                  id: doc.id,
                                });
                                setShowPDFModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Preview
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPDF({
                                    url:
                                      doc.file_url ||
                                      `/api/file-manager/detail?id=${doc.id}&file=true`,
                                    name: doc.file_name,
                                    id: doc.id,
                                    isPDF: false,
                                  });
                                  setShowPDFModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                View
                              </button>
                              {(doc.file_url || doc.file_path) && (
                                <a
                                  href={
                                    doc.file_url ||
                                    `/api/file-manager/detail?id=${doc.id}&file=true`
                                  }
                                  download={doc.file_name}
                                  className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download
                                </a>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id, doc.file_name)}
                            disabled={deletingId === doc.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="mt-4 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium shadow-sm shadow-indigo-200/40"
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Start searching
              </button>
            </div>
          </div>
        )}

        {selectedPDF && (
          <PDFViewerModal
            isOpen={showPDFModal}
            onClose={() => {
              setShowPDFModal(false);
              setSelectedPDF(null);
            }}
            fileUrl={selectedPDF.url}
            fileName={selectedPDF.name}
            documentId={selectedPDF.id}
            isPDF={selectedPDF.isPDF !== false}
          />
        )}
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={fetchDocuments}
        />
      </main>
    </div>
  );
}
