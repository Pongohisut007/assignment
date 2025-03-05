import React from "react";

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-gray-800 dark:bg-gray-200">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="mt-4 text-gray-200 dark:text-gray-800">
            Translation ตัวน้อย By.
          </p>
          <nav className="mt-6 flex justify-center space-x-6">
            <a href="#" className="text-gray-200 hover:text-gray-600 dark:text-gray-800 dark:hover:text-gray-400">
              Farik
            </a>
            <a href="#" className="text-gray-200 hover:text-gray-600 dark:text-gray-800 dark:hover:text-gray-400">
              Pongphisut
            </a>
            <a href="#" className="text-gray-200 hover:text-gray-600 dark:text-gray-800 dark:hover:text-gray-400">
              Wildan
            </a>
          </nav>
          <div className="mt-6 flex justify-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;