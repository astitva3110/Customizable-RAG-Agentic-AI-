import { Button } from "@/components/ui/button";
import { Bot, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Disco
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#workflows" className="text-foreground hover:text-primary transition-colors">
              Workflows
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <a href="#features" className="text-foreground hover:text-primary transition-colors px-3 py-2">
                Features
              </a>
              <a href="#workflows" className="text-foreground hover:text-primary transition-colors px-3 py-2">
                Workflows
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors px-3 py-2">
                About
              </a>
              {isLoggedIn ? (
                <div className="flex flex-col space-y-2 px-3">
                  <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                    Dashboard
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="px-3">
                  <Button className="w-full" onClick={() => window.location.href = '/login'}>
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;