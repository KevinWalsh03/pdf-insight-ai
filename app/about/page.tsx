// About page — mission, video, personal branding
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* ── Header ── */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          About <span className="gradient-text">PDF Insight AI</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          We're on a mission to make dense, complex PDFs instantly understandable
          — without sacrificing a single pixel of formatting.
        </p>
      </div>

      {/* ── Mission ── */}
      <section className="bg-indigo-50 rounded-3xl p-10 mb-16">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          PDF documents are the backbone of technical and professional communication —
          from engineering specifications to quarterly financial reports. Yet editing
          them is still painful, and extracting meaningful insight still takes hours.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          PDF Insight AI was built to fix both problems at once. Using large language
          models paired with precision layout-aware rendering, we let you edit any
          document naturally while our AI simultaneously surfaces the key information
          you actually need.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Whether you're a researcher compressing a 100-page study into a slide deck,
          an analyst reviewing quarterly reports, or an engineering student annotating
          a technical manual — PDF Insight AI saves you hours every week.
        </p>
      </section>


      {/* ── Product Video ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
          
        </h2>
        
        {/* YouTube embed placeholder — replace src with real video URL */}
        {/*}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="PDF Insight AI Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-center text-gray-400 text-sm mt-3">
          Product demo — replace with your real video URL
        </p>
        */}
      </section>

      {/* ── Team / Personal Branding ── */}
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
          Meet the Founder
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white border border-gray-100 shadow-sm rounded-3xl p-8">
          {/* Profile photo — place your image at public/images/kevin.jpg */}
          <Image
            src="/images/Showcase.PNG"
            alt="Kevin Walsh"
            width={128}
            height={128}
            className="flex-shrink-0 w-32 h-32 rounded-full object-cover object-top shadow-lg"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Kevin Walsh</h3>
            <p className="text-indigo-500 text-sm font-medium mb-3">Founder </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              I am an engineer focused on building practical AI tools that simplify everyday workflows. 
              I created this platform to make PDF editing faster, smarter and more intuitive—so you can  
              spend less time navigating documents and more time getting work done. 
      
            </p>
          </div>
        </div>

        {/* Photo grid — place images at public/images/photo1.jpg, photo2.jpg, photo3.jpg */}
        <div className="flex justify-center items-center gap-6 mt-8">
          {[
            { src: "/images/BuildingTheSite.png", label: "Building the Website" },
            { src: "/images/Golf.png", label: "Work Less - Enjoy More" },
          
          ].map(({ src, label }) => (
            <div key={label} className="relative w-80 aspect-video rounded-2x1 overflow-hidden border-gray-200 shadow-sm">
              <Image src={src} alt={label} fill className="object-contain" />
              <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs font-medium text-center py-1.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
