import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Step 1: Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) return alert(data.message || 'Failed to send OTP');

      setOtpSent(true);
    } catch (err) {
      alert('Error sending OTP');
    }
  };

  // ✅ Step 2: Verify OTP and Login
  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        setLoading(false);
        return alert(verifyData.message || 'Invalid OTP');
      }

      // 2. Login
      const loginRes = await fetch(`${import.meta.env.VITE_API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setLoading(false);
        return alert(loginData.message || 'Login failed');
      }

      localStorage.setItem('token', loginData.token);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please login to continue to your account.
          </p>

          <form onSubmit={otpSent ? handleVerifyAndLogin : handleSendOtp} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* OTP (only if sent) */}
            {otpSent && (
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-500">
                  OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {otpSent ? (loading ? 'Verifying...' : 'Sign In') : 'Get OTP'}
            </button>

            <p className="text-sm text-center mt-2 text-gray-500">
              Need an account?{' '}
              <a href="/" className="text-blue-600 hover:underline">Create one</a>
            </p>
          </form>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden md:block md:w-1/2 h-screen p-2">
        <img
          src="window.jpg"
          alt="Illustration"
          className="w-full h-full object-cover rounded-[2rem]"
        />
      </div>
    </div>
  );
}

export default SignIn;
