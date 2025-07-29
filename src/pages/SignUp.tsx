import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Step 1: Send OTP
  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || 'Failed to send OTP');

      setOtpSent(true);
    } catch (err) {
      alert('Error sending OTP');
    }
  };

  // ✅ Step 2 + 3: Verify OTP → then sign up
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      // Verify OTP
      const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        setVerifying(false);
        return alert(verifyData.message || 'Invalid OTP');
      }

      // Proceed to sign up
      const signupRes = await fetch(`${import.meta.env.VITE_API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await signupRes.json();

      if (!signupRes.ok) {
        setVerifying(false);
        return alert(data.message || 'Signup failed');
      }

      // Save token + user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      alert('Server error. Try again later.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign up</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign up to enjoy the features of HD
          </p>

          <form onSubmit={otpSent ? handleOtpSubmit : handleGetOtp} className="space-y-6">
            {/* Name */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-500">Your Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DOB */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-500">Date of Birth</label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-500">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* OTP Field (after sent) */}
            {otpSent && (
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-sm text-gray-500">Enter OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="------"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
              disabled={verifying}
            >
              {otpSent ? (verifying ? 'Verifying...' : 'Sign Up') : 'Get OTP'}
            </button>

            <p className="text-sm text-center mt-2 text-gray-500">
              Already have an account?{' '}
              <a href="/signin" className="text-blue-600 hover:underline">Sign In</a>
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

export default SignUp;
