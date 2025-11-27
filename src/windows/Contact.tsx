import WindowWrapper from '#hoc/WindowWrapper'
import WindowControls from '#components/WindowControls'
import { socials } from '#constants'
import { Mail, MapPin, Calendar } from 'lucide-react'

const Contact = () => {
  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden font-georama border border-gray-800 shadow-2xl text-gray-200">
      {/* Header */}
      <div className="window-header flex items-center gap-4 px-4 py-3 bg-[#2a2a2a] border-b border-gray-800 relative z-20">
        <WindowControls target="contact" />
        <span className="font-semibold text-gray-200 ml-2">Get in touch</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Gradient Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />

        {/* Card */}
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Avatar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src="https://avatars.githubusercontent.com/u/100998543?v=4"
              alt="Pratham Jaiswal"
              className="relative w-32 h-32 rounded-full border-4 border-[#1e1e1e] shadow-xl object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Info */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Pratham Jaiswal
            </h1>
            <p className="text-gray-400 text-lg">Full Stack Developer & Blockchain Enthusiast</p>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>India</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined Mar 2022</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 mt-4">
            {socials.map((social, idx) => (
              <a
                key={social.id}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-white/20 group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img src={social.icon} alt={social.text} className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
            <a
                href="mailto:pratham.jaiswal2004@gmail.com"
                className="p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-white/20 group"
            >
                <Mail className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

const ContactWindow = WindowWrapper(Contact, 'contact')

export default ContactWindow
