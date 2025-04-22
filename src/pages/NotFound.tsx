
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! Não conseguimos encontrar a página que você está procurando.
        </p>
        <Link to="/">
          <Button>Voltar para a página inicial</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
