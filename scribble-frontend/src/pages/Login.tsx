import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { loginUser } from '../features/auth/authThunk'
import { selectAuth } from '../features/auth/authSelector'

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwe8H5RpGH0k92Dtaw3M_EwbJhKH4nWmt948b2tVtyjEak3U79BGo35TIEVJktzDp6bdJ0rclyJuo4jg02lhry4T4uUEotXSSqw44lR9lIQNBNiZyKDwrjiAV4Yu96D9iWOzlEJOcfeaiLsk_IMwIbXOZuIHSJzYpcRKtWanLQetTYo5WxFu8ICdvj8Hg1MylWCY9aaI7YTTUszKg1dTobtUktd5e7Y3Yl75cUzGGR1Y1_nTEZXTzJQdLkNSZWwu_0jEV_FgoXiPNr'

const Login: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector(selectAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Backend expects username, but design says email. 
    // I'll keep the design's label but map it to 'username' for the service if needed, 
    // or just assume we use username as input.
    // For now, I'll pass the form as is (mapping email to username if necessary).
    const result = await dispatch(loginUser({ username: form.email, password: form.password }))
    if (loginUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  return (
    <main className="min-h-screen flex w-full bg-background font-body text-on-background selection:bg-primary-container selection:text-on-primary-container antialiased">
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        
        {/* Left Side: Editorial Canvas Hero */}
        <div className="hidden md:flex flex-col w-1/2 bg-surface-container-low border-r-2 border-on-surface p-12 relative overflow-hidden bg-scribble-texture">
          {/* Decorative background elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-fixed-dim rounded-full opacity-30 mix-blend-multiply blur-2xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-secondary-fixed-dim rounded-full opacity-30 mix-blend-multiply blur-2xl" />
          
          {/* Logo & Tagline */}
          <div className="relative z-10 mb-16">
            <h1 className="font-headline text-5xl font-black tracking-tighter text-on-background italic">Scribble.</h1>
            <p className="font-body text-xl font-medium text-outline mt-4 border-l-4 border-primary pl-4 py-1">Where creativity comes to play.</p>
          </div>

          {/* Hero Illustration Container */}
          <div className="relative z-10 flex-grow flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square border-[3px] border-on-surface bg-surface-container-lowest p-4 wobbly-border offset-shadow rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
              <img 
                src={HERO_IMG} 
                alt="Open sketchbook with colored pencils" 
                className="w-full h-full object-cover filter contrast-125 saturate-150 border-2 border-on-surface" 
              />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-surface/80 border-b-2 border-on-surface/20 rotate-3 mix-blend-overlay" />
            </div>
          </div>

          {/* Footer subtle branding */}
          <div className="relative z-10 mt-auto pt-8">
            <p className="font-headline text-sm font-bold text-outline uppercase tracking-widest">© 2024 The Calculated Canvas</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-surface relative">
          
          {/* Mobile Logo */}
          <div className="md:hidden w-full max-w-sm mb-12 text-center">
            <h1 className="font-headline text-4xl font-black tracking-tighter text-on-background italic">Scribble.</h1>
            <p className="font-body text-md font-medium text-outline mt-2">Where creativity comes to play.</p>
          </div>

          <div className="w-full max-w-md bg-surface-container-lowest border-[3px] border-on-surface p-8 lg:p-10 relative z-10 wobbly-border offset-shadow">
            <div className="mb-10 text-center md:text-left">
              <h2 className="font-headline text-3xl font-bold text-on-background tracking-tight">Welcome Back</h2>
              <p className="font-body text-base text-on-surface-variant mt-2">Let's continue drafting your masterpiece.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container border-2 border-error rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">report</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="block font-label text-sm font-semibold text-on-surface-variant" htmlFor="username">Username</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                  <input 
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-2 border-on-surface text-on-background pl-12 pr-4 py-3 font-body focus:outline-none focus:border-primary focus:border-[3px] transition-all wobbly-border placeholder:text-outline" 
                    id="username" 
                    placeholder="Your username" 
                    type="text"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-label text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="font-body text-sm font-bold text-primary hover:text-secondary underline decoration-2 transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input 
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border-2 border-on-surface text-on-background pl-12 pr-12 py-3 font-body focus:outline-none focus:border-primary focus:border-[3px] transition-all wobbly-border placeholder:text-outline" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" 
                    type="button"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <button 
                  disabled={loading}
                  className="w-full marker-gradient border-[3px] border-on-surface text-on-primary font-headline font-bold text-lg py-4 wobbly-border flex items-center justify-center gap-2 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(24,26,46,0.3)] transition-all active:translate-y-0 active:translate-x-0 active:shadow-none group disabled:opacity-50" 
                  type="submit"
                >
                  {loading ? 'Logging in...' : 'Login'}
                  {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                </button>
              </div>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-grow border-t-2 border-on-surface/20 border-dashed" />
              <span className="font-headline text-sm font-bold text-outline uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t-2 border-on-surface/20 border-dashed" />
            </div>

            <div className="text-center">
              <p className="font-body text-on-surface-variant">
                Need an account?{' '}
                <Link to="/signup" className="font-headline font-bold text-secondary hover:text-secondary-container underline decoration-2 underline-offset-4 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
