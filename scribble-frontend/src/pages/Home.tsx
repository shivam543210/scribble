import React from 'react'
import { Link } from 'react-router-dom'

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwe8H5RpGH0k92Dtaw3M_EwbJhKH4nWmt948b2tVtyjEak3U79BGo35TIEVJktzDp6bdJ0rclyJuo4jg02lhry4T4uUEotXSSqw44lR9lIQNBNiZyKDwrjiAV4Yu96D9iWOzlEJOcfeaiLsk_IMwIbXOZuIHSJzYpcRKtWanLQetTYo5WxFu8ICdvj8Hg1MylWCY9aaI7YTTUszKg1dTobtUktd5e7Y3Yl75cUzGGR1Y1_nTEZXTzJQdLkNSZWwu_0jEV_FgoXiPNr'

const DOTTED_BG = `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNjMGM3Y2UiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+")`

const Home: React.FC = () => {
  return (
    <div className="bg-[#fbf8ff] text-[#181a2e] min-h-screen flex flex-col antialiased" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 bg-[#fbf8ff] border-b-[3px] border-[#181A2E] hard-shadow">
        <div className="text-3xl font-black text-[#181A2E] italic tracking-tight" style={{ fontFamily: '"Epilogue", sans-serif' }}>
          Scribble
        </div>
        <div className="flex gap-4 items-center">
          <Link
            to="/login"
            id="login-btn"
            className="font-bold text-sm bg-white border-[3px] border-[#181a2e] rounded-md px-6 py-2 hard-shadow-sm hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0 active:translate-x-0 active:shadow-none transition-all text-[#181a2e]"
            style={{ fontFamily: '"Epilogue", sans-serif' }}
          >
            Log In
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12 gap-12 relative overflow-hidden">

        {/* Background decorative blobs */}
        <div className="absolute top-10 left-10 w-24 h-24 border-[3px] border-[#181a2e] rounded-full bg-[#ffdbd0] opacity-50 mix-blend-multiply -z-10 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 border-[3px] border-[#181a2e] bg-[#c5e7ff] rotate-12 opacity-50 mix-blend-multiply -z-10" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-[3px] border-[#181a2e] rounded-full bg-[#ffdf9b] opacity-50 mix-blend-multiply -z-10" />

        {/* Hero Section */}
        <section className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12 z-10">

          {/* Left: Text */}
          <div className="flex-1 space-y-8 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black text-[#181a2e] leading-tight tracking-tighter" style={{ fontFamily: '"Epilogue", sans-serif' }}>
              Draw, Guess,{' '}
              <span className="text-[#ab3500] bg-[#edecff] px-2 border-[3px] border-[#181a2e] hard-shadow-sm inline-block transform -rotate-2">
                Win!
              </span>
            </h1>
            <p className="text-xl text-[#40484d] max-w-lg mx-auto md:mx-0">
              Join the ultimate multiplayer drawing and guessing game. Express your creativity, have fun with friends, and show off your skills in Scribble.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/signup"
                id="play-now-btn"
                className="text-white font-black text-xl px-8 py-4 rounded-md border-[3px] border-[#181a2e] hard-shadow hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0 active:translate-x-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                style={{
                  fontFamily: '"Epilogue", sans-serif',
                  background: 'linear-gradient(135deg, #146285 0%, #377b9f 100%)',
                }}
              >
                Play Now
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
              </Link>
              <button
                id="how-to-play-btn"
                className="bg-white text-[#181a2e] font-bold text-xl px-8 py-4 rounded-md border-[3px] border-[#181a2e] hard-shadow hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0 active:translate-x-0 active:shadow-none transition-all"
                style={{ fontFamily: '"Epilogue", sans-serif' }}
              >
                How to Play
              </button>
            </div>
          </div>

          {/* Right: Stacked Canvas Hero */}
          <div className="flex-1 relative w-full max-w-md aspect-square">
            {/* Background depth panels */}
            <div className="absolute inset-0 bg-[#377b9f] border-[3px] border-[#181a2e] translate-x-4 translate-y-4 rounded-xl" />
            <div className="absolute inset-0 bg-[#fe6a34] border-[3px] border-[#181a2e] translate-x-2 translate-y-2 rounded-xl" />
            {/* Foreground panel */}
            <div
              className="relative w-full h-full bg-white border-[3px] border-[#181a2e] rounded-xl overflow-hidden flex items-center justify-center p-8"
              style={{ backgroundImage: DOTTED_BG }}
            >
              <img
                src={HERO_IMG}
                alt="Playful 3D abstract shapes representing creativity"
                className="w-full h-full object-cover rounded-lg border-2 border-[#181a2e]"
              />
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 z-10">

          {/* Card 1 – Play with Friends */}
          <div className="bg-white border-[3px] border-[#181a2e] rounded-xl p-6 hard-shadow flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#146285] opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 bg-[#377b9f] text-white rounded-md border-2 border-[#181a2e] flex items-center justify-center hard-shadow-sm">
              <span className="material-symbols-outlined text-2xl">group</span>
            </div>
            <h3 className="font-black text-2xl text-[#181a2e]" style={{ fontFamily: '"Epilogue", sans-serif' }}>Play with Friends</h3>
            <p className="text-[#40484d] text-sm">Create private rooms or join public lobbies to draw and guess with players worldwide.</p>
          </div>

          {/* Card 2 – Unleash Creativity */}
          <div className="bg-white border-[3px] border-[#181a2e] rounded-xl p-6 hard-shadow flex flex-col gap-4 relative overflow-hidden group md:-translate-y-4">
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-[#ab3500] opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 bg-[#fe6a34] text-white rounded-md border-2 border-[#181a2e] flex items-center justify-center hard-shadow-sm">
              <span className="material-symbols-outlined text-2xl">brush</span>
            </div>
            <h3 className="font-black text-2xl text-[#181a2e]" style={{ fontFamily: '"Epilogue", sans-serif' }}>Unleash Creativity</h3>
            <p className="text-[#40484d] text-sm">Use our advanced yet simple drawing tools to bring your words to life on the digital canvas.</p>
          </div>

          {/* Card 3 – Daily Challenges */}
          <div className="bg-white border-[3px] border-[#181a2e] rounded-xl p-6 hard-shadow flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute right-1/2 top-1/2 w-32 h-32 bg-[#936f03] opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500 -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 bg-[#936f03] text-white rounded-md border-2 border-[#181a2e] flex items-center justify-center hard-shadow-sm">
              <span className="material-symbols-outlined text-2xl">emoji_events</span>
            </div>
            <h3 className="font-black text-2xl text-[#181a2e]" style={{ fontFamily: '"Epilogue", sans-serif' }}>Daily Challenges</h3>
            <p className="text-[#40484d] text-sm">Test your skills with new prompts every day and climb the global leaderboards.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f4f2ff] border-t-[3px] border-[#181a2e] py-8 px-6 mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm font-bold text-[#181a2e]">© 2024 Scribble. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="text-sm text-[#181a2e] hover:text-[#146285] transition-colors font-bold">Terms</a>
          <a href="#" className="text-sm text-[#181a2e] hover:text-[#146285] transition-colors font-bold">Privacy</a>
          <a href="#" className="text-sm text-[#181a2e] hover:text-[#146285] transition-colors font-bold">Support</a>
        </div>
      </footer>
    </div>
  )
}

export default Home
