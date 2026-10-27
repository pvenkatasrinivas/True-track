// Shown when a list has nothing in it. "children" can hold a button or link.
function EmptyState({ title, text, children }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export default EmptyState;
