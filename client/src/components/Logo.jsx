import { Link } from "react-router-dom";

const Logo = ({ size = "md", showText = true, className = "" }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-4xl"
  };

  const logoContent = (
    <div className={`inline-flex items-center gap-0 ${className}`}>
      <img
        src="/logo.png"
        alt="SocialStack Logo"
        className={`${sizes[size]} object-contain`}
        onError={(e) => {
          // Try SVG if PNG doesn't exist
          if (e.target.src.endsWith('.png')) {
            e.target.src = '/logo.svg';
            return;
          }
          // Fallback if logo doesn't exist - show text only
          e.target.style.display = "none";
        }}
      />
      {showText && (
        <span
          className={`${textSizes[size]} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent -ml-1 tracking-tight`}
        >
          SocialStack
        </span>
      )}
    </div>
  );

  return showText ? (
    <Link to="/" className="inline-flex items-center gap-0 hover:opacity-80 transition">
      {logoContent}
    </Link>
  ) : (
    logoContent
  );
};

export default Logo;
