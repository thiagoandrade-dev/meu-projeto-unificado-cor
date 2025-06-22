
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  FileText,
  Users,
  GavelIcon,
  LogOut,
  Settings,
  Bell,
  BarChart3,
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/userService";
import Logo from "./Logo";

const AdminSidebar = ({ isMobile, setMobileOpen }: { isMobile?: boolean; setMobileOpen?: (open: boolean) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogout = () => {
    userService.logout();
    setUser(null);
    navigate("/");
  };

  const closeMobileMenu = () => {
    if (isMobile && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const links = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/admin",
    },
    {
      title: "Imóveis",
      icon: <Home size={20} />,
      href: "/admin/imoveis",
    },
    {
      title: "Contratos",
      icon: <FileText size={20} />,
      href: "/admin/contratos",
    },
    {
      title: "Jurídico",
      icon: <GavelIcon size={20} />,
      href: "/admin/juridico",
    },
    {
      title: "Usuários",
      icon: <Users size={20} />,
      href: "/admin/usuarios",
    },
    {
      title: "Relatórios",
      icon: <BarChart3 size={20} />,
      href: "/admin/relatorios",
    },
    {
      title: "Notificações",
      icon: <Bell size={20} />,
      href: "/admin/notificacoes",
    },
    {
      title: "Configurações",
      icon: <Settings size={20} />,
      href: "/admin/configuracoes",
    },
  ];

  return (
    <div className="bg-primary text-white h-full flex flex-col">
      <div className="p-4 border-b border-primary-light/30">
        <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
          <Logo variant="white" className="scale-90" />
        </Link>
      </div>

      <div className="flex flex-col flex-1 py-4">
        <div className="space-y-1 px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                location.pathname === link.href
                  ? "bg-secondary text-primary-dark font-medium"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              {link.icon}
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-primary-light/30">
        <Button
          variant="ghost"
          className="w-full text-white/80 hover:text-white hover:bg-white/10 justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
