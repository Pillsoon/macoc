import directoryData from '@/content/directory.json'

export default function DirectoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-heading font-semibold text-navy">
          {directoryData.title}
        </h1>
        <p className="text-text-muted">
          {directoryData.year} Member Directory
        </p>
      </div>

      <div className="grid gap-8 md:gap-10">
        {directoryData.categories.map((category) => (
          <section key={category.name} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-navy px-6 py-4">
              <h2 className="text-xl font-heading font-semibold text-white">
                {category.name}
              </h2>
            </div>
            <div className="p-6">
              {category.teachers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.teachers.map((teacher, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-cream/50 rounded-lg text-charcoal text-sm"
                    >
                      {teacher}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm italic">
                  No registered teachers in this category
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="bg-cream border-l-4 border-gold p-6 rounded-r-lg">
        <h3 className="font-heading font-semibold text-navy mb-2">Become a Member</h3>
        <p className="text-text-secondary text-sm">
          Interested in joining MACOC as a teacher member?
          Visit our <a href="/competition/registration" className="text-gold hover:text-gold/80 underline">registration page</a> to apply for membership.
        </p>
      </div>
    </div>
  )
}
