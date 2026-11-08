export function FloatingContactButtons() {
  return (
    <nav
      aria-label="Contact us"
      className="fixed bottom-24 right-4 z-50 flex flex-col gap-3 lg:bottom-5 lg:right-5"
    >
      <a
        href="https://wa.me/8801314181695"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#25D366]"
      >
        <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8" fill="none">
          <path
            d="M16 3.5a12.25 12.25 0 0 0-10.6 18.4L3.8 28l6.3-1.6A12.25 12.25 0 1 0 16 3.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M11.2 9.5c-.4 0-.8.2-1.1.6-.4.5-1 1.3-1 2.7s1 3.1 1.2 3.3c.2.3 2 3.2 5 4.3 2.5 1 3 .8 3.6.7.5-.1 1.8-.8 2-1.5.3-.7.3-1.3.2-1.5-.1-.2-.4-.3-.8-.5l-2.2-1c-.3-.1-.6-.2-.8.2l-.9 1.1c-.2.2-.4.3-.8.1a9 9 0 0 1-2.7-1.7 10 10 0 0 1-1.9-2.4c-.2-.4 0-.6.2-.8l.6-.7c.2-.2.3-.4.4-.7.1-.2 0-.5 0-.7l-1-2.3c-.2-.5-.5-.6-.8-.6h-.6Z"
            fill="currentColor"
          />
        </svg>
      </a>
      <a
        href="https://www.facebook.com/messages/t/1327876683751464"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on Messenger"
        title="Message us on Messenger"
        className="grid size-14 place-items-center rounded-full bg-[#0084FF] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0084FF]"
      >
        <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8" fill="none">
          <path
            d="M16 3.5c-7.2 0-13 5.4-13 12 0 3.6 1.8 6.8 4.7 9v4l4.3-2.4c1.3.4 2.6.6 4 .6 7.2 0 13-5.4 13-12s-5.8-12-13-12Z"
            fill="currentColor"
          />
          <path d="m9 18 5-5 3 3 6-5-5 8-3-3-6 2Z" fill="#0084FF" />
        </svg>
      </a>
    </nav>
  );
}
