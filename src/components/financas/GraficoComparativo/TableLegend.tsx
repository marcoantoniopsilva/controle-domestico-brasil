
const TableLegend = () => {
  return (
    <div className="mt-4 flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
        <span>Dentro do orçamento</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
        <span>Acima do orçamento</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
        <span>Sem gastos</span>
      </div>
    </div>
  );
};

export default TableLegend;
