import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-14 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          
          <p className="mt-4 text-gray-200">
             Ai ตัวน้อย By.
          </p>
          <nav className="mt-6 flex justify-center space-x-6">
            <a href="#" className="text-gray-200 hover:text-gray-900">
              Farik
            </a>
            <a href="#" className="text-gray-200 hover:text-gray-900">
              Pongphisut
            </a>
            <a href="#" className="text-gray-200 hover:text-gray-900">
              Wildan
            </a>
          </nav>
          <div className="mt-6 flex justify-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
