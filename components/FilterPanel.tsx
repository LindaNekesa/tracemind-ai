
"use client";

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="flex gap-4 mb-4">
      <select name="status" onChange={handleChange} className="border p-2 rounded">
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>

      <select name="priority" onChange={handleChange} className="border p-2 rounded">
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}