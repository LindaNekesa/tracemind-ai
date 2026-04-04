export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-xs">🔍</div>
          <span className="text-sm font-bold text-white">TraceMind AI</span>
          <span className="text-gray-600 text-sm">— Digital Forensics Platform</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a href="https://github.com/LindaNekesa/erima-portfolio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
          <a href="https://github.com/LindaNekesa/erima-portfolio" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Portfolio</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">LinkedIn</a>
        </div>
        <div className="text-sm text-gray-600 text-center">
          <span>Designed by </span>
          <span className="text-blue-400 font-semibold">Linda Nekesa</span>
          <span className="text-gray-700 mx-2">·</span>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}
