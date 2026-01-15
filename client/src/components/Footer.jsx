import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-gray-950/95 backdrop-blur-sm border-t border-gray-800 mt-12 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo size="sm" showText={true} />
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SocialStack. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors font-medium">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors font-medium">Terms</a>
            <a href="#" className="text-gray-400 hover:text-gray-200 transition-colors font-medium">About</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
