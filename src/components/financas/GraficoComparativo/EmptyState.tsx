
const EmptyState = () => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p>Nenhum dado de despesa encontrado a partir de março 2025.</p>
      <p className="text-sm mt-2">Adicione algumas transações de despesa para ver a evolução dos gastos.</p>
    </div>
  );
};

export default EmptyState;
