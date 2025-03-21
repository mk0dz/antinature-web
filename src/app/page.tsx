'use client'
import Image from 'next/image'

import React, { useState } from 'react';

export default function Home() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('pip install antinature');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative flex flex-col-reverse md:flex-row h-screen bg-white text-black ">

        

      
      {/* Hero Section (Right Side on Desktop, Top on Mobile) */}
      <div className="w-full md:w-2/3 p-20 overflow-auto relative">
        <link href="https://fonts.googleapis.com/css2?family=Chivo+Mono:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Wix+Madefor+Display:wght@400..800&display=swap" rel="stylesheet"></link>
        <h1 style={{fontFamily: 'Wix Madefor Display'}} className="relative text-6xl font-thin mb-6">Dirac&apos;s</h1>
        <p style={{fontFamily: 'Wix Madefor Display'}} className=" relative text-8xl font-thin mb-4">
         Antinature
        </p>
        <p style={{fontFamily: 'Chivo Mono'}} className='text-4xl tracking-wide max-w-2xl font-thin mb-4 p-4'>
          py module for playing with antimatter by using quantum computing approach
        </p>
        <div className='flex flex-row gap-4 mb-4 content-center'>
          <a href="/docs">
          <button className='bg-black text-white p-2 text-md max-w-xs relative pr-12  flex items-center gap-2 hover:bg-gray-800 transition-colors'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Get started
          </button>
          </a>
          <a href="https://github.com/mk0dz/antinature">
          <button className='bg-black text-white p-2 text-md max-w-xs relative pr-12 flex items-center gap-2 hover:bg-gray-800 transition-colors'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Github
          </button>
          </a>
        </div>
        <div className="relative">
          <pre className="bg-black text-white p-2 text-xl max-w-sm relative pr-12 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
            <code>pip install antinature</code>
            <button 
              onClick={handleCopy}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 transition-all duration-300 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-md"
              aria-label="Copy to clipboard"
              title="Copy to clipboard"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" />
                  <path d="M7 8a1 1 0 012 0v.5a1 1 0 01-1 1H7v1a1 1 0 001 1h.5a1 1 0 010 2h-2a1 1 0 01-1-1v-5a1 1 0 011-1h.5z" />
                  <path d="M12 8a1 1 0 00-1 1v.5h1.5a1 1 0 110 2H11v1a1 1 0 102 0v-3.5a1 1 0 00-1-1z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
              )}
            </button>
          </pre>
          {copied && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-md animate-fade-in-out">
              Copied!
            </div>
          )}
        </div>

        <pre className="realtive overflow-auto">
        <Image 
          src="/codep.png"
          alt="pemplate"
          width={630}
          height={180}
          className='items-end justify-end p-4'
        />
        </pre>
        <Image 
          src="/qiskitcite.svg"
          alt="Paul Dirac"
          width={290}
          height={29}
          className='items-end justify-end p-2'
        />
      </div>

      {/* Paul Dirac Image (Left Side on Desktop, Bottom on Mobile) */}
      <div className="relative w-full md:w-1/3 h-64 md:h-auto">
        <Image 
          src="/dirac.jpg"
          alt="Paul Dirac"
          layout="fill"
          objectFit="cover"
        />
      </div>

    </div>
  )
}



