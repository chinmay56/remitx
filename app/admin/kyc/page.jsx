'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Eye, User, Phone, MapPin, FileText, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '@/lib/ThemeContext';

export default function AdminKYCPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    try {
      const res = await fetch('/api/admin/kyc/pending');
      const data = await res.json();
      if (res.ok) {
        // Fetch signed URLs for KYC documents
        const usersWithSignedUrls = await Promise.all(
          data.users.map(async (user) => {
            if (user.kyc_document_url) {
              try {
                const urlRes = await fetch('/api/admin/kyc/document', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ documentUrl: user.kyc_document_url }),
                });
                const urlData = await urlRes.json();
                return { ...user, kyc_document_url: urlData.signedUrl || user.kyc_document_url };
              } catch (error) {
                return user;
              }
            }
            return user;
          })
        );
        setUsers(usersWithSignedUrls);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        toast.success('KYC Approved!');
        fetchPendingKYC();
        setSelectedUser(null);
      } else {
        toast.error('Failed to approve');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/kyc/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: rejectReason }),
      });

      if (res.ok) {
        toast.success('KYC Rejected');
        fetchPendingKYC();
        setSelectedUser(null);
        setRejectReason('');
      } else {
        toast.error('Failed to reject');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    router.push('/admin/login');
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
              KYC Verification Dashboard
            </h1>
            <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
              Review and approve user identity documents
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Users List */}
            <div>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Pending Verifications ({users.length})
              </h2>
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className={`rounded-xl p-8 text-center ${theme === 'light' ? 'bg-white border-2 border-gray-200' : 'bg-gray-800 border-2 border-gray-700'}`}>
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                      All KYC verifications completed!
                    </p>
                  </div>
                ) : (
                  users.map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedUser(user)}
                      className={`rounded-xl p-4 cursor-pointer transition ${
                        selectedUser?.id === user.id
                          ? 'ring-2 ring-blue-500'
                          : ''
                      } ${theme === 'light' ? 'bg-white border-2 border-gray-200 hover:border-blue-300' : 'bg-gray-800 border-2 border-gray-700 hover:border-blue-500'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            {user.name}
                          </h3>
                          <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                            {user.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock className="w-5 h-5" />
                          <span className="text-sm font-semibold">Pending</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* User Details */}
            <div>
              {selectedUser ? (
                <div
                  className={`rounded-xl p-6 ${theme === 'light' ? 'bg-white border-2 border-blue-200' : 'bg-gray-800 border-2 border-gray-700'}`}
                >
                  <h2 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    User Details
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <User className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Name</p>
                        <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          {selectedUser.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Phone</p>
                        <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          {selectedUser.country_code} {selectedUser.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Country</p>
                        <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          {selectedUser.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Wallet</p>
                        <p className={`font-mono text-sm ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                          {selectedUser.wallet_address.slice(0, 20)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* KYC Document */}
                  <div className={`rounded-xl p-4 mb-6 ${theme === 'light' ? 'bg-gray-50 border-2 border-gray-200' : 'bg-gray-700 border-2 border-gray-600'}`}>
                    <h3 className={`font-bold mb-3 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      KYC Document
                    </h3>
                    {selectedUser.kyc_document_url ? (
                      <div>
                        <img
                          src={selectedUser.kyc_document_url}
                          alt="KYC Document"
                          className="w-full rounded-lg border-2 border-gray-300 mb-3"
                        />
                        <a
                          href={selectedUser.kyc_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 font-semibold text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Size
                        </a>
                      </div>
                    ) : (
                      <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                        No document uploaded
                      </p>
                    )}
                  </div>

                  {/* Reject Reason */}
                  <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g., Document is blurry, ID expired, etc."
                      rows={3}
                      className={`w-full rounded-xl px-4 py-3 border-2 outline-none ${theme === 'light' ? 'border-gray-300 bg-gray-50 text-gray-900' : 'border-gray-600 bg-gray-700 text-white'}`}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(selectedUser.id)}
                      disabled={processing}
                      className="flex-1 bg-red-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={processing}
                      className="flex-1 bg-green-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`rounded-xl p-12 text-center ${theme === 'light' ? 'bg-white border-2 border-gray-200' : 'bg-gray-800 border-2 border-gray-700'}`}>
                  <Eye className={`w-16 h-16 mx-auto mb-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`} />
                  <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                    Select a user to review their KYC
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
