'use client';

interface SidebarProps {
  onFilterChange: (filters: any) => void;
}

export default function Sidebar({ onFilterChange }: SidebarProps) {
  const categories = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
  const colors = [
    { name: 'green', class: 'bg-green-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'yellow', class: 'bg-yellow-400' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'cyan', class: 'bg-cyan-400' },
    { name: 'blue', class: 'bg-blue-600' },
    { name: 'purple', class: 'bg-purple-600' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'white', class: 'bg-white border-gray-300' },
    { name: 'black', class: 'bg-black' },
  ];
  const sizes = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];
  const styles = ['Casual', 'Formal', 'Party', 'Gym'];

  return (
    <aside className="w-72 border rounded-2xl p-6 h-fit">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg">Filters</h3>
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
        </svg>
      </div>

      <hr className="mb-6" />

      {/* Categories */}
      <div className="mb-6">
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category} className="flex items-center justify-between text-sm text-gray-600 cursor-pointer hover:text-gray-900">
              <span>{category}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      <hr className="mb-6" />

      {/* Price Range */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold">Price</h4>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
          </svg>
        </div>
        <input type="range" min="50" max="200" defaultValue="150" className="w-full mb-2" />
        <div className="flex justify-between text-sm">
          <span>$50</span>
          <span>$200</span>
        </div>
      </div>

      <hr className="mb-6" />

      {/* Colors */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold">Colors</h4>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
          </svg>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              className={`w-9 h-9 rounded-full ${color.class} border-2 border-transparent hover:border-gray-300`}
            />
          ))}
        </div>
      </div>

      <hr className="mb-6" />

      {/* Size */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold">Size</h4>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              className="px-4 py-2 text-sm border rounded-full hover:bg-gray-100"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <hr className="mb-6" />

      {/* Dress Style */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold">Dress Style</h4>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
          </svg>
        </div>
        <div className="space-y-4">
          {styles.map((style) => (
            <div key={style} className="flex items-center justify-between text-sm text-gray-600 cursor-pointer hover:text-gray-900">
              <span>{style}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Filter Button */}
      <button className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800">
        Apply Filter
      </button>
    </aside>
  );
}
