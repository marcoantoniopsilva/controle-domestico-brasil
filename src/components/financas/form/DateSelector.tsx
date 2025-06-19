
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
  label?: string;
}

const DateSelector: React.FC<DateSelectorProps> = ({ 
  date, 
  onDateChange,
  label = "Data" 
}) => {
  // Função simplificada para lidar com mudanças de data
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    console.log(`[DateSelector] Data selecionada: ${selectedDate.toDateString()}`);
    
    // Usar a data diretamente sem modificações
    onDateChange(selectedDate);
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="data">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            id="data"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
            locale={ptBR}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateSelector;
