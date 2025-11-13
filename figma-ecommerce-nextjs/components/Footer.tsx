export default function Footer() {
  return (
    <>
      {/* Newsletter Section */}
      <section className="bg-black text-white rounded-3xl mx-6 my-12 p-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold max-w-md">STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>
            <div className="flex flex-col gap-4 w-80">
              <div className="flex items-center bg-white text-gray-900 rounded-full px-4 py-3">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <input type="email" placeholder="Enter your email address" className="bg-transparent outline-none flex-1" />
              </div>
              <button className="bg-white text-black py-3 rounded-full font-medium hover:bg-gray-100">
                Subscribe to Newsletter
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-12 pb-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-5 gap-8 mb-8">
            {/* Brand Column */}
            <div className="col-span-1">
              <h3 className="text-2xl font-bold mb-4">SHOP.CO</h3>
              <p className="text-sm text-gray-600 mb-6">
                We have clothes that suits your style and which you're proud to wear. From women to men.
              </p>
              <div className="flex gap-3">
                <button className="w-8 h-8 bg-white border rounded-full flex items-center justify-center hover:bg-gray-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </button>
                <button className="w-8 h-8 bg-white border rounded-full flex items-center justify-center hover:bg-gray-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                  </svg>
                </button>
                <button className="w-8 h-8 bg-white border rounded-full flex items-center justify-center hover:bg-gray-100">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-bold mb-4">COMPANY</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Works</a></li>
                <li><a href="#" className="hover:text-gray-900">Career</a></li>
              </ul>
            </div>

            {/* Help Column */}
            <div>
              <h4 className="font-bold mb-4">HELP</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Customer Support</a></li>
                <li><a href="#" className="hover:text-gray-900">Delivery Details</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
              </ul>
            </div>

            {/* FAQ Column */}
            <div>
              <h4 className="font-bold mb-4">FAQ</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Account</a></li>
                <li><a href="#" className="hover:text-gray-900">Manage Deliveries</a></li>
                <li><a href="#" className="hover:text-gray-900">Orders</a></li>
                <li><a href="#" className="hover:text-gray-900">Payments</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-bold mb-4">RESOURCES</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Free eBooks</a></li>
                <li><a href="#" className="hover:text-gray-900">Development Tutorial</a></li>
                <li><a href="#" className="hover:text-gray-900">How to - Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Youtube Playlist</a></li>
              </ul>
            </div>
          </div>

          <hr className="mb-6" />

          {/* Footer Bottom */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Shop.co © 2000-2023, All Rights Reserved</p>
            <div className="flex gap-3 items-center">
              <span className="text-xs text-gray-500">Payment methods:</span>
              <span className="text-sm">💳 VISA • MC • PayPal • GPay</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
