import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-16">

        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">

          {/* logo */}
          <Link to="/" className="flex items-center group">
  <span className="relative text-lg sm:text-xl font-extrabold tracking-tight">
    <span className="text-white">Mechanic</span>
    <span className="text-blue-600 ml-0.5">Finder</span>
    <span className="text-blue-600 ml-0.5">.</span>
  </span>
</Link>

          {/* Users */}
          <FooterColumn
            title="For Users"
            links={[
              { label: "Find Mechanics", to: "/signup" },
              { label: "Track Service" },
              { label: "Service History" },
              { label: "24/7 Support" },
            ]}
          />

          {/* Mechanics */}
          <FooterColumn
            title="For Mechanics"
            links={[
              { label: "Join Network", to: "/signup" },
              { label: "Manage Requests" },
              { label: "Grow Business" },
              { label: "Professional Tools" },
            ]}
          />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-t border-white/10">
          <ContactItem icon={Mail} label="Email" value="support@mechanicfinder.com" />
          <ContactItem icon={Phone} label="Phone" value="+91 8625884615" />
          <ContactItem icon={MapPin} label="Location" value="Nashik, Maharashtra, India" />
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-sm text-slate-400">
          <p>© {currentYear} MechanicFinder. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {["Privacy Policy", "Terms", "Cookies"].map((item) => (
              <button key={item} onClick={() => {}} className="hover:text-white transition-colors cursor-pointer">
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ---------- Helpers ---------- */

const FooterColumn = ({ title, links }) => (
  <div>
    <h3 className="text-lg font-semibold mb-6">{title}</h3>
    <ul className="space-y-4">
      {links.map((link, i) => (
        <li key={i}>
          {link.to ? (
            <Link
              to={link.to}
              className="text-slate-400 hover:text-white transition flex items-center group"
            >
              <span className="group-hover:translate-x-1 transition-transform">
                {link.label}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => {}}
              className="text-slate-400 hover:text-white transition flex items-center group cursor-pointer"
            >
              <span className="group-hover:translate-x-1 transition-transform">
                {link.label}
              </span>
            </button>
          )}
        </li>
      ))}
    </ul>
  </div>
)

const ContactItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
      <Icon className="h-5 w-5 text-blue-400" />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  </div>
)

export default Footer
