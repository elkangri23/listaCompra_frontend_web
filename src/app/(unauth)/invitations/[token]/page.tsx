import Link from 'next/link'
import React from 'react'

export default function PublicInvitationPage() {
  // In a real application, you would extract the token from the URL
  // and use it to fetch invitation details. For now, we use static content.
  const inviterName = "Sophia";
  const listName = "Grocery Run";

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="layout-content-container flex w-full max-w-5xl flex-col lg:flex-row lg:gap-8">
            <div className="flex flex-1 flex-col items-center justify-center p-4 lg:p-8">
              <div className="bg-cover bg-center flex w-full flex-col items-stretch justify-end rounded-xl pt-[180px] sm:pt-[220px] lg:h-[400px] lg:pt-0" style={{ backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%), url(\"https://lh3.googleusercontent.com/aida-public/AB6AXuBAh0OJ0deAWkijjb5VbgppPb9Bw8WCRRHNbu4dkL6hbyyHaMU0oKjTj8kdmEtME1-ULh2dRWa0y1J24gnBvgPCtTj8kdmEtME1-ULh2dRWa0y1J24gnBvgPCtJuc7XydOVomvt6vIvg84QNW_7f7giFUgd7i11ywh4xmvt6UiTXvvlUn5wIWUGrfT7ode25f0IIrcSAXlciDbz5aLm1H05qg8p1sk8yKIQlkcpc7Lb-t8CBltj7vexA1hzH8FtTtRetQVx-hWSlO-p9Jn7wjLs69NwIyMRhY0dL1MG_MjV60rlkO\')', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="flex w-full items-end justify-between gap-4 p-4">
                  <div className="flex flex-1 flex-col gap-2 max-w-[500px]">
                    <p className="text-white tracking-light text-3xl sm:text-4xl font-black leading-tight">
                      {inviterName} has invited you to collaborate on the shopping list &apos;{listName}&apos;
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-center justify-start p-4 lg:p-8">
              <div className="w-full rounded-xl bg-gray-50 p-6 shadow-lg h-[300px] overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto scroll-smooth">
                  <p className="text-gray-800 text-lg font-bold leading-normal mb-4">Sneak peek at your list items:</p>
                  <ul className="space-y-3 text-gray-700 text-base font-medium">
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Milk
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Eggs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Bread
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Butter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Apples
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Chicken Breast
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Spinach
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Yogurt
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>Coffee
                    </li>
                  </ul>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent rounded-b-xl pointer-events-none"></div>
              </div>
              <p className="text-gray-600 text-sm font-medium leading-normal mt-4 text-center">Scroll to see a preview of the items on the list. Many more await!</p>
            </div>
          </div>
          <div className="flex px-4 py-6 justify-center w-full max-w-lg mt-8">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#4387f4] text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg hover:bg-blue-600 transition-colors duration-200 transform hover:scale-105">
              <span className="truncate">Accept and Join</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}