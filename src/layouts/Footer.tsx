// src/layouts/Footer.tsx

export const Footer = () => {
  return (
    <div className="relative">
      {/* Dekorator: czarny trójkąt przyklejony do prawej krawędzi od góry */}
      <svg
        className="absolute -top-6 right-0 h-8 w-16 text-black"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon fill="currentColor" points="100,0 100,50 0,50" />
      </svg>

      <footer className="bg-black py-8 text-center text-sm text-white">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 Your App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
