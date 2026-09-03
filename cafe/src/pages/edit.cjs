const fs = require('fs');
let c = fs.readFileSync('MenuPage.jsx', 'utf8');
const start = c.indexOf('{/* Search & Quick Filter Bar */}');
const end = c.indexOf('</AnimatePresence>') + '</AnimatePresence>'.length;
if (start !== -1 && end !== -1) {
  const replacement = `          {/* External Menu Link */}
          <div className="mt-8 flex justify-center">
            <a href="http://localhost:3001/r-sports-cafe" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-10 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-sans text-[14px] font-bold tracking-[0.15em] uppercase hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all active:scale-95">
              Explore Full Menu →
            </a>
          </div>
        </div>
      </section>
`;
  c = c.slice(0, start) + replacement + c.slice(end);
  fs.writeFileSync('MenuPage.jsx', c);
  console.log('success');
} else {
  console.log('failed to find indices', start, end);
}
