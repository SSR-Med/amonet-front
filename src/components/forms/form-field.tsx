import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label>
        {label}
        {required && <span className="text-coral-alerta ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-coral-alerta mt-1">{error}</p>
      )}
    </div>
  );
}
