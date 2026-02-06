import { RegisterRequest } from "@/types/auth"
import { toast } from "sonner"

export function registerValidate(data : RegisterRequest) : boolean {
    if (data.password !== data.confirmPassword) {
          toast.error('Ocorreu um erro ao registrar !',{ description : 'As senhas não coincidem'})
          return false;
        }
    
        if (data.password.length < 6) {
          toast.error('Ocorreu um erro ao registrar !',{ description : 'A senha deve ter pelo menos 6 caracteres'})
          return false;
        }
    return true;
}

